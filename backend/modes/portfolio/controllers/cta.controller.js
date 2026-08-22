const ctaService = require('../services/cta.service');
const { notifyUpdate } = require('../../../utils/events');


class CTAController {
  async getAll(req, res) {
    try { res.json({ success: true, data: await ctaService.getAll() }); }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }
  async create(req, res) {
    try { 
      const data = await ctaService.create(req.body);
      notifyUpdate('cta');
      res.status(201).json({ success: true, data }); 
    }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }
  async update(req, res) {
    try { 
      const data = await ctaService.update(req.params.id, req.body);
      notifyUpdate('cta');
      res.json({ success: true, data }); 
    }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }
  async delete(req, res) {
    try { 
      await ctaService.delete(req.params.id); 
      notifyUpdate('cta');
      res.json({ success: true, message: 'Deleted' }); 
    }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }
}

module.exports = new CTAController();
