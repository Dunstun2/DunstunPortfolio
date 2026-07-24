const eventService = require('../services/event.service');
const { notifyUpdate } = require('../utils/events');

class EventController {
  async getAll(req, res) {
    try { res.json({ success: true, data: await eventService.getAll() }); }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }

  async getPublished(req, res) {
    try { res.json({ success: true, data: await eventService.getPublished(req.query) }); }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }

  async getPublishedBySlug(req, res) {
    try { 
      const event = await eventService.getPublishedBySlug(req.params.slug);
      if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
      res.json({ success: true, data: event }); 
    }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }

  async create(req, res) {
    try { 
      const data = await eventService.create(req.body);
      notifyUpdate('events');
      res.status(201).json({ success: true, data }); 
    }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }

  async update(req, res) {
    try { 
      const data = await eventService.update(req.params.id, req.body);
      notifyUpdate('events');
      res.json({ success: true, data }); 
    }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }

  async changeStatus(req, res) {
    try { 
      const data = await eventService.changeStatus(req.params.id, req.body.status);
      notifyUpdate('events');
      res.json({ success: true, data }); 
    }
    catch (e) { res.status(400).json({ success: false, message: e.message }); }
  }

  async delete(req, res) {
    try { 
      await eventService.delete(req.params.id); 
      notifyUpdate('events');
      res.json({ success: true, message: 'Deleted' }); 
    }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }
}

module.exports = new EventController();
