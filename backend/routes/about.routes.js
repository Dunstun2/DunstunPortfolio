const express = require('express');
const aboutController = require('../controllers/about.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Public route to get the single published about section
router.get('/published', aboutController.getPublished);

// Protected routes for CMS administration
router.get('/', authMiddleware, aboutController.getAll);
router.post('/', authMiddleware, aboutController.create);
router.put('/:id', authMiddleware, aboutController.update);
router.put('/:id/status', authMiddleware, aboutController.changeStatus);
router.delete('/:id', authMiddleware, aboutController.delete);

module.exports = router;
