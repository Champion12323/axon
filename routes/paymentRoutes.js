// src/routes/payment.routes.js

import express from 'express';
import * as paymentController from '../controllers/paymentController.js';
import { authenticate, requireRole } from '../middleware/authenticate.js';

const router = express.Router();

// ── Webhooks — NO auth (provider calls these directly) ───────
// ⚠️ Must use express.raw() for Stripe signature verification
router.post(
  '/webhook/razorpay',
  express.json(),
  paymentController.razorpayWebhook
);

router.post(
  '/webhook/stripe',
  express.raw({ type: 'application/json' }), // Raw body needed for Stripe
  paymentController.stripeWebhook
);

// ── Both roles ───────────────────────────────────────────────

// My payment history
router.get(
  '/',
  authenticate,
  paymentController.getMyPayments
);

// Payments for a specific contract
router.get(
  '/contract/:contractId',
  authenticate,
  paymentController.getPaymentsByContract
);

// ── Brand only ───────────────────────────────────────────────

// Initiate milestone payment
router.post(
  '/milestone/:milestoneId',
  authenticate,
  requireRole('BRAND'),
  paymentController.initiatePayment
);

// Confirm payment (after frontend Razorpay success)
router.post(
  '/:paymentId/confirm',
  authenticate,
  requireRole('BRAND'),
  paymentController.confirmPayment
);

// Refund
router.post(
  '/:paymentId/refund',
  authenticate,
  requireRole('BRAND'),
  paymentController.refundPayment
);

// ── Influencer only ──────────────────────────────────────────

// Stripe Connect onboarding
router.post(
  '/onboard/stripe',
  authenticate,
  requireRole('INFLUENCER'),
  paymentController.onboardStripe
);

export default router;