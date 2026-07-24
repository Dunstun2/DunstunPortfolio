const educationService = require('../services/education.service');
const { notifyUpdate } = require('../utils/events');


class EducationController {
  async getAll(req, res) {
    try { res.json({ success: true, data: await educationService.getAll() }); }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }

  async create(req, res) {
    try { 
      const data = await educationService.create(req.body);
      notifyUpdate('education');
      res.status(201).json({ success: true, data }); 
    }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }

  async update(req, res) {
    try { 
      const data = await educationService.update(req.params.id, req.body);
      notifyUpdate('education');
      res.json({ success: true, data }); 
    }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }

  async delete(req, res) {
    try { 
      await educationService.delete(req.params.id); 
      notifyUpdate('education');
      res.json({ success: true, message: 'Deleted' }); 
    }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }
}

module.exports = new EducationController();
