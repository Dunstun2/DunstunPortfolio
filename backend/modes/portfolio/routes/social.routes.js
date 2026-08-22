const express = require('express');
const socialController = require('../controllers/social.controller');
const authMiddleware = require('../../../middleware/auth.middleware');
const { cache, invalidateCache } = require('../../../middleware/cache.middleware');

const router = express.Router();

router.get('/', cache({ ttl: 300 }), socialController.getAll);
router.post('/', authMiddleware, invalidateCache('cache:*'), socialController.create);
router.put('/:id', authMiddleware, invalidateCache('cache:*'), socialController.update);
router.delete('/:id', authMiddleware, invalidateCache('cache:*'), socialController.delete);

module.exports = router;
