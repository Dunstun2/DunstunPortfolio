const express = require('express');
const aboutController = require('../controllers/about.controller');
const authMiddleware = require('../../../middleware/auth.middleware');
const { cache, invalidateCache } = require('../../../middleware/cache.middleware');

const router = express.Router();

// Public route to get the single published about section
router.get('/published', aboutController.getPublished);

// Protected routes for CMS administration
router.get('/', authMiddleware, aboutController.getAll);
router.post('/', authMiddleware, invalidateCache('cache:*'), aboutController.create);
router.put('/values/:id', authMiddleware, invalidateCache('cache:*'), aboutController.updateValue);
router.put('/explorations/:id', authMiddleware, invalidateCache('cache:*'), aboutController.updateExploration);
router.put('/highlights/:id', authMiddleware, invalidateCache('cache:*'), aboutController.updateHighlight);
router.put('/active', authMiddleware, invalidateCache('cache:*'), aboutController.updateActive);
router.put('/:id', authMiddleware, invalidateCache('cache:*'), aboutController.update);
router.put('/:id/status', authMiddleware, invalidateCache('cache:*'), aboutController.changeStatus);
router.delete('/:id', authMiddleware, invalidateCache('cache:*'), aboutController.delete);

module.exports = router;
