const { Service } = require('../models');
const { getPaginationParams, formatPaginatedResponse } = require('../../../utils/pagination');
const { AppError } = require('../../../middleware/errorHandler.middleware');
const { Op } = require('sequelize');

class ServiceService {
  /**
   * Get all services (admin) with pagination
   */
  async getAll(query = {}) {
    const { page, limit, offset } = getPaginationParams(query);
    
    const { count, rows } = await Service.findAndCountAll({ 
      order: [['display_order', 'ASC'], ['created_at', 'DESC']],
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

  /**
   * Get all published services (public services page)
   */
  async getPublished(query = {}) {
    const { page, limit, offset } = getPaginationParams(query);
    
    const { count, rows } = await Service.findAndCountAll({ 
      where: { status: 'published' },
      order: [['display_order', 'ASC'], ['published_at', 'DESC']],
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

  /**
   * Get featured services (max 3 for homepage)
   * If there are less than 3 featured services, it fills the remaining
   * slots with other published services to ensure 3 are shown.
   */
  async getFeatured() {
    // 1. Fetch explicitly featured services
    const featuredServices = await Service.findAll({ 
      where: { 
        status: 'published',
        featured: true,
      },
      order: [['display_order', 'ASC'], ['published_at', 'DESC']],
      limit: 3,
    });

    // 2. If we have 3, return them
    if (featuredServices.length >= 3) {
      return featuredServices;
    }

    // 3. If less than 3, fetch additional published services to fill the gap
    const needed = 3 - featuredServices.length;
    const featuredIds = featuredServices.map(s => s.id);

    const additionalServices = await Service.findAll({
      where: {
        status: 'published',
        id: { [Op.notIn]: featuredIds }
      },
      order: [['display_order', 'ASC'], ['published_at', 'DESC']],
      limit: needed,
    });

    return [...featuredServices, ...additionalServices];
  }

  /**
   * Get single published service by slug
   */
  async getPublishedBySlug(slug) {
    const service = await Service.findOne({ 
      where: { 
        slug, 
        status: 'published' 
      } 
    });
    
    if (!service) {
      throw new AppError('Service not found', 404);
    }
    
    return service;
  }

  /**
   * Get service by ID (admin)
   */
  async getById(id) {
    const service = await Service.findByPk(id);
    
    if (!service) {
      throw new AppError('Service not found', 404);
    }
    
    return service;
  }

  /**
   * Create new service
   */
  async create(data) {
    // Auto-generate slug from name if not provided
    if (!data.slug && data.name) {
      data.slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
    
    // Check for duplicate slug
    const existing = await Service.findOne({ where: { slug: data.slug } });
    if (existing) {
      throw new AppError('A service with this slug already exists', 409);
    }
    
    // If featured is true, check if we already have 3 featured services
    if (data.featured) {
      const featuredCount = await Service.count({ 
        where: { featured: true, status: 'published' } 
      });
      
      if (featuredCount >= 3) {
        throw new AppError('Maximum of 3 featured services allowed. Please unfeature another service first.', 400);
      }
    }
    
    return await Service.create({ 
      ...data, 
      status: data.status || 'draft' 
    });
  }

  /**
   * Update service
   */
  async update(id, data) {
    const service = await Service.findByPk(id);
    
    if (!service) {
      throw new AppError('Service not found', 404);
    }
    
    const { status, published_at, ...updateData } = data;
    
    // Auto-update slug if name changes
    if (updateData.name && !updateData.slug) {
      updateData.slug = updateData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
    
    // Check for duplicate slug if slug is being updated
    if (updateData.slug && updateData.slug !== service.slug) {
      const existing = await Service.findOne({ where: { slug: updateData.slug } });
      if (existing) {
        throw new AppError('A service with this slug already exists', 409);
      }
    }
    
    // If setting featured to true, validate max 3 featured services
    if (updateData.featured === true && !service.featured) {
      const featuredCount = await Service.count({ 
        where: { 
          featured: true, 
          status: 'published',
          id: { [Op.ne]: id }
        } 
      });
      
      if (featuredCount >= 3) {
        throw new AppError('Maximum of 3 featured services allowed. Please unfeature another service first.', 400);
      }
    }
    
    return await service.update(updateData);
  }

  /**
   * Change service status
   */
  async changeStatus(id, newStatus) {
    const validStatuses = ['draft', 'published', 'archived'];
    if (!validStatuses.includes(newStatus)) {
      throw new AppError('Invalid status', 400);
    }

    const service = await Service.findByPk(id);
    
    if (!service) {
      throw new AppError('Service not found', 404);
    }

    // Set published_at timestamp when publishing
    if (newStatus === 'published' && service.status !== 'published') {
      service.published_at = new Date();
    }

    service.status = newStatus;
    await service.save();
    
    return service;
  }

  /**
   * Toggle featured status
   */
  async toggleFeatured(id) {
    const service = await Service.findByPk(id);
    
    if (!service) {
      throw new AppError('Service not found', 404);
    }

    // If trying to set featured to true, check the limit
    if (!service.featured) {
      const featuredCount = await Service.count({ 
        where: { 
          featured: true, 
          status: 'published',
          id: { [Op.ne]: id }
        } 
      });
      
      if (featuredCount >= 3) {
        throw new AppError('Maximum of 3 featured services allowed. Please unfeature another service first.', 400);
      }
    }

    service.featured = !service.featured;
    await service.save();
    
    return service;
  }

  /**
   * Delete service
   */
  async delete(id) {
    const service = await Service.findByPk(id);
    
    if (!service) {
      throw new AppError('Service not found', 404);
    }
    
    await service.destroy();
    return true;
  }

  /**
   * Reorder services
   */
  async reorder(orderData) {
    // orderData should be an array like: [{ id: 'uuid', display_order: 1 }, ...]
    const updates = orderData.map(item => 
      Service.update(
        { display_order: item.display_order },
        { where: { id: item.id } }
      )
    );
    
    await Promise.all(updates);
    return { message: 'Services reordered successfully' };
  }
}

module.exports = new ServiceService();
