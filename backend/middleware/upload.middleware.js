const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const { AppError } = require('./errorHandler.middleware');

// Allowed MIME types for different file categories
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
];

const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'text/plain',
];

const ALLOWED_MEDIA_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  ...ALLOWED_DOCUMENT_TYPES,
];

// File size limits (in bytes)
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB for images
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB for documents

/**
 * Generate a secure random filename
 */
function generateSecureFilename(originalname) {
  const ext = path.extname(originalname).toLowerCase();
  const randomName = crypto.randomBytes(16).toString('hex');
  return `${randomName}${ext}`;
}

/**
 * Validate file extension matches MIME type
 */
function validateFileExtension(file) {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeType = file.mimetype.toLowerCase();

  const extensionMap = {
    '.jpg': ['image/jpeg'],
    '.jpeg': ['image/jpeg'],
    '.png': ['image/png'],
    '.gif': ['image/gif'],
    '.webp': ['image/webp'],
    '.svg': ['image/svg+xml'],
    '.pdf': ['application/pdf'],
    '.txt': ['text/plain'],
  };

  const allowedMimes = extensionMap[ext];
  if (!allowedMimes || !allowedMimes.includes(mimeType)) {
    throw new AppError('File extension does not match file type', 400);
  }

  return true;
}

/**
 * Multer storage configuration
 */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', '..', 'uploads'));
  },
  filename: function (req, file, cb) {
    try {
      const secureFilename = generateSecureFilename(file.originalname);
      cb(null, secureFilename);
    } catch (error) {
      cb(error);
    }
  },
});

/**
 * File filter for general media uploads
 */
const mediaFileFilter = (req, file, cb) => {
  try {
    // Block Word documents explicitly
    const wordMimeTypes = [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (
      wordMimeTypes.includes(file.mimetype) ||
      file.originalname.match(/\.(doc|docx)$/i)
    ) {
      return cb(
        new AppError(
          'Word documents are not allowed. Please convert to PDF first.',
          400
        )
      );
    }

    // Check if file type is allowed
    if (!ALLOWED_MEDIA_TYPES.includes(file.mimetype.toLowerCase())) {
      return cb(
        new AppError(
          `File type not allowed. Allowed types: images (jpg, png, gif, webp, svg) and PDF`,
          400
        )
      );
    }

    // Validate file extension matches MIME type
    validateFileExtension(file);

    cb(null, true);
  } catch (error) {
    cb(error);
  }
};

/**
 * File filter for image uploads only
 */
const imageFileFilter = (req, file, cb) => {
  try {
    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype.toLowerCase())) {
      return cb(
        new AppError(
          'Only image files are allowed (jpg, png, gif, webp, svg)',
          400
        )
      );
    }

    validateFileExtension(file);
    cb(null, true);
  } catch (error) {
    cb(error);
  }
};

/**
 * Media upload middleware (images and PDFs)
 */
const uploadMedia = multer({
  storage: storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: mediaFileFilter,
});

/**
 * Image-only upload middleware
 */
const uploadImage = multer({
  storage: storage,
  limits: { fileSize: MAX_IMAGE_SIZE },
  fileFilter: imageFileFilter,
});

/**
 * Document upload middleware with buffer storage (for parsing)
 */
const uploadDocument = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_DOCUMENT_SIZE },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError('Only PDF and DOCX files are allowed for document import', 400));
    }
  },
});

/**
 * CV upload middleware with disk storage (for CV import feature)
 */
const uploadCV = multer({
  storage: storage,
  limits: { fileSize: MAX_DOCUMENT_SIZE },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError('Only PDF, DOCX, and TXT files are allowed for CV import', 400));
    }
  },
});

/**
 * Error handler wrapper for multer middleware
 */
const handleUploadError = (uploadMiddleware) => {
  return (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new AppError('File size exceeds the maximum limit', 400));
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return next(new AppError('Too many files uploaded', 400));
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return next(new AppError('Unexpected file field', 400));
        }
        return next(new AppError(err.message, 400));
      }

      if (err) {
        return next(err);
      }

      next();
    });
  };
};

module.exports = {
  uploadMedia: handleUploadError(uploadMedia.single('file')),
  uploadImage: handleUploadError(uploadImage.single('file')),
  uploadDocument: handleUploadError(uploadDocument.single('file')),
  uploadCV: handleUploadError(uploadCV.single('cv')),
  uploadMultiple: handleUploadError(uploadMedia.array('files', 10)),
  ALLOWED_IMAGE_TYPES,
  ALLOWED_DOCUMENT_TYPES,
  ALLOWED_MEDIA_TYPES,
  MAX_FILE_SIZE,
  MAX_IMAGE_SIZE,
  MAX_DOCUMENT_SIZE,
};
