const express = require('express');
const experienceController = require('../controllers/experience.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', experienceController.getAll); // Public route
router.post('/', authMiddleware, experienceController.create);
router.put('/:id', authMiddleware, experienceController.update);
router.delete('/:id', authMiddleware, experienceController.delete);

module.exports = router;
