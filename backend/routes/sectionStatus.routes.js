const express = require('express');
const sectionStatusController = require('../controllers/sectionStatus.controller');

const router = express.Router();

// Public route — navbar calls this to decide which links to show
router.get('/available', sectionStatusController.getAvailableSections);

module.exports = router;
