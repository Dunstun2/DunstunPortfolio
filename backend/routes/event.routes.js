const express = require('express');
const eventController = require('../controllers/event.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Public routes for portfolio display
router.get('/published', eventController.getPublished);
router.get('/published/:slug', eventController.getPublishedBySlug);

// Protected routes for CMS administration
router.get('/', authMiddleware, eventController.getAll);
router.post('/', authMiddleware, eventController.create);
router.put('/:id', authMiddleware, eventController.update);
router.put('/:id/status', authMiddleware, eventController.changeStatus);
router.delete('/:id', authMiddleware, eventController.delete);

module.exports = router;
