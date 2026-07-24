const express = require('express');
const blogTagController = require('../controllers/blogTag.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Public routes
router.get('/all', blogTagController.getAll);

// Protected routes (admin)
router.get('/', authMiddleware, blogTagController.getAll);
router.post('/', authMiddleware, blogTagController.create);
router.put('/:id', authMiddleware, blogTagController.update);
router.delete('/:id', authMiddleware, blogTagController.delete);

module.exports = router;
