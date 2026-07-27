const authService = require('../services/auth.service');
const { asyncHandler, AppError } = require('../middleware/errorHandler.middleware');

class AuthController {
  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await authService.login(email, password);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result
    });
  });

  me = asyncHandler(async (req, res) => {
    return res.status(200).json({
      success: true,
      data: { user: req.user }
    });
  });

  changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const result = await authService.changePassword(req.user.id, currentPassword, newPassword);

    return res.json({ success: true, data: result });
  });

  register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    const result = await authService.createAdmin(name, email, password);

    return res.status(201).json({
      success: true,
      data: result,
      message: 'Admin account created'
    });
  });

  forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const result = await authService.forgotPassword(email);

    return res.json({ success: true, data: result });
  });

  resetPassword = asyncHandler(async (req, res) => {
    const { token, newPassword } = req.body;
    const result = await authService.resetPassword(token, newPassword);

    return res.json({ success: true, data: result });
  });

  verifyPassword = asyncHandler(async (req, res) => {
    const { password } = req.body;
    const result = await authService.verifyPassword(req.user.id, password);

    return res.status(200).json({
      success: result,
      message: result ? 'Password verified' : 'Incorrect password'
    });
  });

  getAllAdmins = asyncHandler(async (req, res) => {
    const admins = await authService.getAllAdmins();

    return res.status(200).json({
      success: true,
      data: admins
    });
  });

  deleteAdmin = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await authService.deleteAdmin(parseInt(id), req.user.id);

    return res.status(200).json({
      success: true,
      data: result
    });
  });

  adminChangePassword = asyncHandler(async (req, res) => {
    const { adminId, currentPassword, newPassword } = req.body;
    const result = await authService.adminChangePassword(
      req.user.id,
      currentPassword,
      adminId,
      newPassword
    );

    return res.status(200).json({
      success: true,
      data: result
    });
  });
}

module.exports = new AuthController();
