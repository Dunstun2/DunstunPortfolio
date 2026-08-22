const express = require('express');
const corporateHeroController = require('../controllers/corporateHero.controller');
const authMiddleware = require('../../../middleware/auth.middleware');

const router = express.Router();

router.get('/published', corporateHeroController.getPublished);
router.get('/', authMiddleware, corporateHeroController.getAll);
router.post('/', authMiddleware, corporateHeroController.createOrUpdate);
router.put('/:id', authMiddleware, corporateHeroController.update);

module.exports = router;
