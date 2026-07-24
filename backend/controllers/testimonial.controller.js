const testimonialService = require('../services/testimonial.service');
const { notifyUpdate } = require('../utils/events');


class TestimonialController {
  async getAll(req, res) {
    try { res.json({ success: true, data: await testimonialService.getAll() }); }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }

  async getPublished(req, res) {
    try { res.json({ success: true, data: await testimonialService.getPublished() }); }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }

  async create(req, res) {
    try { 
      const data = await testimonialService.create(req.body);
      notifyUpdate('testimonials');
      res.status(201).json({ success: true, data }); 
    }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }

  async submitPublic(req, res) {
    try {
      const data = await testimonialService.submitPublic(req.body);
      res.status(201).json({ success: true, message: 'Thank you! Your feedback has been submitted for review.', data });
    }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }

  async update(req, res) {
    try { 
      const data = await testimonialService.update(req.params.id, req.body);
      notifyUpdate('testimonials');
      res.json({ success: true, data }); 
    }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }

  async changeStatus(req, res) {
    try { 
      const data = await testimonialService.changeStatus(req.params.id, req.body.status);
      notifyUpdate('testimonials');
      res.json({ success: true, data }); 
    }
    catch (e) { res.status(400).json({ success: false, message: e.message }); }
  }

  async delete(req, res) {
    try { 
      await testimonialService.delete(req.params.id); 
      notifyUpdate('testimonials');
      res.json({ success: true, message: 'Deleted' }); 
    }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }
}

module.exports = new TestimonialController();
