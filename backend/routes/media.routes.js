const express = require('express');
const mediaController = require('../controllers/media.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { uploadMedia } = require('../middleware/upload.middleware');
const { uploadLimiter } = require('../middleware/rateLimiter.middleware');

const router = express.Router();

// Routes
// Allow media uploads with rate limiting and secure file handling
router.post('/', uploadLimiter, uploadMedia, mediaController.upload);
router.delete('/:id', authMiddleware, mediaController.delete);

// Anyone can view the list of media (used by frontend to render galleries)
router.get('/', mediaController.getAll);

// Folders
router.get('/folders', mediaController.getFolders);
router.delete('/folders', authMiddleware, mediaController.deleteFolder);

// File actions
router.put('/:id/rename', authMiddleware, mediaController.rename);
router.put('/:id/move', authMiddleware, mediaController.move);
router.post('/:id/copy', authMiddleware, mediaController.copy);

// Discover random images from external source
router.get('/discover', mediaController.discover);

// Download an external image to local media gallery
router.post('/download', authMiddleware, mediaController.downloadRemote);

module.exports = router;
