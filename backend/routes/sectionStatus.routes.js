const express = require('express');
const sectionStatusController = require('../controllers/sectionStatus.controller');
const { cache } = require('../middleware/cache.middleware');

const router = express.Router();

// Public route — navbar calls this to decide which links to show
router.get('/available', cache({ ttl: 300 }), sectionStatusController.getAvailableSections);

module.exports = router;
