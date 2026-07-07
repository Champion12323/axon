// src/services/payments/stripeService.js
// Handles all global payments — USD, EUR, Cards, Wallets

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-04-10',
});

// ─────────────────────────────────────────────
// PAYMENT INTENT — Brand initiates payment
// ─────────────────────────────────────────────

/**
 * Create a Stripe PaymentIntent for milestone payment
 */
export async function createPaymentIntent({ amount, currency = 'usd', metadata = {} }) {
  const paymentIntent = await stripe.paymentIntents.create({
    amount:   Math.round(amount * 100), // Stripe needs cents
    currency: currency.toLowerCase(),
    automatic_payment_methods: { enabled: true },
    metadata, // contractId, milestoneId, brandId etc
  });

  return {
    clientSecret:    paymentIntent.client_secret, // Send to frontend
    paymentIntentId: paymentIntent.id,
    amount:          paymentIntent.amount / 100,
    currency:        paymentIntent.currency,
  };
}

/**
 * Retrieve a PaymentIntent to check status
 */
export async function getPaymentIntent(paymentIntentId) {
  return stripe.paymentIntents.retrieve(paymentIntentId);
}

// ─────────────────────────────────────────────
// CONNECT — Influencer onboarding (receive payouts)
// Stripe Connect lets influencers receive money
// ─────────────────────────────────────────────

/**
 * Create a Stripe Connect account for influencer
 */
export async function createConnectAccount({ email, country = 'IN' }) {
  const account = await stripe.accounts.create({
    type:    'express',  // Stripe handles KYC UI
    country,
    email,
    capabilities: {
      transfers: { requested: true },
    },
  });

  return { accountId: account.id };
}

/**
 * Generate onboarding link for influencer
 * Influencer completes bank details on Stripe's page
 */
export async function createOnboardingLink({ accountId, returnUrl, refreshUrl }) {
  const link = await stripe.accountLinks.create({
    account:     accountId,
    refresh_url: refreshUrl,
    return_url:  returnUrl,
    type:        'account_onboarding',
  });

  return { url: link.url };
}

/**
 * Check if influencer's Connect account is fully set up
 */
export async function getConnectAccountStatus(accountId) {
  const account = await stripe.accounts.retrieve(accountId);
  return {
    isReady:          account.details_submitted && account.charges_enabled,
    detailsSubmitted: account.details_submitted,
    chargesEnabled:   account.charges_enabled,
    payoutsEnabled:   account.payouts_enabled,
  };
}

// ─────────────────────────────────────────────
// TRANSFER — Send money to influencer
// ─────────────────────────────────────────────

/**
 * Transfer influencer payout via Stripe Connect
 */
export async function createTransfer({ amount, currency = 'usd', destinationAccountId, metadata = {} }) {
  const transfer = await stripe.transfers.create({
    amount:      Math.round(amount * 100),
    currency:    currency.toLowerCase(),
    destination: destinationAccountId, // Influencer's Stripe Connect account
    metadata,
  });

  return {
    transferId: transfer.id,
    amount:     transfer.amount / 100,
    currency:   transfer.currency,
  };
}

// ─────────────────────────────────────────────
// REFUND
// ─────────────────────────────────────────────

export async function createRefund({ paymentIntentId, amount, reason = 'requested_by_customer' }) {
  const refund = await stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount: amount ? Math.round(amount * 100) : undefined, // undefined = full refund
    reason,
  });

  return {
    refundId: refund.id,
    status:   refund.status,
    amount:   refund.amount / 100,
  };
}

// ─────────────────────────────────────────────
// WEBHOOK — Verify incoming Stripe webhooks
// ─────────────────────────────────────────────

export function constructWebhookEvent(payload, signature) {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );
}