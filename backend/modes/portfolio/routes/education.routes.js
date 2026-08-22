const express = require('express');
const educationController = require('../controllers/education.controller');
const authMiddleware = require('../../../middleware/auth.middleware');

const router = express.Router();

router.get('/', educationController.getAll); // Public route
router.post('/', authMiddleware, educationController.create);
router.put('/:id', authMiddleware, educationController.update);
router.delete('/:id', authMiddleware, educationController.delete);

module.exports = router;
