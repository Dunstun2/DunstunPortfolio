const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Public route to track events (called silently by the frontend)
router.post('/track', analyticsController.trackEvent);

// Protected route to fetch stats for the admin dashboard
router.get('/stats', authMiddleware, analyticsController.getStats);

module.exports = router;
