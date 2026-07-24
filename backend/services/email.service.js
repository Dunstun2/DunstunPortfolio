const nodemailer = require('nodemailer');

/**
 * Email Service for sending reply emails to contact form visitors.
 * Uses Nodemailer with Gmail SMTP (App Password) by default.
 * Configure via environment variables in .env
 */
class EmailService {
  constructor() {
    this.transporter = null;
  }

  /**
   * Initialize the transporter lazily on first use
   */
  _getTransporter() {
    if (this.transporter) return this.transporter;

    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!user || !pass) {
      throw new Error(
        'Email not configured. Set SMTP_USER and SMTP_PASS in your .env file. ' +
        'For Gmail, use an App Password: https://myaccount.google.com/apppasswords'
      );
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    return this.transporter;
  }

  /**
   * Send a reply email to the visitor who submitted the contact form.
   * @param {Object} opts
   * @param {string} opts.to - Visitor's email address
   * @param {string} opts.visitorName - Visitor's name
   * @param {string} opts.originalSubject - Original message subject
   * @param {string} opts.originalMessage - Original message content
   * @param {string} opts.replyBody - The reply message text
   * @param {string} opts.senderName - Portfolio owner's display name
   */
  async sendReply({ to, visitorName, originalSubject, originalMessage, replyBody, senderName }) {
    const transporter = this._getTransporter();
    const fromAddress = process.env.SMTP_USER;
    const displayName = senderName || process.env.SENDER_NAME || 'Portfolio Owner';

    const subject = `Re: ${originalSubject || 'Your Message'}`;

    // Build a clean HTML email
    const htmlBody = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f8fafc; border-radius: 12px;">
        <div style="background: linear-gradient(135deg, #1e3a8a, #1d4ed8); padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
          <h2 style="color: #ffffff; margin: 0; font-size: 20px;">${displayName}</h2>
          <p style="color: #93c5fd; margin: 4px 0 0; font-size: 13px;">Reply to your message</p>
        </div>
        <div style="background: #ffffff; padding: 28px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="color: #334155; margin: 0 0 8px; font-size: 15px;">Hi <strong>${visitorName}</strong>,</p>
          <div style="color: #1e293b; font-size: 15px; line-height: 1.7; white-space: pre-wrap; margin: 16px 0 24px;">${replyBody}</div>
          
          <div style="background: #f1f5f9; border-left: 4px solid #94a3b8; padding: 16px; margin: 32px 0 16px; border-radius: 0 8px 8px 0;">
            <p style="color: #64748b; font-size: 12px; font-weight: bold; text-transform: uppercase; margin: 0 0 8px; letter-spacing: 0.5px;">On ${new Date().toLocaleDateString()}, you wrote:</p>
            <div style="color: #475569; font-size: 14px; font-style: italic; white-space: pre-wrap; margin: 0;">"${originalMessage}"</div>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="color: #94a3b8; font-size: 12px; margin: 0; padding-bottom: 4px;"><strong>Reply from:</strong> Dunstun Wambutsi's Portfolio</p>
          <p style="color: #94a3b8; font-size: 12px; margin: 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"${displayName}" <${fromAddress}>`,
      to,
      subject,
      text: `Hi ${visitorName},\n\n${replyBody}\n\n---\nReply from: Dunstun Wambutsi's Portfolio\nDate: ${new Date().toLocaleDateString()}\n\nOn ${new Date().toLocaleDateString()}, you wrote:\n"${originalMessage}"`,
      html: htmlBody,
    });

    return info;
  }
}

module.exports = new EmailService();
