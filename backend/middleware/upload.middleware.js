const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');
const crypto = require('crypto');
const { AppError } = require('./errorHandler.middleware');
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Allowed MIME types
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'
];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'text/plain'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'];
const ALLOWED_MEDIA_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES, ...ALLOWED_VIDEO_TYPES];

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB (increased for videos)
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

function generateSecureFilename(originalname) {
  const ext = path.extname(originalname).toLowerCase();
  const randomName = crypto.randomBytes(16).toString('hex');
  return `${randomName}${ext}`;
}

// Cloudinary storage configuration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let resource_type = 'auto';
    if (file.mimetype.startsWith('video/')) {
      resource_type = 'video';
    }
    return {
      folder: 'portfolio_uploads',
      resource_type: resource_type,
      public_id: crypto.randomBytes(16).toString('hex')
    };
  }
});

const logger = require('../config/logger');

const mediaFileFilter = (req, file, cb) => {
  const mime = file.mimetype.toLowerCase();
  if (mime.startsWith('video/') || ALLOWED_MEDIA_TYPES.includes(mime)) {
    cb(null, true);
  } else {
    logger.error(`Rejected mime type: ${file.mimetype}`);
    return cb(new AppError('File type not allowed.', 400));
  }
};

const imageFileFilter = (req, file, cb) => {
  if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype.toLowerCase())) {
    return cb(new AppError('Only images are allowed.', 400));
  }
  cb(null, true);
};

const uploadMedia = multer({ storage, limits: { fileSize: MAX_FILE_SIZE }, fileFilter: mediaFileFilter });
const uploadImage = multer({ storage, limits: { fileSize: MAX_IMAGE_SIZE }, fileFilter: imageFileFilter });

const uploadDocument = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError('Only PDF/DOCX allowed', 400));
    }
  }
});

const uploadCV = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError('Only PDF/DOCX/TXT allowed for CV', 400));
    }
  }
});

const handleUploadError = (uploadMiddleware) => (req, res, next) => {
  uploadMiddleware(req, res, (err) => {
    if (err) {
      logger.error(`Raw upload error: ${JSON.stringify(err)}`);
      let errMsg = err.message;
      if (!errMsg && err.error && err.error.message) {
        errMsg = err.error.message;
      }
      if (!errMsg && typeof err === 'string') {
        errMsg = err;
      }
      return next(new AppError(errMsg || 'Cloudinary rejected the upload (e.g. size/format limit)', 400));
    }
    next();
  });
};

module.exports = {
  uploadMedia: handleUploadError(uploadMedia.single('file')),
  uploadImage: handleUploadError(uploadImage.single('file')),
  uploadDocument: handleUploadError(uploadDocument.single('file')),
  uploadCV: handleUploadError(uploadCV.single('cv')),
  uploadMultiple: handleUploadError(uploadMedia.array('files', 10)),
  cloudinary // Export for use in controllers
};
