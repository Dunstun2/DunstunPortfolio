const Joi = require('joi');

const createServiceSchema = {
  body: Joi.object({
    name: Joi.string().min(2).max(200).required().messages({
      'string.min': 'Service name must be at least 2 characters',
      'string.max': 'Service name must not exceed 200 characters',
      'any.required': 'Service name is required',
    }),
    slug: Joi.string().min(1).max(200).pattern(/^[a-z0-9-]+$/).messages({
      'string.pattern.base': 'Slug must contain only lowercase letters, numbers, and hyphens',
    }),
    description: Joi.string().min(10).required().messages({
      'string.min': 'Description must be at least 10 characters',
      'any.required': 'Description is required',
    }),
    image_url: Joi.string().uri().allow('', null).messages({
      'string.uri': 'Image URL must be a valid URL',
    }),
    video_url: Joi.string().uri().allow('', null).messages({
      'string.uri': 'Video URL must be a valid URL',
    }),
    price: Joi.string().max(100).allow('', null).messages({
      'string.max': 'Price must not exceed 100 characters',
    }),
    features: Joi.array().items(Joi.string()).default([]),
    external_link: Joi.string().allow('', null),
    featured: Joi.boolean().default(false),
    status: Joi.string().valid('draft', 'published', 'archived').default('draft'),
    display_order: Joi.number().integer().min(0).default(0),
  }),
};

const updateServiceSchema = {
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    name: Joi.string().min(2).max(200).messages({
      'string.min': 'Service name must be at least 2 characters',
      'string.max': 'Service name must not exceed 200 characters',
    }),
    slug: Joi.string().min(1).max(200).pattern(/^[a-z0-9-]+$/).messages({
      'string.pattern.base': 'Slug must contain only lowercase letters, numbers, and hyphens',
    }),
    description: Joi.string().min(10).messages({
      'string.min': 'Description must be at least 10 characters',
    }),
    image_url: Joi.string().uri().allow('', null).messages({
      'string.uri': 'Image URL must be a valid URL',
    }),
    video_url: Joi.string().uri().allow('', null).messages({
      'string.uri': 'Video URL must be a valid URL',
    }),
    price: Joi.string().max(100).allow('', null).messages({
      'string.max': 'Price must not exceed 100 characters',
    }),
    features: Joi.array().items(Joi.string()),
    external_link: Joi.string().allow('', null),
    featured: Joi.boolean(),
    display_order: Joi.number().integer().min(0),
  }).min(1),
};

const changeStatusSchema = {
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    status: Joi.string().valid('draft', 'published', 'archived').required().messages({
      'any.only': 'Status must be one of: draft, published, archived',
      'any.required': 'Status is required',
    }),
  }),
};

const getByIdSchema = {
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
};

const getBySlugSchema = {
  params: Joi.object({
    slug: Joi.string().required(),
  }),
};

const getPublishedSchema = {
  query: Joi.object({
    limit: Joi.number().integer().min(1).max(100).default(20),
    page: Joi.number().integer().min(1).default(1),
  }),
};

const reorderSchema = {
  body: Joi.object({
    order: Joi.array().items(
      Joi.object({
        id: Joi.string().uuid().required(),
        display_order: Joi.number().integer().min(0).required(),
      })
    ).min(1).required().messages({
      'array.min': 'Order array must contain at least one item',
      'any.required': 'Order array is required',
    }),
  }),
};

module.exports = {
  createServiceSchema,
  updateServiceSchema,
  changeStatusSchema,
  getByIdSchema,
  getBySlugSchema,
  getPublishedSchema,
  reorderSchema,
};
