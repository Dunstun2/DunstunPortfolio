const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/showVideo.controller');
const authMiddleware = require('../../../middleware/auth.middleware');

// Public — live banner reads active videos
router.get('/active', ctrl.getActive);

// Admin — full CRUD
router.get('/',         authMiddleware, ctrl.getAll);
router.get('/:id',      authMiddleware, ctrl.getById);
router.post('/',        authMiddleware, ctrl.create);
router.put('/reorder',  authMiddleware, ctrl.reorder);
router.put('/:id',      authMiddleware, ctrl.update);
router.delete('/:id',   authMiddleware, ctrl.delete);

module.exports = router;
