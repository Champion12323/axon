// src/controllers/payment.controller.js

import * as paymentService from '../services/payments/paymentService.js';
// Initiate payment for a milestone
export async function initiatePayment(req, res, next) {
  try {
    const result = await paymentService.initiatePayment(req.params.milestoneId, req.user.id);
    res.status(201).json({ success: true, data: result });
  } catch (err) { next(err); }
}

// Confirm payment after frontend success (Razorpay)
export async function confirmPayment(req, res, next) {
  try {
    const { providerPaymentId, providerOrderId, signature, provider } = req.body;
    const result = await paymentService.confirmPayment({
      io: req.io,
      paymentId: req.params.paymentId,
      providerPaymentId,
      providerOrderId,
      signature,
      provider,
    });
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

// Refund a payment
export async function refundPayment(req, res, next) {
  try {
    const result = await paymentService.refundPayment(
     req.io, req.params.paymentId, req.user.id, req.body.reason
    );
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

// Stripe Connect onboarding for influencer
export async function onboardStripe(req, res, next) {
  try {
    const result = await paymentService.onboardInfluencerStripe(req.user.id);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

// Get payments for a contract
export async function getPaymentsByContract(req, res, next) {
  try {
    const payments = await paymentService.getPaymentsByContract(req.params.contractId, req.user.id);
    res.json({ success: true, data: payments });
  } catch (err) { next(err); }
}

// Get my payment history
export async function getMyPayments(req, res, next) {
  try {
    const result = await paymentService.getMyPayments(req.user.id, req.user.role, req.query);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

// Razorpay webhook
export async function razorpayWebhook(req, res, next) {
  try {
    await paymentService.handleRazorpayWebhook(req.io,req.body, req.headers['x-razorpay-signature']);
    res.json({ received: true });
  } catch (err) { next(err); }
}

// Stripe webhook
export async function stripeWebhook(req, res, next) {
  try {
    await paymentService.handleStripeWebhook(req.io,req.body, req.headers['stripe-signature']);
    res.json({ received: true });
  } catch (err) { next(err); }
}