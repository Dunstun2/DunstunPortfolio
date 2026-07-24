const express = require('express');
const blogCommentController = require('../controllers/blogComment.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Public routes
router.get('/post/:postId', blogCommentController.getByPost);
router.post('/', blogCommentController.create);

// Protected routes (admin)
router.get('/', authMiddleware, blogCommentController.getAllForAdmin);
router.get('/stats', authMiddleware, blogCommentController.getStats);
router.post('/reply', authMiddleware, blogCommentController.createAuthorReply);
router.put('/:id/status', authMiddleware, blogCommentController.changeStatus);
router.delete('/:id', authMiddleware, blogCommentController.delete);

module.exports = router;
