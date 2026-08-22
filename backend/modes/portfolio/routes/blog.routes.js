const express = require('express');
const blogController = require('../controllers/blog.controller');
const authMiddleware = require('../../../middleware/auth.middleware');
const { uploadDocument } = require('../../../middleware/upload.middleware');

const router = express.Router();

// Public routes
router.get('/published', blogController.getPublished);
router.get('/featured', blogController.getFeatured);
router.get('/post/:slug', blogController.getBySlug);
router.post('/post/:slug/like', blogController.like);
router.post('/post/:slug/rate', blogController.rate);

// Protected routes (admin)
router.get('/', authMiddleware, blogController.getAll);
router.post('/import-document', authMiddleware, uploadDocument, blogController.importDocument);
router.post('/', authMiddleware, blogController.create);
router.put('/:id', authMiddleware, blogController.update);
router.put('/:id/status', authMiddleware, blogController.changeStatus);
router.delete('/:id', authMiddleware, blogController.delete);

module.exports = router;
