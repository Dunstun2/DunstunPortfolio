const express = require('express');
const projectController = require('../controllers/project.controller');
const authMiddleware = require('../../../middleware/auth.middleware');
const { validate } = require('../../../middleware/validation.middleware');
const { cache, invalidateCache } = require('../../../middleware/cache.middleware');
const {
    createProjectSchema,
    updateProjectSchema,
    changeStatusSchema,
    getBySlugSchema,
    getPublishedSchema,
} = require('../../../validators/project.validators');

const router = express.Router();

// Public routes for portfolio display - with caching
router.get('/published', validate(getPublishedSchema), cache({ ttl: 300, prefix: 'cache:projects:published:' }), projectController.getPublished);
router.get('/published/recent', cache({ ttl: 300, prefix: 'cache:projects:recent:' }), projectController.getRecent);
router.get('/published/:slug', validate(getBySlugSchema), cache({ ttl: 600, prefix: 'cache:projects:slug:' }), projectController.getPublishedBySlug);

// Protected routes for CMS administration - with cache invalidation
router.get('/', authMiddleware, projectController.getAll);
router.post('/', authMiddleware, validate(createProjectSchema), invalidateCache(['cache:projects:*']), projectController.create);
router.put('/:id', authMiddleware, validate(updateProjectSchema), invalidateCache(['cache:projects:*']), projectController.update);
router.put('/:id/status', authMiddleware, validate(changeStatusSchema), invalidateCache(['cache:projects:*']), projectController.changeStatus);
router.delete('/:id', authMiddleware, invalidateCache(['cache:projects:*']), projectController.delete);

module.exports = router;

/**
 * @swagger
 * /projects/published:
 *   get:
 *     summary: Get published projects with pagination
 *     tags: [Projects]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *     responses:
 *       200:
 *         description: List of published projects with pagination
 */

/**
 * @swagger
 * /projects:
 *   post:
 *     summary: Create a new project (admin)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Project'
 *     responses:
 *       201:
 *         description: Project created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
