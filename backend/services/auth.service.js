const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User } = require('../models');
const { AppError } = require('../middleware/errorHandler.middleware');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_development';

// In-memory store for reset tokens (in production, use a database table or Redis)
const resetTokens = new Map();

class AuthService {
  async login(email, password) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new AppError('Invalid credentials', 401);
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    };
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValid) {
      throw new AppError('Current password is incorrect', 400);
    }

    if (newPassword.length < 6) {
      throw new AppError('New password must be at least 6 characters', 400);
    }

    user.password_hash = await bcrypt.hash(newPassword, 10);
    await user.save();

    return { message: 'Password changed successfully' };
  }

  async createAdmin(name, email, password) {
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      throw new AppError('An account with this email already exists', 409);
    }

    if (password.length < 6) {
      throw new AppError('Password must be at least 6 characters', 400);
    }

    const password_hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password_hash, role: 'Administrator' });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }

  async forgotPassword(email) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Don't reveal whether the email exists
      return { message: 'If that email exists, a reset link has been sent.' };
    }

    const token = crypto.randomBytes(32).toString('hex');
    resetTokens.set(token, { userId: user.id, expires: Date.now() + 3600000 }); // 1 hour

    // In production, send this via email. For now, log it.
    console.log('===========================================');
    console.log('PASSWORD RESET TOKEN (copy this):');
    console.log(token);
    console.log('For user:', email);
    console.log('Expires in 1 hour.');
    console.log('===========================================');

    return { message: 'If that email exists, a reset link has been sent.' };
  }

  async resetPassword(token, newPassword) {
    const entry = resetTokens.get(token);
    if (!entry) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    if (Date.now() > entry.expires) {
      resetTokens.delete(token);
      throw new AppError('Reset token has expired', 400);
    }

    if (newPassword.length < 6) {
      throw new AppError('New password must be at least 6 characters', 400);
    }

    const user = await User.findByPk(entry.userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    user.password_hash = await bcrypt.hash(newPassword, 10);
    await user.save();

    resetTokens.delete(token);

    return { message: 'Password has been reset successfully' };
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new AppError('Invalid token', 401);
    }
  }
}

module.exports = new AuthService();
