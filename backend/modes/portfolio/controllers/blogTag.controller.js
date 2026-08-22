const blogTagService = require('../services/blogTag.service');
const { notifyUpdate } = require('../../../utils/events');

class BlogTagController {
  async getAll(req, res) {
    try { res.json({ success: true, data: await blogTagService.getAll() }); }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }

  async create(req, res) {
    try {
      const data = await blogTagService.create(req.body);
      notifyUpdate('blogTags');
      res.status(201).json({ success: true, data });
    }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }

  async update(req, res) {
    try {
      const data = await blogTagService.update(req.params.id, req.body);
      notifyUpdate('blogTags');
      res.json({ success: true, data });
    }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }

  async delete(req, res) {
    try {
      await blogTagService.delete(req.params.id);
      notifyUpdate('blogTags');
      res.json({ success: true, message: 'Deleted' });
    }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }
}

module.exports = new BlogTagController();
