const express = require('express');
const tagController = require('../controllers/tag.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', tagController.getAll);
router.post('/', authMiddleware, tagController.create);
router.put('/:id', authMiddleware, tagController.update);
router.delete('/:id', authMiddleware, tagController.delete);

module.exports = router;
