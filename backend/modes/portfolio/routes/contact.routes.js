const express = require('express');
const contactController = require('../controllers/contact.controller');
const authMiddleware = require('../../../middleware/auth.middleware');

const router = express.Router();

// Public route for visitors to send messages
router.post('/', contactController.create);

// Protected routes for CMS administration (reading/managing messages)
router.get('/', authMiddleware, contactController.getAll);
router.put('/:id/status', authMiddleware, contactController.changeStatus);
router.post('/:id/reply', authMiddleware, contactController.reply);
router.delete('/:id', authMiddleware, contactController.delete);

module.exports = router;

