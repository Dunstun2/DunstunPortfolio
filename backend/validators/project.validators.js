const Joi = require('joi');

const createProjectSchema = {
  body: Joi.object({
    title: Joi.string().min(1).max(200).required(),
    slug: Joi.string().min(1).max(200).pattern(/^[a-z0-9-]+$/).required().messages({
      'string.pattern.base': 'Slug must contain only lowercase letters, numbers, and hyphens',
    }),
    description: Joi.string().min(1).required(),
    content: Joi.string().allow('', null),
    thumbnail_url: Joi.string().uri().allow('', null),
    category: Joi.string().allow('', null),
    project_type: Joi.string().allow('', null),
    start_date: Joi.string().allow('', null),
    end_date: Joi.string().allow('', null),
    problem: Joi.string().allow('', null),
    solution: Joi.string().allow('', null),
    my_role: Joi.string().allow('', null),
    responsibilities: Joi.string().allow('', null),
    team_size: Joi.string().allow('', null),
    technologies: Joi.array().items(Joi.string()).default([]),
    features: Joi.array().items(Joi.string()).default([]),
    screenshots: Joi.array().items(Joi.string().uri()).default([]),
    challenges: Joi.array().items(Joi.object({
      title: Joi.string().required(),
      description: Joi.string().required(),
    })).default([]),
    outcomes: Joi.string().allow('', null),
    lessons_learned: Joi.string().allow('', null),
    future_improvements: Joi.string().allow('', null),
    featured: Joi.boolean().default(false),
    status: Joi.string().valid('draft', 'published', 'archived').default('draft'),
  }),
};

const updateProjectSchema = {
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    title: Joi.string().min(1).max(200),
    slug: Joi.string().min(1).max(200).pattern(/^[a-z0-9-]+$/).messages({
      'string.pattern.base': 'Slug must contain only lowercase letters, numbers, and hyphens',
    }),
    description: Joi.string().min(1),
    content: Joi.string().allow('', null),
    thumbnail_url: Joi.string().uri().allow('', null),
    category: Joi.string().allow('', null),
    project_type: Joi.string().allow('', null),
    start_date: Joi.string().allow('', null),
    end_date: Joi.string().allow('', null),
    problem: Joi.string().allow('', null),
    solution: Joi.string().allow('', null),
    my_role: Joi.string().allow('', null),
    responsibilities: Joi.string().allow('', null),
    team_size: Joi.string().allow('', null),
    technologies: Joi.array().items(Joi.string()),
    features: Joi.array().items(Joi.string()),
    screenshots: Joi.array().items(Joi.string().uri()),
    challenges: Joi.array().items(Joi.object({
      title: Joi.string().required(),
      description: Joi.string().required(),
    })),
    outcomes: Joi.string().allow('', null),
    lessons_learned: Joi.string().allow('', null),
    future_improvements: Joi.string().allow('', null),
    featured: Joi.boolean(),
    status: Joi.string().valid('draft', 'published', 'archived'),
  }).min(1),
};

const changeStatusSchema = {
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    status: Joi.string().valid('draft', 'published', 'archived').required(),
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
    category: Joi.string().allow(''),
    limit: Joi.number().integer().min(1).max(100).default(20),
    page: Joi.number().integer().min(1).default(1),
  }),
};

module.exports = {
  createProjectSchema,
  updateProjectSchema,
  changeStatusSchema,
  getByIdSchema,
  getBySlugSchema,
  getPublishedSchema,
};
