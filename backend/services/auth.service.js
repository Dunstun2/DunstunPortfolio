const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User } = require('../models');
const { AppError } = require('../middleware/errorHandler.middleware');
const emailService = require('./email.service');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_development';

// In-memory store for reset codes (in production, use a database table or Redis)
// key: email, value: { code, userId, expires }
const resetCodes = new Map();

class AuthService {
  async login(email, password) {
    // Hardcoded fallback admin for initial login
    const FALLBACK_ADMIN = {
      email: 'admin@example.com',
      password: 'admin123456',
      name: 'System Administrator',
      id: 0,
      role: 'admin'
    };

    // Check if using fallback admin credentials
    if (email === FALLBACK_ADMIN.email && password === FALLBACK_ADMIN.password) {
      console.log('⚠️  Login using fallback admin account');
      const token = jwt.sign(
        { id: FALLBACK_ADMIN.id, email: FALLBACK_ADMIN.email, role: FALLBACK_ADMIN.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      return {
        user: {
          id: FALLBACK_ADMIN.id,
          name: FALLBACK_ADMIN.name,
          email: FALLBACK_ADMIN.email,
          role: FALLBACK_ADMIN.role,
        },
        token,
      };
    }

    // Regular database login
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
      return { message: 'If that email exists, a reset code has been sent.' };
    }

    // Generate a 6-digit numeric code
    const code = String(Math.floor(100000 + Math.random() * 900000));
    resetCodes.set(email.toLowerCase(), { code, userId: user.id, expires: Date.now() + 3600000 }); // 1 hour

    // Send email with reset code
    await emailService.sendPasswordResetEmail(email, code, user.name);

    return { message: 'If that email exists, a reset code has been sent.' };
  }

  async resetPassword(email, code, newPassword) {
    const entry = resetCodes.get(email.toLowerCase());
    if (!entry || entry.code !== code) {
      throw new AppError('Invalid or expired reset code', 400);
    }

    if (Date.now() > entry.expires) {
      resetCodes.delete(email.toLowerCase());
      throw new AppError('Reset code has expired', 400);
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

    resetCodes.delete(email.toLowerCase());

    return { message: 'Password has been reset successfully' };
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new AppError('Invalid token', 401);
    }
  }

  async verifyPassword(userId, password) {
    // Check if using fallback admin (id: 0)
    if (userId === 0) {
      const FALLBACK_ADMIN_PASSWORD = 'admin123456';
      return password === FALLBACK_ADMIN_PASSWORD;
    }

    // Regular database user
    const user = await User.findByPk(userId);
    if (!user) {
      return false;
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    return isValid;
  }

  async getAllAdmins() {
    const FALLBACK_ADMIN = {
      id: 0,
      email: 'admin@example.com',
      name: 'System Administrator',
      role: 'admin',
      isFallback: true,
    };

    // Get all users from database
    const dbAdmins = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'created_at'],
      order: [['created_at', 'DESC']],
    });

    // Format and include fallback admin
    const admins = dbAdmins.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      isFallback: false,
    }));

    // Add fallback admin at the beginning
    return [FALLBACK_ADMIN, ...admins];
  }

  async deleteAdmin(adminId, currentUserId) {
    // Prevent deleting fallback admin
    if (adminId === 0) {
      throw new AppError('Cannot delete the default admin account', 400);
    }

    // Prevent self-deletion
    if (adminId === currentUserId) {
      throw new AppError('You cannot delete your own account', 400);
    }

    const user = await User.findByPk(adminId);
    if (!user) {
      throw new AppError('Admin not found', 404);
    }

    await user.destroy();

    return { message: 'Admin account deleted successfully' };
  }

  async adminChangePassword(currentAdminId, currentPassword, targetAdminId, newPassword) {
    // Verify the current admin's password first
    const isValidPassword = await this.verifyPassword(currentAdminId, currentPassword);
    if (!isValidPassword) {
      throw new AppError('Current password is incorrect', 401);
    }

    if (newPassword.length < 6) {
      throw new AppError('New password must be at least 6 characters', 400);
    }

    // Handle fallback admin
    if (targetAdminId === 0) {
      throw new AppError('Cannot change the default admin password. Create a new admin account instead.', 400);
    }

    // Change the target admin's password
    const targetUser = await User.findByPk(targetAdminId);
    if (!targetUser) {
      throw new AppError('Target admin not found', 404);
    }

    targetUser.password_hash = await bcrypt.hash(newPassword, 10);
    await targetUser.save();

    return { message: `Password updated successfully for ${targetUser.name}` };
  }
}

module.exports = new AuthService();
