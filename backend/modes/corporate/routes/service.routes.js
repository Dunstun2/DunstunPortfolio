const express = require('express');
const serviceController = require('../controllers/service.controller');
const authMiddleware = require('../../../middleware/auth.middleware');
const { validate } = require('../../../middleware/validation.middleware');
const { cache, invalidateCache } = require('../../../middleware/cache.middleware');
const {
  createServiceSchema,
  updateServiceSchema,
  changeStatusSchema,
  getByIdSchema,
  getBySlugSchema,
  getPublishedSchema,
  reorderSchema,
} = require('../../../validators/service.validators');

const router = express.Router();

// ============================================
// PUBLIC ROUTES (for frontend display)
// ============================================

/**
 * @swagger
 * /services/published:
 *   get:
 *     summary: Get all published services with pagination
 *     tags: [Services]
 *     description: Returns all published services for the services page
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
 *     responses:
 *       200:
 *         description: List of published services with pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Service'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get(
  '/published',
  validate(getPublishedSchema),
  cache({ ttl: 300, prefix: 'cache:services:published:' }),
  serviceController.getPublished
);

/**
 * @swagger
 * /services/featured:
 *   get:
 *     summary: Get featured services for homepage
 *     tags: [Services]
 *     description: Returns up to 3 featured services for the homepage services section
 *     responses:
 *       200:
 *         description: List of featured services (max 3)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   maxItems: 3
 *                   items:
 *                     $ref: '#/components/schemas/Service'
 */
router.get(
  '/featured',
  cache({ ttl: 300, prefix: 'cache:services:featured:' }),
  serviceController.getFeatured
);

/**
 * @swagger
 * /services/{slug}:
 *   get:
 *     summary: Get single published service by slug
 *     tags: [Services]
 *     description: Returns a single published service for the service detail page
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Service slug
 *     responses:
 *       200:
 *         description: Service details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Service'
 *       404:
 *         description: Service not found
 */
router.get(
  '/:slug',
  validate(getBySlugSchema),
  cache({ ttl: 600, prefix: 'cache:services:slug:' }),
  serviceController.getPublishedBySlug
);

// ============================================
// PROTECTED ROUTES (admin CMS)
// ============================================

/**
 * @swagger
 * /services/admin/all:
 *   get:
 *     summary: Get all services (admin)
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     description: Returns all services regardless of status for admin management
 *     responses:
 *       200:
 *         description: List of all services
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/admin/all',
  authMiddleware,
  serviceController.getAll
);

/**
 * @swagger
 * /services/admin/{id}:
 *   get:
 *     summary: Get service by ID (admin)
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Service details
 *       404:
 *         description: Service not found
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/admin/:id',
  authMiddleware,
  validate(getByIdSchema),
  serviceController.getById
);

/**
 * @swagger
 * /services:
 *   post:
 *     summary: Create a new service (admin)
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Service'
 *     responses:
 *       201:
 *         description: Service created successfully
 *       400:
 *         description: Validation error or max featured limit reached
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Service with this slug already exists
 */
router.post(
  '/',
  authMiddleware,
  validate(createServiceSchema),
  invalidateCache(['cache:services:*']),
  serviceController.create
);

/**
 * @swagger
 * /services/{id}:
 *   put:
 *     summary: Update service (admin)
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Service'
 *     responses:
 *       200:
 *         description: Service updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Service not found
 *       401:
 *         description: Unauthorized
 */
router.put(
  '/:id',
  authMiddleware,
  validate(updateServiceSchema),
  invalidateCache(['cache:services:*']),
  serviceController.update
);

/**
 * @swagger
 * /services/{id}/status:
 *   put:
 *     summary: Change service status (admin)
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [draft, published, archived]
 *     responses:
 *       200:
 *         description: Status changed successfully
 *       400:
 *         description: Invalid status
 *       404:
 *         description: Service not found
 *       401:
 *         description: Unauthorized
 */
router.put(
  '/:id/status',
  authMiddleware,
  validate(changeStatusSchema),
  invalidateCache(['cache:services:*']),
  serviceController.changeStatus
);

/**
 * @swagger
 * /services/{id}/featured:
 *   put:
 *     summary: Toggle featured status (admin)
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     description: Toggle featured status. Max 3 services can be featured at once.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Featured status toggled successfully
 *       400:
 *         description: Maximum featured limit reached
 *       404:
 *         description: Service not found
 *       401:
 *         description: Unauthorized
 */
router.put(
  '/:id/featured',
  authMiddleware,
  invalidateCache(['cache:services:*']),
  serviceController.toggleFeatured
);

/**
 * @swagger
 * /services/reorder:
 *   post:
 *     summary: Reorder services (admin)
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               order:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     display_order:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Services reordered successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/reorder',
  authMiddleware,
  validate(reorderSchema),
  invalidateCache(['cache:services:*']),
  serviceController.reorder
);

/**
 * @swagger
 * /services/{id}:
 *   delete:
 *     summary: Delete service (admin)
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Service deleted successfully
 *       404:
 *         description: Service not found
 *       401:
 *         description: Unauthorized
 */
router.delete(
  '/:id',
  authMiddleware,
  invalidateCache(['cache:services:*']),
  serviceController.delete
);

module.exports = router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Service:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *           example: "Web Development"
 *         slug:
 *           type: string
 *           example: "web-development"
 *         description:
 *           type: string
 *           example: "Full-stack web development services..."
 *         short_description:
 *           type: string
 *           example: "Custom websites and web applications"
 *         icon:
 *           type: string
 *           example: "Code"
 *         image_url:
 *           type: string
 *           example: "/uploads/service-web-dev.jpg"
 *         price:
 *           type: string
 *           example: "Starting at $5,000"
 *         features:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Responsive Design", "SEO Optimized", "Fast Performance"]
 *         cta_text:
 *           type: string
 *           example: "Get Started"
 *         cta_url:
 *           type: string
 *           example: "/contact"
 *         featured:
 *           type: boolean
 *           example: true
 *         status:
 *           type: string
 *           enum: [draft, published, archived]
 *           example: "published"
 *         display_order:
 *           type: integer
 *           example: 1
 *         published_at:
 *           type: string
 *           format: date-time
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */
