const express = require('express');
const templateController = require('../controllers/template.controller');
const authMiddleware = require('../../../middleware/auth.middleware');
const { cache, invalidateCache } = require('../../../middleware/cache.middleware');

const router = express.Router();

// Public routes
router.get('/', cache({ ttl: 600 }), templateController.getAllTemplates);
router.get('/active', cache({ ttl: 300 }), templateController.getActiveTemplate);
router.get('/:slug', cache({ ttl: 600 }), templateController.getTemplateBySlug);

// Admin routes
router.post('/', authMiddleware, invalidateCache('cache:*'), templateController.createTemplate);
router.put('/:id', authMiddleware, invalidateCache('cache:*'), templateController.updateTemplate);
router.delete('/:id', authMiddleware, invalidateCache('cache:*'), templateController.deleteTemplate);

module.exports = router;
