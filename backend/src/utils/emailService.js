const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify transporter configuration
transporter.verify(function (error, success) {
  if (error) {
    console.log('SMTP configuration error:', error);
  } else {
    console.log('SMTP server is ready to take our messages');
  }
});

// Update the welcome email template in emailService.js

exports.sendEmployeeWelcomeEmail = async ({ email, name, employeeId, tempPassword, websiteLink }) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@yourcompany.com',
      to: email,
      subject: 'Welcome to Our Company - Your Account Details',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #007bff; color: white; padding: 20px; text-align: center; }
            .content { background: #f9f9f9; padding: 20px; }
            .credentials { background: white; padding: 15px; border-left: 4px solid #007bff; margin: 15px 0; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
            .warning { color: #dc3545; font-weight: bold; }
            .important-note { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Our Team!</h1>
            </div>
            <div class="content">
              <p>Dear ${name},</p>
              <p>We are excited to welcome you to our company! Your employee account has been created.</p>
              
              <div class="credentials">
                <h3>Your Login Credentials:</h3>
                <p><strong>Website:</strong> <a href="${websiteLink}">${websiteLink}</a></p>
                <p><strong>Employee ID:</strong> ${employeeId}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Temporary Password:</strong> ${tempPassword}</p>
              </div>
              
              <div class="important-note">
                <h4>🔐 Important First Login Instructions:</h4>
                <p><strong>1.</strong> Use the temporary password above for your first login</p>
                <p><strong>2.</strong> After entering your credentials, you'll be prompted to set a new permanent password</p>
                <p><strong>3.</strong> Choose a strong password that you haven't used before</p>
                <p><strong>4.</strong> Your new password must be at least 8 characters long</p>
              </div>
              
              <p class="warning">For security reasons, you must change your password on first login.</p>
              
              <p>If you have any questions or need assistance, please contact the HR department.</p>
              
              <p>Best regards,<br>HR Team</p>
            </div>
            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent to:', email, 'Message ID:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending welcome email to', email, ':', error);
    throw error;
  }
};

exports.sendPasswordResetOTP = async (email, otp, userName) => {
  const mailOptions = {
    from: process.env.SMTP_FROM || `"HR & Project Hub" <noreply@yourcompany.com>`,
    to: email,
    subject: 'Password Reset OTP - HR & Project Hub',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; }
          .otp-code { 
            font-size: 32px; 
            font-weight: bold; 
            color: #2563eb; 
            text-align: center; 
            margin: 20px 0;
            letter-spacing: 5px;
          }
          .footer { 
            margin-top: 30px; 
            padding-top: 20px; 
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #666;
          }
          .warning { 
            background: #fff3cd; 
            border: 1px solid #ffeaa7; 
            padding: 10px; 
            border-radius: 5px;
            margin: 15px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>HR & Project Hub</h1>
          </div>
          <div class="content">
            <h2>Password Reset Request</h2>
            <p>Hello <strong>${userName}</strong>,</p>
            <p>You requested to reset your password. Use the OTP below to verify your identity:</p>
            
            <div class="otp-code">${otp}</div>
            
            <div class="warning">
              <strong>Important:</strong> This OTP is valid for 10 minutes. Do not share this code with anyone.
            </div>
            
            <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
            
            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
              <p>&copy; ${new Date().getFullYear()} HR & Project Hub. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`OTP email sent to ${email}, Message ID:`, info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Failed to send OTP email');
  }
};