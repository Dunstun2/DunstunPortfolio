const Certification = require('../models/Certification');
const { Op } = require('sequelize');

const certificationService = {
  // Create a new certification
  async create(data) {
    // Auto-generate slug if not provided
    if (!data.slug && data.certification_name) {
      data.slug = data.certification_name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }
    return await Certification.create(data);
  },

  // Get all certifications with pagination
  async getAll(options = {}) {
    const { page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    const { rows: data, count: total } = await Certification.findAndCountAll({
      order: [['order', 'ASC'], ['created_at', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    return {
      data,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    };
  },

  // Get published certifications with optional filtering
  async getPublished(options = {}) {
    const { page = 1, limit = 100, category, search } = options;
    const offset = (page - 1) * limit;

    const where = { status: 'published' };

    // Filter by category
    if (category) {
      where.category = category;
    }

    // Search across multiple fields
    if (search) {
      where[Op.or] = [
        { certification_name: { [Op.like]: `%${search}%` } },
        { issuing_organization: { [Op.like]: `%${search}%` } },
        { short_description: { [Op.like]: `%${search}%` } },
        { skills_covered: { [Op.like]: `%${search}%` } },
      ];
    }

    const { rows: data, count: total } = await Certification.findAndCountAll({
      where,
      order: [['order', 'ASC'], ['issue_date', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    return {
      data,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    };
  },

  // Get unique categories
  async getCategories() {
    const certifications = await Certification.findAll({
      attributes: ['category'],
      where: {
        category: { [Op.ne]: null },
        status: 'published',
      },
      group: ['category'],
    });

    return certifications.map(c => c.category).filter(Boolean);
  },

  // Get by ID
  async getById(id) {
    const certification = await Certification.findByPk(id);
    if (!certification) throw new Error('Certification not found');
    return certification;
  },

  // Get by slug
  async getBySlug(slug) {
    const certification = await Certification.findOne({ where: { slug } });
    if (!certification) throw new Error('Certification not found');
    return certification;
  },

  // Update certification
  async update(id, data) {
    const certification = await this.getById(id);
    
    // Update slug if certification_name changed
    if (data.certification_name && !data.slug) {
      data.slug = data.certification_name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }
    
    await certification.update(data);
    return certification;
  },

  // Delete certification
  async delete(id) {
    const certification = await this.getById(id);
    await certification.destroy();
    return { message: 'Certification deleted successfully' };
  },

  // Change status
  async changeStatus(id, status) {
    const certification = await this.getById(id);
    await certification.update({ status });
    return certification;
  },

  // Get featured certifications
  async getFeatured() {
    const DESIRED = 6;

    // 1. Fetch explicitly featured certifications
    const featuredCerts = await Certification.findAll({
      where: { featured: true, status: 'published' },
      order: [['order', 'ASC'], ['issue_date', 'DESC']],
    });

    if (featuredCerts.length >= DESIRED) {
      return featuredCerts.slice(0, DESIRED);
    }

    // 2. Fill remaining slots with other published certifications
    const needed = DESIRED - featuredCerts.length;
    const featuredIds = featuredCerts.map(c => c.id);

    const additionalCerts = await Certification.findAll({
      where: {
        status: 'published',
        ...(featuredIds.length ? { id: { [Op.notIn]: featuredIds } } : {}),
      },
      order: [['order', 'ASC'], ['issue_date', 'DESC']],
      limit: needed,
    });

    return [...featuredCerts, ...additionalCerts];
  },
};

module.exports = certificationService;
