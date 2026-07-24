const categoryService = require('../services/category.service');
const { notifyUpdate } = require('../utils/events');


class CategoryController {
  async getAll(req, res) {
    try { res.json({ success: true, data: await categoryService.getAll() }); }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }
  async create(req, res) {
    try { 
      const data = await categoryService.create(req.body);
      notifyUpdate('categories');
      res.status(201).json({ success: true, data }); 
    }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }
  async update(req, res) {
    try { 
      const data = await categoryService.update(req.params.id, req.body);
      notifyUpdate('categories');
      res.json({ success: true, data }); 
    }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }
  async delete(req, res) {
    try { 
      await categoryService.delete(req.params.id); 
      notifyUpdate('categories');
      res.json({ success: true, message: 'Deleted' }); 
    }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }
}

module.exports = new CategoryController();
