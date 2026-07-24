const express = require('express');
const heroController = require('../controllers/hero.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Public route to get the single published hero for the portfolio site
router.get('/published', heroController.getPublished);

// Protected routes for CMS administration
router.get('/', authMiddleware, heroController.getAll);
router.post('/', authMiddleware, heroController.create);
router.put('/:id', authMiddleware, heroController.update);
router.put('/:id/status', authMiddleware, heroController.changeStatus);
router.put('/:id/active', authMiddleware, heroController.setActive);
router.delete('/:id', authMiddleware, heroController.delete);

module.exports = router;
