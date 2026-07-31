/**
 * CV Import Routes
 */

const express = require('express');
const router = express.Router();
const cvImportController = require('../controllers/cvImport.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { uploadCV } = require('../middleware/upload.middleware');

/**
 * @route   POST /api/cv/upload
 * @desc    Upload and parse CV
 * @access  Private (Admin only)
 */
router.post(
  '/upload',
  authMiddleware,
  uploadCV,
  cvImportController.uploadAndParse
);

/**
 * @route   GET /api/cv/preview/:importId
 * @desc    Get parsed CV preview
 * @access  Private (Admin only)
 */
router.get(
  '/preview/:importId',
  authMiddleware,
  cvImportController.getPreview
);


/**
 * @route   POST /api/cv/import/:importId
 * @desc    Import CV data to portfolio
 * @access  Private (Admin only)
 */
router.post(
  '/import/:importId',
  authMiddleware,
  cvImportController.importToPortfolio
);

/**
 * @route   GET /api/cv/history
 * @desc    Get CV import history
 * @access  Private (Admin only)
 */
router.get(
  '/history',
  authMiddleware,
  cvImportController.getImportHistory
);

/**
 * @route   DELETE /api/cv/:importId
 * @desc    Delete CV import record
 * @access  Private (Admin only)
 */
router.delete(
  '/:importId',
  authMiddleware,
  cvImportController.deleteImport
);

module.exports = router;
