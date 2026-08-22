const blogCommentService = require('../services/blogComment.service');
const { notifyUpdate } = require('../../../utils/events');

class BlogCommentController {
  async getByPost(req, res) {
    try {
      const data = await blogCommentService.getByPost(req.params.postId);
      res.json({ success: true, data });
    }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }

  async getAllForAdmin(req, res) {
    try {
      const data = await blogCommentService.getAllForAdmin(req.query);
      res.json({ success: true, data });
    }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }

  async getStats(req, res) {
    try {
      const data = await blogCommentService.getStats();
      res.json({ success: true, data });
    }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }

  async create(req, res) {
    try {
      const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      const data = await blogCommentService.create(req.body, ipAddress);
      
      // Notify admin there's a new pending comment
      notifyUpdate('blogComments');
      
      res.status(201).json({ success: true, data, message: 'Comment submitted and pending approval.' });
    }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }

  async createAuthorReply(req, res) {
    try {
      // Pull author details from the authenticated user
      const authorDetails = {
        name: req.user.name || 'Admin',
        email: req.user.email
      };
      
      const data = await blogCommentService.createAuthorReply(req.body, authorDetails);
      
      notifyUpdate('blogComments');
      notifyUpdate('blog'); // To refresh comments on the public post page
      
      res.status(201).json({ success: true, data });
    }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }

  async changeStatus(req, res) {
    try {
      const data = await blogCommentService.changeStatus(req.params.id, req.body.status);
      notifyUpdate('blogComments');
      notifyUpdate('blog'); // Public comments might change visibility
      res.json({ success: true, data });
    }
    catch (e) { res.status(400).json({ success: false, message: e.message }); }
  }

  async delete(req, res) {
    try {
      await blogCommentService.delete(req.params.id);
      notifyUpdate('blogComments');
      notifyUpdate('blog');
      res.json({ success: true, message: 'Deleted' });
    }
    catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }
}

module.exports = new BlogCommentController();
