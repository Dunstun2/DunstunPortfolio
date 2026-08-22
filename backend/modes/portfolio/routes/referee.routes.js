const express = require('express');
const refereeController = require('../controllers/referee.controller');
const authMiddleware = require('../../../middleware/auth.middleware');

const router = express.Router();

// Public route to get published referees
router.get('/published', refereeController.getPublished);

// Protected routes for CMS administration
router.get('/', authMiddleware, refereeController.getAll);
router.post('/', authMiddleware, refereeController.create);
router.put('/:id', authMiddleware, refereeController.update);
router.put('/:id/status', authMiddleware, refereeController.changeStatus);
router.delete('/:id', authMiddleware, refereeController.delete);

module.exports = router;
