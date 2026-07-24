const tagService = require('../services/tag.service');
const { notifyUpdate } = require('../utils/events');


class TagController {
  async getAll(req, res) {
    try { res.json({ success: true, data: await tagService.getAll() }); }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }
  async create(req, res) {
    try { 
      const data = await tagService.create(req.body);
      notifyUpdate('tags');
      res.status(201).json({ success: true, data }); 
    }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }
  async update(req, res) {
    try { 
      const data = await tagService.update(req.params.id, req.body);
      notifyUpdate('tags');
      res.json({ success: true, data }); 
    }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }
  async delete(req, res) {
    try { 
      await tagService.delete(req.params.id); 
      notifyUpdate('tags');
      res.json({ success: true, message: 'Deleted' }); 
    }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }
}

module.exports = new TagController();
