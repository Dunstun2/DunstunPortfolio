const express = require('express');
const ctaController = require('../controllers/cta.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', ctaController.getAll);
router.post('/', authMiddleware, ctaController.create);
router.put('/:id', authMiddleware, ctaController.update);
router.delete('/:id', authMiddleware, ctaController.delete);

module.exports = router;
