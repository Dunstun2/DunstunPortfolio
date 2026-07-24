const contactService = require('../services/contact.service');
const { notifyUpdate } = require('../utils/events');


class ContactController {
  async getAll(req, res) {
    try { res.json({ success: true, data: await contactService.getAll() }); }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }

  async create(req, res) {
    try { 
      // This is hit by public visitors submitting the contact form
      res.status(201).json({ success: true, data: await contactService.create(req.body) }); 
    }
    catch (e) { res.status(400).json({ success: false, message: e.message }); }
  }

  async changeStatus(req, res) {
    try { 
      const data = await contactService.changeStatus(req.params.id, req.body.status);
      notifyUpdate('contact');
      res.json({ success: true, data }); 
    }
    catch (e) { res.status(400).json({ success: false, message: e.message }); }
  }

  async reply(req, res) {
    try {
      const { replyBody, senderName } = req.body;
      if (!replyBody) {
        return res.status(400).json({ success: false, message: 'Reply body is required' });
      }
      const result = await contactService.reply(req.params.id, replyBody, senderName);
      notifyUpdate('contact');
      res.json({ 
        success: true, 
        emailSent: result.emailSent, 
        whatsappLink: result.whatsappLink, 
        data: result.message 
      });
    }
    catch (e) { res.status(400).json({ success: false, message: e.message }); }
  }

  async delete(req, res) {
    try { 
      await contactService.delete(req.params.id); 
      notifyUpdate('contact');
      res.json({ success: true, message: 'Deleted' }); 
    }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }
}

module.exports = new ContactController();

