const refereeService = require('../services/referee.service');
const { notifyUpdate } = require('../../../utils/events');

class RefereeController {
  async getAll(req, res) {
    try {
      res.json({ success: true, data: await refereeService.getAll() });
    } catch (e) {
      res.status(500).json({ success: false, message: e.message });
    }
  }

  async getPublished(req, res) {
    try {
      res.json({ success: true, data: await refereeService.getPublished() });
    } catch (e) {
      res.status(500).json({ success: false, message: e.message });
    }
  }

  async create(req, res) {
    try {
      const data = await refereeService.create(req.body);
      notifyUpdate('referees');
      res.status(201).json({ success: true, data });
    } catch (e) {
      res.status(500).json({ success: false, message: e.message });
    }
  }

  async update(req, res) {
    try {
      const data = await refereeService.update(req.params.id, req.body);
      notifyUpdate('referees');
      res.json({ success: true, data });
    } catch (e) {
      res.status(500).json({ success: false, message: e.message });
    }
  }

  async changeStatus(req, res) {
    try {
      const data = await refereeService.changeStatus(req.params.id, req.body.status);
      notifyUpdate('referees');
      res.json({ success: true, data });
    } catch (e) {
      res.status(400).json({ success: false, message: e.message });
    }
  }

  async delete(req, res) {
    try {
      await refereeService.delete(req.params.id);
      notifyUpdate('referees');
      res.json({ success: true, message: 'Referee deleted' });
    } catch (e) {
      res.status(500).json({ success: false, message: e.message });
    }
  }
}

module.exports = new RefereeController();
