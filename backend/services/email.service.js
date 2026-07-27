const nodemailer = require('nodemailer');
const logger = require('../config/logger');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initialized = false;
  }

  get from() {
    const name = process.env.SENDER_NAME || 'Portfolio Admin';
    const email = process.env.SENDER_EMAIL || process.env.SMTP_USER || 'noreply@portfolio.com';
    return `"${name}" <${email}>`;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      // Create transporter based on environment variables
      if (process.env.EMAIL_SERVICE === 'gmail') {
        this.transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD, // App password, not regular password
          },
        });
      } else if (process.env.SMTP_HOST) {
        // Generic SMTP configuration
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS || process.env.SMTP_PASSWORD,
          },
        });
      } else {
        // Development mode - use ethereal email (fake SMTP)
        const testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
        logger.info('Email service using Ethereal (test mode)');
        logger.info(`Preview emails at: https://ethereal.email`);
      }

      // Verify connection
      await this.transporter.verify();
      this.initialized = true;
      logger.info('Email service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize email service:', error);
      this.transporter = null;
    }
  }

  async sendPasswordResetEmail(email, code, userName) {
    await this.initialize();

    if (!this.transporter) {
      logger.error('Email service not available. Code:', code);
      // Fallback to console logging
      console.log('===========================================');
      console.log('PASSWORD RESET CODE:');
      console.log(code);
      console.log('For user:', email);
      console.log('Expires in 1 hour.');
      console.log('===========================================');
      return false;
    }

    const mailOptions = {
      from: this.from,
      to: email,
      subject: `${code} is your password reset code`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; }
    .code-box { background: #f0f4ff; border: 2px solid #667eea; padding: 20px; border-radius: 10px; text-align: center; margin: 25px 0; }
    .code-digits { font-family: 'Courier New', monospace; font-size: 42px; font-weight: bold; letter-spacing: 12px; color: #333; }
    .footer { text-align: center; margin-top: 20px; color: #999; font-size: 12px; }
    .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 24px;">🔐 Password Reset</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${userName}</strong>,</p>
      
      <p>We received a request to reset your password. Enter this code on the reset page:</p>
      
      <div class="code-box">
        <div class="code-digits">${code}</div>
        <p style="margin: 10px 0 0; color: #666; font-size: 14px;">Your verification code</p>
      </div>
      
      <div class="warning">
        <strong>⚠️ Important:</strong>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>This code expires in <strong>1 hour</strong></li>
          <li>If you didn't request this, please ignore this email</li>
          <li>Never share this code with anyone</li>
        </ul>
      </div>
      
      <p style="margin-top: 30px;">
        Best regards,<br>
        <strong>${process.env.SENDER_NAME || 'Portfolio Admin'}</strong>
      </p>
    </div>
    <div class="footer">
      <p>This is an automated email. Please do not reply directly.</p>
      <p>&copy; ${new Date().getFullYear()} Portfolio Admin. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
      `,
      text: `
Hi ${userName},

We received a request to reset your password.

Your password reset code is: ${code}

Enter this code on the password reset page.

This code expires in 1 hour.

If you didn't request this, please ignore this email.

Best regards,
${process.env.SENDER_NAME || 'Portfolio Admin'}
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Password reset email sent to ${email}`);

      // Log preview URL for ethereal emails
      if (process.env.NODE_ENV === 'development' && info.messageId) {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
          logger.info(`Preview email: ${previewUrl}`);
        }
      }

      return true;
    } catch (error) {
      logger.error('Failed to send email:', error);
      // Fallback to console logging
      console.log('===========================================');
      console.log('EMAIL SEND FAILED - PASSWORD RESET CODE:');
      console.log(code);
      console.log('For user:', email);
      console.log('===========================================');
      return false;
    }
  }

  async sendWelcomeEmail(email, name) {
    await this.initialize();

    if (!this.transporter) {
      logger.warn('Email service not available for welcome email');
      return false;
    }

    const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/login`;

    const mailOptions = {
      from: this.from,
      to: email,
      subject: 'Welcome to Portfolio Admin',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; padding: 15px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">🎉 Welcome to Portfolio Admin</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${name}</strong>,</p>
      
      <p>Your admin account has been created successfully! You can now manage your portfolio content.</p>
      
      <div style="text-align: center;">
        <a href="${loginUrl}" class="button">Login to Admin Panel</a>
      </div>
      
      <p><strong>Your login email:</strong> ${email}</p>
      
      <p>If you have any questions, feel free to reach out to the administrator.</p>
      
      <p style="margin-top: 30px;">
        Best regards,<br>
        <strong>Portfolio Admin Team</strong>
      </p>
    </div>
  </div>
</body>
</html>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info(`Welcome email sent to ${email}`);
      return true;
    } catch (error) {
      logger.error('Failed to send welcome email:', error);
      return false;
    }
  }
}

module.exports = new EmailService();
