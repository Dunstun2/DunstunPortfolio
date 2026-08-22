const { BlogComment, BlogPost } = require('../models');
const { Op } = require('sequelize');

class BlogCommentService {
  async getByPost(postId) {
    // Only fetch approved comments for public view
    // Group them hierarchically on the frontend or backend
    const comments = await BlogComment.findAll({
      where: { post_id: postId, status: 'approved' },
      order: [['created_at', 'ASC']],
    });
    
    // Nest replies
    const nested = [];
    const map = {};
    
    // First pass: initialize all items
    comments.forEach(comment => {
      map[comment.id] = { ...comment.toJSON(), replies: [] };
    });
    
    // Second pass: nest replies
    comments.forEach(comment => {
      if (comment.parent_id && map[comment.parent_id]) {
        map[comment.parent_id].replies.push(map[comment.id]);
      } else {
        nested.push(map[comment.id]);
      }
    });
    
    return nested;
  }

  async getAllForAdmin(options = {}) {
    const where = {};
    if (options.status) where.status = options.status;
    if (options.post_id) where.post_id = options.post_id;
    if (options.search) {
      where[Op.or] = [
        { author_name: { [Op.like]: `%${options.search}%` } },
        { author_email: { [Op.like]: `%${options.search}%` } },
        { content: { [Op.like]: `%${options.search}%` } },
      ];
    }

    return await BlogComment.findAll({
      where,
      include: [{ model: BlogPost, as: 'post', attributes: ['title', 'slug'] }],
      order: [['created_at', 'DESC']],
      limit: options.limit ? parseInt(options.limit) : undefined,
      offset: options.offset ? parseInt(options.offset) : undefined,
    });
  }

  async getStats() {
    const stats = await BlogComment.findAll({
      attributes: ['status', [BlogComment.sequelize.fn('COUNT', BlogComment.sequelize.col('id')), 'count']],
      group: ['status']
    });
    
    const result = { pending: 0, approved: 0, rejected: 0, spam: 0, archived: 0, total: 0 };
    stats.forEach(s => {
      const status = s.get('status');
      const count = parseInt(s.get('count'));
      result[status] = count;
      result.total += count;
    });
    
    return result;
  }

  async create(data, ipAddress = null) {
    const post = await BlogPost.findByPk(data.post_id);
    if (!post) throw new Error('Post not found');

    const commentData = {
      post_id: data.post_id,
      parent_id: data.parent_id || null,
      author_name: data.author_name,
      author_email: data.author_email,
      author_website: data.author_website,
      content: data.content,
      ip_address: ipAddress,
      status: 'pending', // By default, all public comments are pending
    };

    return await BlogComment.create(commentData);
  }

  async createAuthorReply(data, authorDetails) {
    const post = await BlogPost.findByPk(data.post_id);
    if (!post) throw new Error('Post not found');

    const commentData = {
      post_id: data.post_id,
      parent_id: data.parent_id || null,
      author_name: authorDetails.name || 'Author',
      author_email: authorDetails.email || 'author@portfolio.com',
      content: data.content,
      is_author_reply: true,
      status: 'approved', // Author replies are pre-approved
    };

    return await BlogComment.create(commentData);
  }

  async changeStatus(id, newStatus) {
    const validStatuses = ['pending', 'approved', 'rejected', 'spam', 'archived'];
    if (!validStatuses.includes(newStatus)) throw new Error('Invalid status');

    const comment = await BlogComment.findByPk(id);
    if (!comment) throw new Error('Comment not found');

    comment.status = newStatus;
    return await comment.save();
  }

  async delete(id) {
    const comment = await BlogComment.findByPk(id);
    if (!comment) throw new Error('Comment not found');
    await comment.destroy();
    return true;
  }
}

module.exports = new BlogCommentService();
