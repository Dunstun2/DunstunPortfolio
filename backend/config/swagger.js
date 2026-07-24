const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Portfolio CMS API',
      version: '1.0.0',
      description: 'REST API for Portfolio Content Management System',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Error message',
            },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            page: {
              type: 'integer',
              example: 1,
            },
            limit: {
              type: 'integer',
              example: 20,
            },
            totalItems: {
              type: 'integer',
              example: 100,
            },
            totalPages: {
              type: 'integer',
              example: 5,
            },
            hasNextPage: {
              type: 'boolean',
              example: true,
            },
            hasPrevPage: {
              type: 'boolean',
              example: false,
            },
            nextPage: {
              type: 'integer',
              nullable: true,
              example: 2,
            },
            prevPage: {
              type: 'integer',
              nullable: true,
              example: null,
            },
          },
        },
        Project: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            title: {
              type: 'string',
            },
            slug: {
              type: 'string',
            },
            description: {
              type: 'string',
            },
            content: {
              type: 'string',
              nullable: true,
            },
            thumbnail_url: {
              type: 'string',
              nullable: true,
            },
            category: {
              type: 'string',
              nullable: true,
            },
            project_type: {
              type: 'string',
              nullable: true,
            },
            technologies: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
            featured: {
              type: 'boolean',
            },
            status: {
              type: 'string',
              enum: ['draft', 'published', 'archived'],
            },
            published_at: {
              type: 'string',
              format: 'date-time',
              nullable: true,
            },
            created_at: {
              type: 'string',
              format: 'date-time',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Auth',
        description: 'Authentication endpoints',
      },
      {
        name: 'Projects',
        description: 'Project management',
      },
      {
        name: 'Services',
        description: 'Service offerings management',
      },
      {
        name: 'Blog',
        description: 'Blog post management',
      },
      {
        name: 'Media',
        description: 'Media library management',
      },
      {
        name: 'Contact',
        description: 'Contact form submissions',
      },
    ],
  },
  apis: ['./routes/*.js', './controllers/*.js'], // Path to API docs
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
