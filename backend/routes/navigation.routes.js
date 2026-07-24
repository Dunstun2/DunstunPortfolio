const express = require('express');
const navigationController = require('../controllers/navigation.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Public route to get active navigation items (sorted by order)
router.get('/active', navigationController.getActive);

// Protected routes for CMS administration
router.get('/', authMiddleware, navigationController.getAll);
router.post('/', authMiddleware, navigationController.create);
router.put('/:id', authMiddleware, navigationController.update);
router.delete('/:id', authMiddleware, navigationController.delete);

module.exports = router;
