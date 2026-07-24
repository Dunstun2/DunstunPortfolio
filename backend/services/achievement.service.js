const { Achievement } = require('../models');
const { getPaginationParams, formatPaginatedResponse } = require('../utils/pagination');
const { AppError } = require('../middleware/errorHandler.middleware');
const { Op } = require('sequelize');

class AchievementService {
  async getAll(query = {}) {
    const { page, limit, offset } = getPaginationParams(query);
    const { count, rows } = await Achievement.findAndCountAll({
      order: [['order', 'ASC'], ['created_at', 'DESC']],
      limit,
      offset,
    });

    return formatPaginatedResponse({ page, limit, totalItems: count, data: rows });
  }

  async getPublished(options = {}) {
    const { page, limit, offset } = getPaginationParams(options);
    const where = { status: 'published' };

    // Category filter
    if (options.category) where.category = options.category;

    // Search functionality
    if (options.search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${options.search}%` } },
        { organization: { [Op.like]: `%${options.search}%` } },
        { short_description: { [Op.like]: `%${options.search}%` } },
        { full_description: { [Op.like]: `%${options.search}%` } },
      ];
    }

    const { count, rows } = await Achievement.findAndCountAll({
      where,
      order: [['featured', 'DESC'], ['order', 'ASC'], ['date', 'DESC']],
      limit,
      offset,
    });

    return formatPaginatedResponse({ page, limit, totalItems: count, data: rows });
  }

  async getBySlug(slug) {
    const item = await Achievement.findOne({ where: { slug, status: 'published' } });
    if (!item) throw new AppError('Achievement not found', 404);
    return item;
  }

  async getById(id) {
    const item = await Achievement.findByPk(id);
    if (!item) throw new AppError('Achievement not found', 404);
    return item;
  }

  async create(data) {
    if (!data.slug && data.title) {
      data.slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    const existing = await Achievement.findOne({ where: { slug: data.slug } });
    if (existing) throw new AppError('An achievement with this slug already exists', 409);
    return await Achievement.create({ ...data, status: data.status || 'draft' });
  }

  async update(id, data) {
    const item = await Achievement.findByPk(id);
    if (!item) throw new AppError('Achievement not found', 404);

    if (data.title && !data.slug) {
      data.slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    if (data.slug && data.slug !== item.slug) {
      const existing = await Achievement.findOne({ where: { slug: data.slug } });
      if (existing) throw new AppError('An achievement with this slug already exists', 409);
    }

    return await item.update(data);
  }

  async changeStatus(id, newStatus) {
    const validStatuses = ['draft', 'published', 'archived'];
    if (!validStatuses.includes(newStatus)) throw new AppError('Invalid status', 400);
    const item = await Achievement.findByPk(id);
    if (!item) throw new AppError('Achievement not found', 404);
    if (newStatus === 'published' && item.status !== 'published') item.published_at = new Date();
    item.status = newStatus;
    await item.save();
    return item;
  }

  async delete(id) {
    const item = await Achievement.findByPk(id);
    if (!item) throw new AppError('Achievement not found', 404);
    await item.destroy();
    return true;
  }

  async getCategories() {
    const results = await Achievement.findAll({
      attributes: ['category'],
      where: {
        status: 'published',
        category: { [Op.ne]: null }
      },
      group: ['category'],
      raw: true,
    });
    return results.map(r => r.category).filter(Boolean);
  }
}

module.exports = new AchievementService();
