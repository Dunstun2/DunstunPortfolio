const express = require('express');
const settingController = require('../controllers/setting.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Public route so the frontend can load global settings (like theme colors)
router.get('/', settingController.getSettings);

// Protected route for CMS administration
router.put('/', authMiddleware, settingController.updateSettings);

module.exports = router;
