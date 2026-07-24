const Joi = require('joi');

const certificationSchemas = {
  create: {
    body: Joi.object({
      certification_name: Joi.string().required().min(3).max(255),
      slug: Joi.string().optional().allow('').pattern(/^[a-z0-9-]*$/),
      issuing_organization: Joi.string().required().min(2).max(255),
      category: Joi.string().optional().allow('').max(100),
      issue_date: Joi.string().optional().allow('').max(50),
      expiration_date: Joi.string().optional().allow('').max(50),
      does_not_expire: Joi.boolean().default(false),
      credential_id: Joi.string().optional().allow('').max(255),
      credential_url: Joi.string().optional().allow(''),
      verification_url: Joi.string().optional().allow(''),
      short_description: Joi.string().optional().allow('').max(1000),
      skills_covered: Joi.string().optional().allow(''),
      certificate_image: Joi.string().optional().allow(''),
      certificate_document: Joi.string().optional().allow(''),
      featured: Joi.boolean().default(false),
      status: Joi.string().valid('draft', 'published', 'archived').default('draft'),
      order: Joi.number().integer().min(0).default(0),
    }),
  },

  update: {
    params: Joi.object({
      id: Joi.string().uuid().required(),
    }),
    body: Joi.object({
      certification_name: Joi.string().min(3).max(255).optional(),
      slug: Joi.string().allow('').pattern(/^[a-z0-9-]*$/).optional(),
      issuing_organization: Joi.string().min(2).max(255).optional(),
      category: Joi.string().allow('').max(100).optional(),
      issue_date: Joi.string().allow('').max(50).optional(),
      expiration_date: Joi.string().allow('').max(50).optional(),
      does_not_expire: Joi.boolean().optional(),
      credential_id: Joi.string().allow('').max(255).optional(),
      credential_url: Joi.string().allow('').optional(),
      verification_url: Joi.string().allow('').optional(),
      short_description: Joi.string().allow('').max(1000).optional(),
      skills_covered: Joi.string().allow('').optional(),
      certificate_image: Joi.string().allow('').optional(),
      certificate_document: Joi.string().allow('').optional(),
      featured: Joi.boolean().optional(),
      status: Joi.string().valid('draft', 'published', 'archived').optional(),
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
      limit: Joi.number().integer().min(1).max(100).default(100),
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

module.exports = certificationSchemas;
