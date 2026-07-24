const Joi = require('joi');

const achievementSchemas = {
  create: {
    body: Joi.object({
      title: Joi.string().required().min(3).max(255),
      slug: Joi.string().optional().allow('').pattern(/^[a-z0-9-]*$/),
      category: Joi.string().optional().allow('').max(100),
      short_description: Joi.string().optional().allow('').max(500),
      full_description: Joi.string().optional().allow(''),
      date: Joi.string().optional().allow('').max(50),
      organization: Joi.string().optional().allow('').max(255),
      location: Joi.string().optional().allow('').max(255),
      role: Joi.string().optional().allow('').max(255),
      impact: Joi.string().optional().allow(''),
      why_it_matters: Joi.string().optional().allow(''),
      published_at: Joi.date().optional().allow(null),
      featured_image: Joi.string().optional().allow(''),
      media: Joi.array().items(Joi.string()).optional().default([]),
      certificate_file: Joi.string().optional().allow(''),
      video_url: Joi.string().optional().allow(''),
      verification_url: Joi.string().optional().allow(''),
      external_url: Joi.string().optional().allow(''),
      status: Joi.string().valid('draft', 'published', 'archived').default('draft'),
      featured: Joi.boolean().default(false),
      order: Joi.number().integer().min(0).default(0),
    }),
  },

  update: {
    params: Joi.object({
      id: Joi.string().uuid().required(),
    }),
    body: Joi.object({
      title: Joi.string().min(3).max(255).optional(),
      slug: Joi.string().allow('').pattern(/^[a-z0-9-]*$/).optional(),
      category: Joi.string().allow('').max(100).optional(),
      short_description: Joi.string().allow('').max(500).optional(),
      full_description: Joi.string().allow('').optional(),
      date: Joi.string().allow('').max(50).optional(),
      organization: Joi.string().allow('').max(255).optional(),
      location: Joi.string().allow('').max(255).optional(),
      role: Joi.string().allow('').max(255).optional(),
      impact: Joi.string().allow('').optional(),
      why_it_matters: Joi.string().allow('').optional(),
      published_at: Joi.date().optional().allow(null),
      featured_image: Joi.string().allow('').optional(),
      media: Joi.array().items(Joi.string()).optional(),
      certificate_file: Joi.string().allow('').optional(),
      video_url: Joi.string().allow('').optional(),
      verification_url: Joi.string().allow('').optional(),
      external_url: Joi.string().allow('').optional(),
      status: Joi.string().valid('draft', 'published', 'archived').optional(),
      featured: Joi.boolean().optional(),
      order: Joi.number().integer().min(0).optional(),
    }),
  },

  changeStatus: {
    params: Joi.object({
      id: Joi.string().uuid().required(),
    }),
    body: Joi.object({
      status: Joi.string().valid('draft', 'published', 'archived').required(),
    }),
  },

  getById: {
    params: Joi.object({
      id: Joi.string().uuid().required(),
    }),
  },

  getBySlug: {
    params: Joi.object({
      slug: Joi.string().required(),
    }),
  },

  getPublished: {
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      category: Joi.string().optional(),
      search: Joi.string().optional(),
    }),
  },

  getAll: {
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
    }),
  },

  delete: {
    params: Joi.object({
      id: Joi.string().uuid().required(),
    }),
  },
};

module.exports = achievementSchemas;
