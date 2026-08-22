const express = require('express');
const heroController = require('../controllers/hero.controller');
const authMiddleware = require('../../../middleware/auth.middleware');
const { cache, invalidateCache } = require('../../../middleware/cache.middleware');

const router = express.Router();

// Public route to get the single published hero for the portfolio site
router.get('/published', cache({ ttl: 300 }), heroController.getPublished);

// Protected routes for CMS administration
router.get('/', authMiddleware, heroController.getAll);
router.post('/', authMiddleware, invalidateCache('cache:*'), heroController.create);
router.put('/:id', authMiddleware, invalidateCache('cache:*'), heroController.update);
router.put('/:id/status', authMiddleware, invalidateCache('cache:*'), heroController.changeStatus);
router.put('/:id/active', authMiddleware, invalidateCache('cache:*'), heroController.setActive);
router.delete('/:id', authMiddleware, invalidateCache('cache:*'), heroController.delete);

module.exports = router;
