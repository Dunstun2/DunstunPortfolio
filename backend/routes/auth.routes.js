const express = require('express');
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');
const { authLimiter, passwordResetLimiter } = require('../middleware/rateLimiter.middleware');
const {
    loginSchema,
    registerSchema,
    changePasswordSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
} = require('../validators/auth.validators');

const router = express.Router();

// Public routes with rate limiting and validation
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/forgot-password', passwordResetLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', passwordResetLimiter, validate(resetPasswordSchema), authController.resetPassword);

// Protected routes
router.get('/me', authMiddleware, authController.me);
router.put('/change-password', authMiddleware, validate(changePasswordSchema), authController.changePassword);
router.post('/register', authMiddleware, validate(registerSchema), authController.register);
router.post('/verify-password', authMiddleware, authController.verifyPassword);

module.exports = router;
