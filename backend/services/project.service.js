const { Project } = require('../models');
const { getPaginationParams, formatPaginatedResponse } = require('../utils/pagination');
const { AppError } = require('../middleware/errorHandler.middleware');

class ProjectService {
  async getAll(query = {}) {
    const { page, limit, offset } = getPaginationParams(query);

    const { count, rows } = await Project.findAndCountAll({
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });

    return formatPaginatedResponse({
      page,
      limit,
      totalItems: count,
      data: rows,
    });
  }

  async getPublished(options = {}) {
    const { page, limit, offset } = getPaginationParams(options);
    const where = { status: 'published' };

    if (options.category) where.category = options.category;
    if (options.project_type) where.project_type = options.project_type;

    const { count, rows } = await Project.findAndCountAll({
      where,
      order: [['published_at', 'DESC'], ['created_at', 'DESC']],
      limit,
      offset,
    });

    return formatPaginatedResponse({
      page,
      limit,
      totalItems: count,
      data: rows,
    });
  }

  async getRecentPublished(limit = 3) {
    return await Project.findAll({
      where: { status: 'published' },
      order: [['published_at', 'DESC'], ['created_at', 'DESC']],
      limit: Math.min(limit, 20), // Cap at 20
    });
  }

  async getPublishedBySlug(slug) {
    const project = await Project.findOne({ where: { slug, status: 'published' } });
    if (!project) {
      throw new AppError('Project not found', 404);
    }
    return project;
  }

  async getById(id) {
    const project = await Project.findByPk(id);
    if (!project) {
      throw new AppError('Project not found', 404);
    }
    return project;
  }

  async create(data) {
    // Auto-generate slug from title if not provided
    if (!data.slug && data.title) {
      data.slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'project';
    }

    // Check for duplicate slug and resolve with counter if needed
    let baseSlug = data.slug;
    let existing = await Project.findOne({ where: { slug: data.slug } });
    if (existing) {
      let counter = 1;
      while (await Project.findOne({ where: { slug: `${baseSlug}-${counter}` } })) {
        counter++;
      }
      data.slug = `${baseSlug}-${counter}`;
    }

    return await Project.create({ ...data, status: data.status || 'draft' });
  }

  async update(id, data) {
    const project = await Project.findByPk(id);
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    const { status, published_at, ...updateData } = data;

    // Auto-update slug if title changes
    if (updateData.title && !updateData.slug) {
      updateData.slug = updateData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    // Check for duplicate slug if slug is being updated
    if (updateData.slug && updateData.slug !== project.slug) {
      const existing = await Project.findOne({ where: { slug: updateData.slug } });
      if (existing) {
        throw new AppError('A project with this slug already exists', 409);
      }
    }

    return await project.update(updateData);
  }

  async changeStatus(id, newStatus) {
    const validStatuses = ['draft', 'published', 'archived'];
    if (!validStatuses.includes(newStatus)) {
      throw new AppError('Invalid status', 400);
    }

    const project = await Project.findByPk(id);
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    if (newStatus === 'published' && project.status !== 'published') {
      project.published_at = new Date();
    }

    project.status = newStatus;
    await project.save();
    return project;
  }

  async delete(id) {
    const project = await Project.findByPk(id);
    if (!project) {
      throw new AppError('Project not found', 404);
    }
    await project.destroy();
    return true;
  }
}

module.exports = new ProjectService();
