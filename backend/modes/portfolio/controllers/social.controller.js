const socialService = require('../services/social.service');
const { notifyUpdate } = require('../../../utils/events');


class SocialController {
  async getAll(req, res) {
    try { res.json({ success: true, data: await socialService.getAll() }); }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }
  async create(req, res) {
    try { 
      const data = await socialService.create(req.body);
      notifyUpdate('social');
      res.status(201).json({ success: true, data }); 
    }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }
  async update(req, res) {
    try { 
      const data = await socialService.update(req.params.id, req.body);
      notifyUpdate('social');
      res.json({ success: true, data }); 
    }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }
  async delete(req, res) {
    try { 
      await socialService.delete(req.params.id); 
      notifyUpdate('social');
      res.json({ success: true, message: 'Deleted' }); 
    }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }
}

module.exports = new SocialController();
