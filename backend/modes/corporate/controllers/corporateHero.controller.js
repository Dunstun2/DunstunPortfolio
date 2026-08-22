const heroService = require('../services/hero.service');

class CorporateHeroController {
  async getAll(req, res) {
    try {
      const data = await heroService.getAll();
      res.json({ success: true, data });
    } catch (e) {
      res.status(500).json({ success: false, message: e.message });
    }
  }

  async getPublished(req, res) {
    try {
      const data = await heroService.getPublished();
      res.json({ success: true, data });
    } catch (e) {
      res.status(500).json({ success: false, message: e.message });
    }
  }

  async createOrUpdate(req, res) {
    try {
      const data = await heroService.createOrUpdate(req.body);
      res.json({ success: true, data });
    } catch (e) {
      res.status(500).json({ success: false, message: e.message });
    }
  }

  async update(req, res) {
    try {
      const data = await heroService.update(req.params.id, req.body);
      res.json({ success: true, data });
    } catch (e) {
      res.status(500).json({ success: false, message: e.message });
    }
  }
}

module.exports = new CorporateHeroController();
