const experienceService = require('../services/experience.service');
const { notifyUpdate } = require('../utils/events');


class ExperienceController {
  async getAll(req, res) {
    try { res.json({ success: true, data: await experienceService.getAll() }); }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }

  async create(req, res) {
    try { 
      const data = await experienceService.create(req.body);
      notifyUpdate('experience');
      res.status(201).json({ success: true, data }); 
    }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }

  async update(req, res) {
    try { 
      const data = await experienceService.update(req.params.id, req.body);
      notifyUpdate('experience');
      res.json({ success: true, data }); 
    }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }

  async delete(req, res) {
    try { 
      await experienceService.delete(req.params.id); 
      notifyUpdate('experience');
      res.json({ success: true, message: 'Deleted' }); 
    }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }
}

module.exports = new ExperienceController();
