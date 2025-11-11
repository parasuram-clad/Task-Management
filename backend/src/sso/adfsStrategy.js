const SamlStrategy = require('passport-saml').Strategy;

function configureAdfsStrategy(passport) {
  if (!process.env.ADFS_SSO_URL || !process.env.ADFS_ISSUER || !process.env.ADFS_CERT) {
    console.warn('ADFS SSO not configured - missing ADFS_SSO_URL / ADFS_ISSUER / ADFS_CERT');
    return;
  }

  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user, done) => done(null, user));

  const samlOptions = {
    callbackUrl: '/api/sso/adfs/callback',
    entryPoint: process.env.ADFS_SSO_URL,
    issuer: process.env.ADFS_ISSUER,
    cert: process.env.ADFS_CERT,
    identifierFormat: null,
    validateInResponseTo: true,
    disableRequestedAuthnContext: true,
  };

  passport.use(
    'adfs',
    new SamlStrategy(samlOptions, (profile, done) => done(null, profile))
  );
}

module.exports = configureAdfsStrategy;
