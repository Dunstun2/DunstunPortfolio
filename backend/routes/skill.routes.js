const express = require('express');
const skillController = require('../controllers/skill.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', skillController.getAll); // Public route
router.post('/', authMiddleware, skillController.create);
router.put('/:id', authMiddleware, skillController.update);
router.delete('/:id', authMiddleware, skillController.delete);

module.exports = router;
