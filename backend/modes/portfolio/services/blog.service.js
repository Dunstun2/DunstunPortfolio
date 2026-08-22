const { BlogPost } = require('../models');
const { Op } = require('sequelize');

class BlogService {
  async getAll() {
    return await BlogPost.findAll({ order: [['created_at', 'DESC']] });
  }

  async getPublished(options = {}) {
    const where = { status: 'published' };
    
    if (options.category) where.category = options.category;
    if (options.search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${options.search}%` } },
        { excerpt: { [Op.like]: `%${options.search}%` } },
        { content: { [Op.like]: `%${options.search}%` } }
      ];
    }
    // Note: To search tags within a JSON array in SQLite, it can be tricky.
    // For now, basic search is on text fields.

    return await BlogPost.findAll({ 
      where,
      order: [['published_at', 'DESC'], ['created_at', 'DESC']],
      limit: options.limit ? parseInt(options.limit) : undefined,
      offset: options.offset ? parseInt(options.offset) : undefined,
    });
  }

  async getFeatured() {
    const DESIRED = 3;

    // 1. Fetch explicitly featured posts
    const featuredPosts = await BlogPost.findAll({ 
      where: { status: 'published', featured: true },
      order: [['published_at', 'DESC']]
    });

    if (featuredPosts.length >= DESIRED) {
      return featuredPosts.slice(0, DESIRED);
    }

    // 2. Fill remaining slots with other published posts
    const needed = DESIRED - featuredPosts.length;
    const featuredIds = featuredPosts.map(p => p.id);

    const additionalPosts = await BlogPost.findAll({
      where: {
        status: 'published',
        ...(featuredIds.length ? { id: { [Op.notIn]: featuredIds } } : {}),
      },
      order: [['published_at', 'DESC'], ['created_at', 'DESC']],
      limit: needed,
    });

    return [...featuredPosts, ...additionalPosts];
  }

  async getBySlug(slug) {
    const post = await BlogPost.findOne({ where: { slug, status: 'published' } });
    if (post) {
      // Increment views
      post.views = (post.views || 0) + 1;
      await post.save();
    }
    return post;
  }

  async getById(id) {
    return await BlogPost.findByPk(id);
  }

  _calculateReadingTime(text) {
    if (!text) return 1;
    const wordsPerMinute = 200;
    const noOfWords = text.replace(/<[^>]*>?/gm, '').split(/\s+/).length;
    return Math.ceil(noOfWords / wordsPerMinute) || 1;
  }

  async create(data) {
    // Auto-generate slug from title if not provided
    if (!data.slug && data.title) {
      let baseSlug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      let slug = baseSlug;
      let counter = 1;
      while (await BlogPost.findOne({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      data.slug = slug;
    }
    
    data.reading_time = this._calculateReadingTime(data.content);
    
    if (data.status === 'published' && !data.published_at) {
      data.published_at = new Date();
    }
    
    return await BlogPost.create(data);
  }

  async update(id, data) {
    const post = await BlogPost.findByPk(id);
    if (!post) throw new Error('Post not found');
    
    if (data.title && !data.slug) {
      let baseSlug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      let slug = baseSlug;
      let counter = 1;
      while (await BlogPost.findOne({ where: { slug, id: { [Op.ne]: id } } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      data.slug = slug;
    }

    if (data.content) {
      data.reading_time = this._calculateReadingTime(data.content);
    }
    
    // Auto-set published_at if changing status to published
    if (data.status === 'published' && post.status !== 'published' && !post.published_at) {
      data.published_at = new Date();
    }

    return await post.update(data);
  }

  async changeStatus(id, newStatus) {
    const validStatuses = ['draft', 'review', 'scheduled', 'published', 'archived'];
    if (!validStatuses.includes(newStatus)) throw new Error('Invalid status');

    const post = await BlogPost.findByPk(id);
    if (!post) throw new Error('Post not found');

    if (newStatus === 'published' && post.status !== 'published' && !post.published_at) {
      post.published_at = new Date();
    }

    post.status = newStatus;
    await post.save();
    return post;
  }

  async delete(id) {
    const post = await BlogPost.findByPk(id);
    if (!post) throw new Error('Post not found');
    await post.destroy();
    return true;
  }

  async likeBySlug(slug) {
    const post = await BlogPost.findOne({ where: { slug, status: 'published' } });
    if (!post) throw new Error('Post not found');
    post.likes = (post.likes || 0) + 1;
    await post.save();
    return { likes: post.likes };
  }

  async rateBySlug(slug, rating) {
    if (!rating || rating < 1 || rating > 5) throw new Error('Rating must be between 1 and 5');
    const post = await BlogPost.findOne({ where: { slug, status: 'published' } });
    if (!post) throw new Error('Post not found');
    post.rating_total = (post.rating_total || 0) + rating;
    post.rating_count = (post.rating_count || 0) + 1;
    await post.save();
    return {
      rating_total: post.rating_total,
      rating_count: post.rating_count,
      rating_average: post.rating_count > 0 ? (post.rating_total / post.rating_count).toFixed(1) : 0,
    };
  }
}

module.exports = new BlogService();
