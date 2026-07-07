// src/services/payments/razorpayService.js
// Handles all Indian payments — INR, UPI, Cards, NetBanking

import Razorpay from 'razorpay';
import crypto   from 'crypto';

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ─────────────────────────────────────────────
// ORDER — Brand initiates payment
// ─────────────────────────────────────────────

/**
 * Create a Razorpay order for milestone payment
 * Brand pays this amount
 */
export async function createOrder({ amount, currency = 'INR', receipt, notes = {} }) {
  const order = await razorpay.orders.create({
    amount:   Math.round(amount * 100), // Razorpay needs paise (1 INR = 100 paise)
    currency,
    receipt,  // e.g. "milestone_id_123"
    notes,    // Extra info — contractId, milestoneId etc
  });

  return {
    orderId:  order.id,          // rp_order_xxxx
    amount:   order.amount / 100,
    currency: order.currency,
    receipt:  order.receipt,
  };
}

// ─────────────────────────────────────────────
// VERIFY — After brand pays on frontend
// ─────────────────────────────────────────────

/**
 * Verify Razorpay payment signature
 * Called after frontend payment success
 */
export function verifyPaymentSignature({ orderId, paymentId, signature }) {
  const body      = orderId + '|' + paymentId;
  const expected  = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  return expected === signature;
}

/**
 * Fetch payment details from Razorpay
 */
export async function fetchPayment(paymentId) {
  return razorpay.payments.fetch(paymentId);
}

// ─────────────────────────────────────────────
// PAYOUT — Send money to influencer
// Requires Razorpay X account
// ─────────────────────────────────────────────

/**
 * Create a payout to influencer's bank/UPI
 */
export async function createPayout({ amount, currency = 'INR', accountNumber, ifsc, name, upi, mode = 'IMPS', notes = {} }) {
  // mode: NEFT | RTGS | IMPS | UPI

  const contact = await razorpay.contacts.create({
    name,
    type: 'vendor',
  });

  // Add fund account (bank or UPI)
  const fundAccountData = upi
    ? {
        contact_id:   contact.id,
        account_type: 'vpa',
        vpa:          { address: upi },
      }
    : {
        contact_id:    contact.id,
        account_type:  'bank_account',
        bank_account:  { name, ifsc, account_number: accountNumber },
      };

  const fundAccount = await razorpay.fundAccount.create(fundAccountData);

  const payout = await razorpay.payouts.create({
    account_number: process.env.RAZORPAY_X_ACCOUNT_NUMBER, // Your RazorpayX account
    fund_account_id: fundAccount.id,
    amount:  Math.round(amount * 100),
    currency,
    mode,
    purpose: 'payout',
    queue_if_low_balance: true,
    notes,
  });

  return {
    payoutId: payout.id,
    status:   payout.status,
    utr:      payout.utr, // Bank transaction reference
  };
}

// ─────────────────────────────────────────────
// REFUND — Refund to brand
// ─────────────────────────────────────────────

export async function createRefund({ paymentId, amount, notes = {} }) {
  const refund = await razorpay.payments.refund(paymentId, {
    amount: Math.round(amount * 100),
    notes,
  });

  return {
    refundId: refund.id,
    status:   refund.status,
    amount:   refund.amount / 100,
  };
}

// ─────────────────────────────────────────────
// WEBHOOK — Verify incoming Razorpay webhooks
// ─────────────────────────────────────────────

export function verifyWebhookSignature(body, signature) {
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(JSON.stringify(body))
    .digest('hex');

  return expected === signature;
}