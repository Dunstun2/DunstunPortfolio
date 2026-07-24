const blogService = require('../services/blog.service');
const { notifyUpdate } = require('../utils/events');
const documentParser = require('../utils/documentParser');
const path = require('path');

class BlogController {
  async getAll(req, res) {
    try { res.json({ success: true, data: await blogService.getAll() }); }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }

  async getPublished(req, res) {
    try { res.json({ success: true, data: await blogService.getPublished(req.query) }); }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }

  async getFeatured(req, res) {
    try { res.json({ success: true, data: await blogService.getFeatured() }); }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }

  async getBySlug(req, res) {
    try {
      const post = await blogService.getBySlug(req.params.slug);
      if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
      res.json({ success: true, data: post });
    }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }

  async create(req, res) {
    try {
      const data = await blogService.create(req.body);
      notifyUpdate('blog');
      res.status(201).json({ success: true, data });
    }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }

  async update(req, res) {
    try {
      const data = await blogService.update(req.params.id, req.body);
      notifyUpdate('blog');
      res.json({ success: true, data });
    }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }

  async changeStatus(req, res) {
    try {
      const data = await blogService.changeStatus(req.params.id, req.body.status);
      notifyUpdate('blog');
      res.json({ success: true, data });
    }
    catch (e) { res.status(400).json({ success: false, message: e.message }); }
  }

  async delete(req, res) {
    try {
      await blogService.delete(req.params.id);
      notifyUpdate('blog');
      res.json({ success: true, message: 'Deleted' });
    }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }

  async importDocument(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }
      const ext = path.extname(req.file.originalname).toLowerCase();
      let result;
      if (ext === '.docx') {
        result = await documentParser.parseDocx(req.file.buffer);
      } else if (ext === '.pdf') {
        result = await documentParser.parsePdf(req.file.buffer);
      } else {
        return res.status(400).json({ success: false, message: 'Unsupported file format. Please upload a .docx or .pdf file.' });
      }
      res.json({ success: true, data: result });
    } catch (e) {
      res.status(500).json({ success: false, message: e.message });
    }
  }
}

module.exports = new BlogController();
