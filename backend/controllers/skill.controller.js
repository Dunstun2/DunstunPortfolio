const skillService = require('../services/skill.service');
const { notifyUpdate } = require('../utils/events');


class SkillController {
  async getAll(req, res) {
    try { res.json({ success: true, data: await skillService.getAll() }); }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }

  async create(req, res) {
    try { 
      const data = await skillService.create(req.body);
      notifyUpdate('skills');
      res.status(201).json({ success: true, data }); 
    }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }

  async update(req, res) {
    try { 
      const data = await skillService.update(req.params.id, req.body);
      notifyUpdate('skills');
      res.json({ success: true, data }); 
    }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }

  async delete(req, res) {
    try { 
      await skillService.delete(req.params.id); 
      notifyUpdate('skills');
      res.json({ success: true, message: 'Deleted' }); 
    }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }
}

module.exports = new SkillController();
