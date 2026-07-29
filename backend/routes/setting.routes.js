const express = require('express');
const settingController = require('../controllers/setting.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { cache, invalidateCache } = require('../middleware/cache.middleware');

const router = express.Router();

// Public route so the frontend can load global settings (like theme colors)
router.get('/', cache({ ttl: 300 }), settingController.getSettings);

// Protected route for CMS administration
router.put('/', authMiddleware, invalidateCache('cache:*'), settingController.updateSettings);

module.exports = router;
