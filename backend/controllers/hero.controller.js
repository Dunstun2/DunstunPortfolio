const heroService = require('../services/hero.service');
const { notifyUpdate } = require('../utils/events');


class HeroController {
  async getAll(req, res) {
    try { res.json({ success: true, data: await heroService.getAll() }); }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }

  async getPublished(req, res) {
    try { 
      // Using the new method that fetches socials if enabled
      const hero = await heroService.getPublishedWithSocials();
      if (!hero) return res.status(404).json({ success: false, message: 'No active published hero found' });
      res.json({ success: true, data: hero }); 
    }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }

  async create(req, res) {
    try { 
      const data = await heroService.createOrUpdate(req.body);
      notifyUpdate('hero');
      res.status(200).json({ success: true, data }); 
    }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }

  async update(req, res) {
    try { 
      const data = await heroService.update(req.params.id, req.body);
      notifyUpdate('hero');
      res.json({ success: true, data }); 
    }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }

  async changeStatus(req, res) {
    try {
      const { status } = req.body;
      const data = await heroService.changeStatus(req.params.id, status);
      notifyUpdate('hero');
      res.json({ success: true, data });
    } catch (e) { res.status(400).json({ success: false, message: e.message }); }
  }

  async setActive(req, res) {
    try {
      const { is_active } = req.body;
      const data = await heroService.setActive(req.params.id, is_active);
      notifyUpdate('hero');
      res.json({ success: true, data });
    } catch (e) { res.status(400).json({ success: false, message: e.message }); }
  }

  async delete(req, res) {
    try { 
      await heroService.delete(req.params.id); 
      notifyUpdate('hero');
      res.json({ success: true, message: 'Deleted' }); 
    }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }
}

module.exports = new HeroController();
