// ============================================
//  Auth Controller
// ============================================

import * as authService from '../services/authService.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { setCookies, clearCookies } from '../utils/cookies.js';

const authController = {

  // POST /auth/register
  register: asyncHandler(async (req, res) => {
    const user = await authService.register(req.body);
    res.status(201).json({
      success: true,
      message: 'Registration successful. Check your email to verify your account.',
      data: { id: user.id, email: user.email, role: user.role }
    });
  }),

  // POST /auth/login
  login: asyncHandler(async (req, res) => {
    const { user, accessToken, refreshToken } = await authService.login(req.body);
    setCookies(res, { accessToken, refreshToken });
    res.json({
      success: true,
      data: { user, accessToken }
    });
  }),

  // POST /auth/refresh
  // ✅ Updated — DB token validation + rotation
  refresh: asyncHandler(async (req, res) => {
    const token = req.cookies?.refreshToken ?? req.body?.refreshToken;
    if (!token) throw new AppError('Refresh token missing', 401);

    const { accessToken, refreshToken: newRefreshToken } =
      await authService.refresh(token);

    // ✅ Rotate — naya refresh token cookie mein set karo
    setCookies(res, { accessToken, refreshToken: newRefreshToken });

    res.json({ success: true, data: { accessToken } });
  }),

  // POST /auth/logout
  // ✅ Fixed — userId se logout (token bhi pass karo for revocation)
  logout: asyncHandler(async (req, res) => {
    const token = req.cookies?.refreshToken ?? req.body?.refreshToken;
    await authService.logout(req.user.id, token);
    clearCookies(res);
    res.json({ success: true, message: 'Logged out successfully' });
  }),

  // POST /auth/logout-all
  // ✅ New — sab devices se logout
  logoutAll: asyncHandler(async (req, res) => {
    await authService.logoutAllDevices(req.user.id);
    clearCookies(res);
    res.json({ success: true, message: 'Logged out from all devices' });
  }),

  // GET /auth/verify-email?token=xxx
  verifyEmail: asyncHandler(async (req, res) => {
    const { token } = req.query;
    if (!token) throw new AppError('Verification token missing', 400);
    await authService.verifyEmail(token);
    res.json({ success: true, message: 'Email verified successfully' });
  }),

  // POST /auth/resend-verification
  resendVerification: asyncHandler(async (req, res) => {
    await authService.resendVerification(req.user.id);
    res.json({ success: true, message: 'Verification email sent' });
  }),

  // POST /auth/forgot-password
  forgotPassword: asyncHandler(async (req, res) => {
    await authService.forgotPassword(req.body.email);
    res.json({ success: true, message: 'If that email exists, a reset link has been sent' });
  }),

  // POST /auth/reset-password
  resetPassword: asyncHandler(async (req, res) => {
    const { token, password } = req.body;
    await authService.resetPassword(token, password);
    res.json({ success: true, message: 'Password reset successfully' });
  }),

  // GET /auth/me
  me: asyncHandler(async (req, res) => {
    const user = await authService.getMe(req.user.id);
    res.json({ success: true, data: { user } });
  }),

};

export default authController;