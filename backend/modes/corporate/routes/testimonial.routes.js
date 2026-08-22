const express = require('express');
const testimonialController = require('../controllers/testimonial.controller');
const authMiddleware = require('../../../middleware/auth.middleware');

const router = express.Router();

// Public route to get published testimonials & submit public feedback
router.get('/published', testimonialController.getPublished);
router.post('/submit', testimonialController.submitPublic);

// Protected routes for CMS administration
router.get('/', authMiddleware, testimonialController.getAll);
router.post('/', authMiddleware, testimonialController.create);
router.put('/:id', authMiddleware, testimonialController.update);
router.put('/:id/status', authMiddleware, testimonialController.changeStatus);
router.delete('/:id', authMiddleware, testimonialController.delete);

module.exports = router;
