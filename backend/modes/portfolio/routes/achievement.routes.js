const express = require('express');
const achievementController = require('../controllers/achievement.controller');
const authMiddleware = require('../../../middleware/auth.middleware');
const { validate } = require('../../../middleware/validation.middleware');
const achievementSchemas = require('../../../validators/achievement.validator');

const router = express.Router();

// Public
router.get('/categories', achievementController.getCategories);
router.get('/published', validate(achievementSchemas.getPublished), achievementController.getPublished);
router.get('/slug/:slug', validate(achievementSchemas.getBySlug), achievementController.getBySlug);
router.get('/:id', validate(achievementSchemas.getById), achievementController.getById);

// Admin (protected)
router.get('/', authMiddleware, validate(achievementSchemas.getAll), achievementController.getAll);
router.post('/', authMiddleware, validate(achievementSchemas.create), achievementController.create);
router.put('/:id', authMiddleware, validate(achievementSchemas.update), achievementController.update);
router.put('/:id/status', authMiddleware, validate(achievementSchemas.changeStatus), achievementController.changeStatus);
router.delete('/:id', authMiddleware, validate(achievementSchemas.delete), achievementController.delete);

module.exports = router;
