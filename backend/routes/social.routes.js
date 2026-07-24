const express = require('express');
const socialController = require('../controllers/social.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', socialController.getAll);
router.post('/', authMiddleware, socialController.create);
router.put('/:id', authMiddleware, socialController.update);
router.delete('/:id', authMiddleware, socialController.delete);

module.exports = router;
