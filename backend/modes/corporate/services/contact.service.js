const { ContactMessage } = require('../models');
const emailService = require('../../portfolio/services/email.service');

class ContactService {
  async getAll() {
    return await ContactMessage.findAll({ order: [['created_at', 'DESC']] });
  }

  async getById(id) {
    return await ContactMessage.findByPk(id);
  }

  async create(data) {
    // Visitor sends a message, it is unread by default
    return await ContactMessage.create({ ...data, status: 'unread' });
  }

  async changeStatus(id, newStatus) {
    const validStatuses = ['unread', 'read', 'replied'];
    if (!validStatuses.includes(newStatus)) throw new Error('Invalid status');

    const message = await ContactMessage.findByPk(id);
    if (!message) throw new Error('Message not found');

    message.status = newStatus;
    await message.save();
    return message;
  }

  /**
   * Reply to a contact message:
   *  1. Sends an email to the visitor using the email they provided
   *  2. If the visitor included a phone number, generates a WhatsApp deep link
   *  3. Marks the message status as 'replied'
   */
  async reply(id, replyBody, senderName) {
    const message = await ContactMessage.findByPk(id);
    if (!message) throw new Error('Message not found');

    // 1. Send email reply
    let emailSent = false;
    try {
      await emailService.sendReply({
        to: message.email,
        visitorName: message.name,
        originalSubject: message.subject,
        originalMessage: message.message,
        replyBody,
        senderName,
      });
      emailSent = true;
    } catch (err) {
      console.error('Failed to send email reply:', err.message);
      // Don't throw — still return WhatsApp link if available
    }

    // 2. Generate WhatsApp link if phone number exists
    let whatsappLink = null;
    if (message.phone) {
      // Strip non-digits from phone for WhatsApp API
      let cleanPhone = message.phone.replace(/[^0-9]/g, '');
      // Format Kenyan local numbers starting with 0 to 254
      if (cleanPhone.startsWith('0')) {
        cleanPhone = '254' + cleanPhone.substring(1);
      }
      const waMessage = encodeURIComponent(
        `Hi *${message.name}*,\n\n${replyBody}\n\n---\n*Reply from:* Dunstun Wambutsi's Portfolio\n*Date:* ${new Date().toLocaleDateString()}\n\nOn *${new Date(message.created_at).toLocaleDateString()}*, you wrote regarding _"${message.subject || 'Your inquiry'}"_:\n"${message.message}"`
      );
      whatsappLink = `https://wa.me/${cleanPhone}?text=${waMessage}`;
    }

    // 3. Mark as replied
    message.status = 'replied';
    await message.save();

    return { emailSent, whatsappLink, message };
  }

  async delete(id) {
    const message = await ContactMessage.findByPk(id);
    if (!message) throw new Error('Message not found');
    await message.destroy();
    return true;
  }
}

module.exports = new ContactService();

