const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for 465, false for other ports
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
              
              <p class="warning">Please change your password after your first login for security reasons.</p>
              
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