const aboutService = require('../services/about.service');
const { notifyUpdate } = require('../utils/events');


class AboutController {
  async getAll(req, res) {
    try { res.json({ success: true, data: await aboutService.getAll() }); }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }

  async getPublished(req, res) {
    try { 
      const about = await aboutService.getPublished();
      if (!about) return res.status(404).json({ success: false, message: 'No published about section found' });
      res.json({ success: true, data: about }); 
    }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }

  async create(req, res) {
    try { 
      const data = await aboutService.create(req.body);
      notifyUpdate('about');
      res.status(201).json({ success: true, data }); 
    }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }

  async update(req, res) {
    try { 
      const data = await aboutService.update(req.params.id, req.body);
      notifyUpdate('about');
      res.json({ success: true, data }); 
    }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }

  async changeStatus(req, res) {
    try { 
      const data = await aboutService.changeStatus(req.params.id, req.body.status);
      notifyUpdate('about');
      res.json({ success: true, data }); 
    }
    catch (e) { res.status(400).json({ success: false, message: e.message }); }
  }

  async delete(req, res) {
    try { 
      await aboutService.delete(req.params.id); 
      notifyUpdate('about');
      res.json({ success: true, message: 'Deleted' }); 
    }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }
}

module.exports = new AboutController();
