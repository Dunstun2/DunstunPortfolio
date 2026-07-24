const express = require('express');
const blogCategoryController = require('../controllers/blogCategory.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Public routes
router.get('/active', blogCategoryController.getActive);

// Protected routes (admin)
router.get('/', authMiddleware, blogCategoryController.getAll);
router.post('/', authMiddleware, blogCategoryController.create);
router.put('/:id', authMiddleware, blogCategoryController.update);
router.delete('/:id', authMiddleware, blogCategoryController.delete);

module.exports = router;
