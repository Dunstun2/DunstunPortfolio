const navigationService = require('../services/navigation.service');
const { notifyUpdate } = require('../../../utils/events');


class NavigationController {
  async getAll(req, res) {
    try { res.json({ success: true, data: await navigationService.getAll() }); }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }

  async getActive(req, res) {
    try { res.json({ success: true, data: await navigationService.getActive() }); }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }

  async create(req, res) {
    try { 
      const data = await navigationService.create(req.body);
      notifyUpdate('navigation');
      res.status(201).json({ success: true, data }); 
    }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }

  async update(req, res) {
    try { 
      const data = await navigationService.update(req.params.id, req.body);
      notifyUpdate('navigation');
      res.json({ success: true, data }); 
    }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }

  async delete(req, res) {
    try { 
      await navigationService.delete(req.params.id); 
      notifyUpdate('navigation');
      res.json({ success: true, message: 'Deleted' }); 
    }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }
}

module.exports = new NavigationController();
