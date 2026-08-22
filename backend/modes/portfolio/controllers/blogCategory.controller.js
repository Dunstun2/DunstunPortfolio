const blogCategoryService = require('../services/blogCategory.service');
const { notifyUpdate } = require('../../../utils/events');

class BlogCategoryController {
  async getAll(req, res) {
    try { res.json({ success: true, data: await blogCategoryService.getAll() }); }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }

  async getActive(req, res) {
    try { res.json({ success: true, data: await blogCategoryService.getActive() }); }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }

  async create(req, res) {
    try {
      const data = await blogCategoryService.create(req.body);
      notifyUpdate('blogCategories');
      res.status(201).json({ success: true, data });
    }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }

  async update(req, res) {
    try {
      const data = await blogCategoryService.update(req.params.id, req.body);
      notifyUpdate('blogCategories');
      res.json({ success: true, data });
    }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }

  async delete(req, res) {
    try {
      await blogCategoryService.delete(req.params.id);
      notifyUpdate('blogCategories');
      res.json({ success: true, message: 'Deleted' });
    }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }
}

module.exports = new BlogCategoryController();
