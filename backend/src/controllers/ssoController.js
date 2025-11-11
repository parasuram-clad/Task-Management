const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../db');

const DEFAULT_COMPANY_ID = parseInt(process.env.DEFAULT_COMPANY_ID || '1', 10);
const ADFS_SSO_PROVIDER_ID = parseInt(process.env.ADFS_SSO_PROVIDER_ID || '1', 10);

const generateAccessToken = (user) =>
  jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' }
  );

const generateRefreshToken = (user) =>
  jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d' }
  );

function extractAdfsClaims(profile) {
  const claims = profile || {};

  const upn =
    claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn'] ||
    claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
    claims.nameID;

  const email =
    claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
    claims.email ||
    claims.mail ||
    upn;

  const displayName =
    claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
    claims.displayName ||
    claims.cn ||
    upn;

  const windowsSid =
    claims['http://schemas.microsoft.com/ws/2008/06/identity/claims/primarysid'];
  const immutableId =
    claims['http://schemas.microsoft.com/LiveID/Federation/2008/05/ImmutableID'];

  return { upn, email, displayName, windowsSid, immutableId };
}

exports.handleAdfsCallback = async (req, res, next) => {
  const profile = req.user;
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'];

  const externalSubjectId = profile?.nameID || null;
  const assertionId = profile?.sessionIndex || null;

  const autoProvision = (process.env.SSO_AUTO_PROVISION || 'true').toLowerCase() === 'true';

  let auditId;
  try {
    const auditInsert = await db.query(
      `
      INSERT INTO sso_login_audit
        (user_id, sso_provider_id, login_at, ip_address, user_agent,
         auth_method, is_success, error_code, error_message,
         external_subject_id, assertion_id, raw_claims)
      VALUES (NULL, $1, NOW(), $2, $3, $4, FALSE, NULL, NULL, $5, $6, $7::jsonb)
      RETURNING id
      `,
      [
        ADFS_SSO_PROVIDER_ID,
        Array.isArray(ip) ? ip[0] : ip,
        userAgent || null,
        'saml',
        externalSubjectId,
        assertionId,
        JSON.stringify(profile || {}),
      ]
    );
    auditId = auditInsert.rows[0].id;
  } catch (e) {
    console.error('Failed to insert SSO audit', e);
  }

  const finishWithError = async (message) => {
    if (auditId) {
      await db.query(
        `UPDATE sso_login_audit SET is_success = FALSE, error_message = $1 WHERE id = $2`,
        [message, auditId]
      );
    }
    res.status(401).json({ message });
  };

  try {
    if (!profile || !profile.nameID) {
      return finishWithError('Missing SAML NameID in ADFS response');
    }

    const subjectId = profile.nameID;
    const { upn, email, displayName, windowsSid, immutableId } = extractAdfsClaims(profile);

    // 1. lookup by user_sso_identity
    const ssoRes = await db.query(
      `
      SELECT ua.id, ua.name, ua.email, ua.role, ua.is_active
      FROM user_sso_identity usi
      JOIN user_account ua ON ua.id = usi.user_id
      WHERE usi.sso_provider_id = $1 AND usi.subject_id = $2
      LIMIT 1
      `,
      [ADFS_SSO_PROVIDER_ID, subjectId]
    );

    let user = ssoRes.rows.length ? ssoRes.rows[0] : null;

    // 2. fallback email match
    if (!user && email) {
      const userRes = await db.query(
        `
        SELECT id, name, email, role, is_active
        FROM user_account
        WHERE company_id = $1 AND lower(email) = lower($2)
        LIMIT 1
        `,
        [DEFAULT_COMPANY_ID, email]
      );
      if (userRes.rows.length) user = userRes.rows[0];
    }

    // 3. auto-provision
    if (!user && autoProvision) {
      if (!email) {
        return finishWithError('Cannot auto-provision user without email claim');
      }

      const passwordHash = await bcrypt.hash(
        Math.random().toString(36).slice(2) + '!Dummy123',
        12
      );

      const insertUser = await db.query(
        `
        INSERT INTO user_account
          (company_id, employee_code, name, email, password_hash, role, is_active)
        VALUES ($1, NULL, $2, $3, $4, 'employee', TRUE)
        RETURNING id, name, email, role, is_active
        `,
        [DEFAULT_COMPANY_ID, displayName || email, email.toLowerCase(), passwordHash]
      );
      user = insertUser.rows[0];
    }

    if (!user) {
      return finishWithError('SSO login failed: user not found');
    }

    if (!user.is_active) {
      return finishWithError('SSO login failed: user inactive');
    }

    // 4. upsert user_sso_identity
    await db.query(
      `
      INSERT INTO user_sso_identity
        (user_id, sso_provider_id, subject_id, upn, email, display_name,
         windows_sid, immutable_id, is_primary, last_login_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE, NOW())
      ON CONFLICT (sso_provider_id, subject_id)
      DO UPDATE SET
        user_id = EXCLUDED.user_id,
        upn = EXCLUDED.upn,
        email = EXCLUDED.email,
        display_name = EXCLUDED.display_name,
        windows_sid = EXCLUDED.windows_sid,
        immutable_id = EXCLUDED.immutable_id,
        last_login_at = EXCLUDED.last_login_at
      `,
      [user.id, ADFS_SSO_PROVIDER_ID, subjectId, upn, email, displayName, windowsSid, immutableId]
    );

    // 5. mark audit success
    if (auditId) {
      await db.query(
        `UPDATE sso_login_audit
         SET is_success = TRUE, user_id = $1, error_message = NULL
         WHERE id = $2`,
        [user.id, auditId]
      );
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res
      .cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000,
      })
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        accessToken,
        sso: {
          provider: 'adfs',
          upn,
          email,
          displayName,
        },
      });
  } catch (err) {
    console.error('Error in ADFS SSO callback', err);
    if (auditId) {
      await db.query(
        `UPDATE sso_login_audit
         SET is_success = FALSE, error_message = $1
         WHERE id = $2`,
        [err.message, auditId]
      );
    }
    next(err);
  }
};
