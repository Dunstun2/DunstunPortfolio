const express = require('express');
const router = express.Router();
const certificationController = require('../controllers/certification.controller');
const authMiddleware = require('../../../middleware/auth.middleware');
const { validate } = require('../../../middleware/validation.middleware');
const certificationSchemas = require('../../../validators/certification.validator');

// Public routes
router.get('/published', validate(certificationSchemas.getPublished), certificationController.getPublished);
router.get('/categories', certificationController.getCategories);
router.get('/featured', certificationController.getFeatured);
router.get('/slug/:slug', validate(certificationSchemas.getBySlug), certificationController.getBySlug);

// Protected routes (admin only)
router.use(authMiddleware);

router.post('/', validate(certificationSchemas.create), certificationController.create);
router.get('/', validate(certificationSchemas.getAll), certificationController.getAll);
router.get('/:id', validate(certificationSchemas.getById), certificationController.getById);
router.put('/:id', validate(certificationSchemas.update), certificationController.update);
router.delete('/:id', validate(certificationSchemas.delete), certificationController.delete);
router.patch('/:id/status', validate(certificationSchemas.changeStatus), certificationController.changeStatus);

module.exports = router;
