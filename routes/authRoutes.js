// ============================================
//  Auth Routes
//  POST /api/v1/auth/register
//  POST /api/v1/auth/login
//  POST /api/v1/auth/logout
//  POST /api/v1/auth/logout-all
//  POST /api/v1/auth/refresh
//  GET  /api/v1/auth/verify-email
//  POST /api/v1/auth/resend-verification
//  POST /api/v1/auth/forgot-password
//  POST /api/v1/auth/reset-password
//  GET  /api/v1/auth/me
// ============================================

import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import authController from '../controllers/authController.js';
import { validate } from '../middleware/validate.js';
import { authSchemas } from '../schemas/authSchemas.js';
import { rateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// ─────────────────────────────────────────────
// Public routes
// ─────────────────────────────────────────────

router.post(
  '/register',
  rateLimiter(10, '15m'),
  validate(authSchemas.register),
  authController.register,
);

router.post(
  '/login',
  rateLimiter(10, '15m'),        // ✅ brute force protection
  validate(authSchemas.login),   // ✅ validate add kiya
  authController.login,
);

router.post(
  '/refresh',
  rateLimiter(30, '15m'),        // ✅ rate limit — silent background calls
  authController.refresh,
);

router.get('/verify-email', authController.verifyEmail);

router.post(
  '/forgot-password',
  rateLimiter(5, '15m'),
  validate(authSchemas.forgotPassword),
  authController.forgotPassword,
);

router.post(
  '/reset-password',
  rateLimiter(5, '15m'),
  validate(authSchemas.resetPassword),
  authController.resetPassword,
);

// ─────────────────────────────────────────────
// Protected routes
// ─────────────────────────────────────────────

router.post(
  '/logout',
  authenticate,                  // ✅ authenticate add kiya — pehle missing tha
  authController.logout,
);

router.post(
  '/logout-all',
  authenticate,
  authController.logoutAll,
);

router.post(
  '/resend-verification',
  authenticate,
  rateLimiter(3, '1h'),
  authController.resendVerification,
);

router.get(
  '/me',
  authenticate,
  authController.me,
);

export default router;