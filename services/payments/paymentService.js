// src/services/payment.service.js
import prisma from '../../config/prisma.js';
import * as razorpayService from './razorpayService.js';
import * as stripeService from './stripeService.js';
import { emitNotification } from '../../notificationCenter/notificationEmitter.js';
// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function notFound(msg)   { return Object.assign(new Error(msg), { statusCode: 404 }); }
function forbidden(msg)  { return Object.assign(new Error(msg), { statusCode: 403 }); }
function badRequest(msg) { return Object.assign(new Error(msg), { statusCode: 400 }); }

function detectProvider(currency) {
  return currency.toUpperCase() === 'INR' ? 'RAZORPAY' : 'STRIPE';
}

// ─────────────────────────────────────────────
// INITIATE PAYMENT
// (no notification here — brand initiated it themselves)
// ─────────────────────────────────────────────

export async function initiatePayment(milestoneId, brandId) {
  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: { contract: true },
  });

  if (!milestone)                             throw notFound('Milestone not found');
  if (milestone.contract.brandId !== brandId) throw forbidden('Unauthorized');
  if (milestone.contract.status !== 'ACTIVE') throw badRequest('Contract must be ACTIVE');
  if (milestone.status !== 'APPROVED')        throw badRequest('Milestone must be APPROVED before payment');

  const existing = await prisma.payment.findUnique({ where: { milestoneId } });
  if (existing?.status === 'COMPLETED') throw badRequest('Milestone already paid');

  const contract = milestone.contract;
  const provider = detectProvider(contract.currency);

  let providerData;

  if (provider === 'RAZORPAY') {
    providerData = await razorpayService.createOrder({
      amount:   milestone.amount,
      currency: contract.currency,
      receipt:  `milestone_${milestoneId}`,
      notes:    { milestoneId, contractId: contract.id, brandId },
    });
  } else {
    providerData = await stripeService.createPaymentIntent({
      amount:   milestone.amount,
      currency: contract.currency,
      metadata: { milestoneId, contractId: contract.id, brandId },
    });
  }

  const payment = await prisma.payment.upsert({
    where:  { milestoneId },
    update: {
      providerOrderId: provider === 'RAZORPAY'
        ? providerData.orderId
        : providerData.paymentIntentId,
      status: 'PENDING',
    },
    create: {
      milestoneId,
      contractId:       contract.id,
      brandId,
      influencerId:     contract.influencerId,
      provider,
      currency:         contract.currency,
      totalAmount:      milestone.amount,
      platformFee:      contract.platformFees,
      influencerPayout: contract.influencerPayout,
      providerOrderId:  provider === 'RAZORPAY'
        ? providerData.orderId
        : providerData.paymentIntentId,
      status: 'PENDING',
    },
  });

  return {
    paymentId: payment.id,
    provider,
    currency:  contract.currency,
    amount:    milestone.amount,
    ...(provider === 'RAZORPAY' && {
      razorpayOrderId: providerData.orderId,
      razorpayKeyId:   process.env.RAZORPAY_KEY_ID,
    }),
    ...(provider === 'STRIPE' && {
      stripeClientSecret:   providerData.clientSecret,
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    }),
  };
}

// ─────────────────────────────────────────────
// CONFIRM PAYMENT
// 🔔 Notifies: influencer — payment received
// 🔔 Notifies: brand — payment confirmed
// ─────────────────────────────────────────────

export async function confirmPayment(io, { paymentId, providerPaymentId, providerOrderId, signature, provider }) {
  const payment = await prisma.payment.findUnique({
    where:   { id: paymentId },
    include: {
      contract: {
        include: { campaign: { select: { title: true } } },
      },
      milestone: { select: { title: true } },
    },
  });

  if (!payment) throw notFound('Payment not found');
  if (payment.status === 'COMPLETED') throw badRequest('Payment already confirmed');

  if (provider === 'RAZORPAY') {
    const isValid = razorpayService.verifyPaymentSignature({
      orderId:   providerOrderId,
      paymentId: providerPaymentId,
      signature,
    });
    if (!isValid) throw badRequest('Invalid payment signature');
  }

  await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status:            'COMPLETED',
      providerPaymentId,
      providerSignature: signature,
      completedAt:       new Date(),
    },
  });

  await prisma.milestone.update({
    where: { id: payment.milestoneId },
    data:  { status: 'PAID', paidAt: new Date(), paymentId },
  });

  const amountFormatted = payment.currency === 'INR'
    ? `₹${payment.influencerPayout.toLocaleString('en-IN')}`
    : `${payment.currency} ${payment.influencerPayout}`;

  // 🔔 Influencer — payment received, payout incoming
  await emitNotification(io, {
    userId: payment.influencerId,
    type:   'PAYMENT',
    title:  `Payment of ${amountFormatted} received`,
    body:   `Milestone: "${payment.milestone.title}" — ${payment.contract.campaign.title}. Payout is being processed.`,
    link:   `/payments`,
    meta:   { paymentId, milestoneId: payment.milestoneId, contractId: payment.contractId },
  });

  // 🔔 Brand — payment confirmed
  await emitNotification(io, {
    userId: payment.brandId,
    type:   'PAYMENT',
    title:  `Payment confirmed`,
    body:   `Milestone "${payment.milestone.title}" paid successfully — ${payment.contract.campaign.title}`,
    link:   `/contracts/${payment.contractId}`,
    meta:   { paymentId, milestoneId: payment.milestoneId, contractId: payment.contractId },
  });

  // Trigger payout
  await releasePayoutToInfluencer(io, payment);

  return { success: true, message: 'Payment confirmed and payout initiated' };
}

// ─────────────────────────────────────────────
// RELEASE PAYOUT
// 🔔 Notifies: influencer — payout processing or failed
// ─────────────────────────────────────────────

async function releasePayoutToInfluencer(io, payment) {
  try {
    const influencer = await prisma.user.findUnique({
      where:  { id: payment.influencerId },
      select: {
        name:              true,
        email:             true,
        razorpayContactId: true,
        stripeAccountId:   true,
        bankAccount:       true,
      },
    });

    let payoutId;

    if (payment.provider === 'RAZORPAY') {
      const bankInfo = influencer.bankAccount;
      const result = await razorpayService.createPayout({
        amount:        payment.influencerPayout,
        currency:      payment.currency,
        accountNumber: bankInfo?.accountNumber,
        ifsc:          bankInfo?.ifsc,
        upi:           bankInfo?.upi,
        name:          influencer.name,
        mode:          bankInfo?.upi ? 'UPI' : 'IMPS',
        notes:         { paymentId: payment.id },
      });
      payoutId = result.payoutId;
    } else {
      const result = await stripeService.createTransfer({
        amount:               payment.influencerPayout,
        currency:             payment.currency,
        destinationAccountId: influencer.stripeAccountId,
        metadata:             { paymentId: payment.id },
      });
      payoutId = result.transferId;
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data:  { payoutId, payoutStatus: 'PROCESSING', payoutAt: new Date() },
    });

    // 🔔 Influencer — payout initiated
    await emitNotification(io, {
      userId: payment.influencerId,
      type:   'PAYMENT',
      title:  'Payout is being processed',
      body:   `Your payout will arrive in your bank/UPI account within 1-2 business days`,
      link:   `/payments`,
      meta:   { paymentId: payment.id, payoutId },
    });

  } catch (err) {
    console.error('[Payout Error]', err.message);

    await prisma.payment.update({
      where: { id: payment.id },
      data:  { payoutStatus: 'FAILED' },
    });

    // 🔔 Influencer — payout failed
    await emitNotification(io, {
      userId: payment.influencerId,
      type:   'PAYMENT',
      title:  'Payout failed — we will retry',
      body:   `There was an issue processing your payout. Our team has been notified and will resolve this.`,
      link:   `/payments`,
      meta:   { paymentId: payment.id, error: err.message },
    }).catch(() => {}); // silent fail — don't throw inside catch
  }
}

// ─────────────────────────────────────────────
// REFUND
// 🔔 Notifies: influencer — payment refunded
// 🔔 Notifies: brand — refund confirmed
// ─────────────────────────────────────────────

export async function refundPayment(io, paymentId, brandId, reason) {
  const payment = await prisma.payment.findUnique({
    where:   { id: paymentId },
    include: {
      contract: {
        include: { campaign: { select: { title: true } } },
      },
      milestone: { select: { title: true } },
    },
  });

  if (!payment)                       throw notFound('Payment not found');
  if (payment.brandId !== brandId)    throw forbidden('Unauthorized');
  if (payment.status !== 'COMPLETED') throw badRequest('Only completed payments can be refunded');

  let refundData;

  if (payment.provider === 'RAZORPAY') {
    refundData = await razorpayService.createRefund({
      paymentId: payment.providerPaymentId,
      amount:    payment.totalAmount,
      notes:     { reason },
    });
  } else {
    refundData = await stripeService.createRefund({
      paymentIntentId: payment.providerOrderId,
      reason:          'requested_by_customer',
    });
  }

  const updated = await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status:       'REFUNDED',
      refundId:     refundData.refundId,
      refundReason: reason,
      refundedAt:   new Date(),
    },
  });

  const amountFormatted = payment.currency === 'INR'
    ? `₹${payment.totalAmount.toLocaleString('en-IN')}`
    : `${payment.currency} ${payment.totalAmount}`;

  // 🔔 Influencer — payment reversed
  await emitNotification(io, {
    userId: payment.influencerId,
    type:   'PAYMENT',
    title:  `Payment of ${amountFormatted} has been refunded`,
    body:   `Milestone: "${payment.milestone.title}" — ${payment.contract.campaign.title}`,
    link:   `/payments`,
    meta:   { paymentId, refundId: refundData.refundId, reason },
  });

  // 🔔 Brand — refund confirmed
  await emitNotification(io, {
    userId: payment.brandId,
    type:   'PAYMENT',
    title:  `Refund of ${amountFormatted} processed`,
    body:   `Milestone "${payment.milestone.title}" refunded successfully`,
    link:   `/payments`,
    meta:   { paymentId, refundId: refundData.refundId },
  });

  return updated;
}

// ─────────────────────────────────────────────
// STRIPE CONNECT — Influencer onboarding
// ─────────────────────────────────────────────

export async function onboardInfluencerStripe(influencerId) {
  const influencer = await prisma.user.findUnique({
    where:  { id: influencerId },
    select: { email: true, stripeAccountId: true },
  });

  if (!influencer) throw notFound('Influencer not found');

  let accountId = influencer.stripeAccountId;
  if (!accountId) {
    const account = await stripeService.createConnectAccount({ email: influencer.email });
    accountId = account.accountId;
    await prisma.user.update({
      where: { id: influencerId },
      data:  { stripeAccountId: accountId },
    });
  }

  const { url } = await stripeService.createOnboardingLink({
    accountId,
    returnUrl:  `${process.env.FRONTEND_URL}/dashboard?stripe=success`,
    refreshUrl: `${process.env.FRONTEND_URL}/dashboard?stripe=refresh`,
  });

  return { onboardingUrl: url };
}

// ─────────────────────────────────────────────
// WEBHOOKS
// io yahan inject karo app.js se — getIO() pattern use karo
// 🔔 Notifies: influencer — payout completed via webhook
// ─────────────────────────────────────────────

export async function handleRazorpayWebhook(io, body, signature) {
  const isValid = razorpayService.verifyWebhookSignature(body, signature);
  if (!isValid) throw badRequest('Invalid webhook signature');

  const { event, payload } = body;

  if (event === 'payout.processed') {
    const payoutId = payload.payout.entity.id;
    await prisma.payment.updateMany({
      where: { payoutId },
      data:  { payoutStatus: 'COMPLETED' },
    });

    // Fetch payment to notify influencer
    const payment = await prisma.payment.findFirst({
      where: { payoutId },
      select: { influencerId: true, influencerPayout: true, currency: true, id: true },
    });

    if (payment) {
      const amt = payment.currency === 'INR'
        ? `₹${payment.influencerPayout.toLocaleString('en-IN')}`
        : `${payment.currency} ${payment.influencerPayout}`;

      // 🔔 Influencer — payout arrived
      await emitNotification(io, {
        userId: payment.influencerId,
        type:   'PAYMENT',
        title:  `${amt} credited to your account`,
        body:   'Your payout has been successfully transferred to your bank/UPI account',
        link:   `/payments`,
        meta:   { paymentId: payment.id, payoutId },
      });
    }
  }

  if (event === 'payout.failed') {
    const payoutId = payload.payout.entity.id;
    await prisma.payment.updateMany({
      where: { payoutId },
      data:  { payoutStatus: 'FAILED' },
    });

    const payment = await prisma.payment.findFirst({
      where:  { payoutId },
      select: { influencerId: true, id: true },
    });

    if (payment) {
      // 🔔 Influencer — payout failed via webhook
      await emitNotification(io, {
        userId: payment.influencerId,
        type:   'PAYMENT',
        title:  'Payout failed',
        body:   'Your payout could not be processed. Please check your bank details or contact support.',
        link:   `/payments`,
        meta:   { paymentId: payment.id, payoutId },
      });
    }
  }
}

export async function handleStripeWebhook(io, payload, signature) {
  const event = stripeService.constructWebhookEvent(payload, signature);

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object;
    const payment = await prisma.payment.findFirst({
      where: { providerOrderId: intent.id },
    });
    if (payment && payment.status !== 'COMPLETED') {
      await confirmPayment(io, {
        paymentId:         payment.id,
        providerPaymentId: intent.latest_charge,
        providerOrderId:   intent.id,
        provider:          'STRIPE',
      });
    }
  }

  if (event.type === 'transfer.paid') {
    const transfer = event.data.object;
    await prisma.payment.updateMany({
      where: { payoutId: transfer.id },
      data:  { payoutStatus: 'COMPLETED' },
    });

    const payment = await prisma.payment.findFirst({
      where:  { payoutId: transfer.id },
      select: { influencerId: true, influencerPayout: true, currency: true, id: true },
    });

    if (payment) {
      const amt = payment.currency === 'INR'
        ? `₹${payment.influencerPayout.toLocaleString('en-IN')}`
        : `${payment.currency} ${payment.influencerPayout}`;

      // 🔔 Influencer — Stripe payout arrived
      await emitNotification(io, {
        userId: payment.influencerId,
        type:   'PAYMENT',
        title:  `${amt} credited to your account`,
        body:   'Your Stripe payout has been successfully transferred',
        link:   `/payments`,
        meta:   { paymentId: payment.id, transferId: transfer.id },
      });
    }
  }
}

// ─────────────────────────────────────────────
// GET PAYMENTS
// ─────────────────────────────────────────────

export async function getPaymentsByContract(contractId, userId) {
  const contract = await prisma.contract.findUnique({ where: { id: contractId } });
  if (!contract) throw notFound('Contract not found');

  const isParty = contract.brandId === userId || contract.influencerId === userId;
  if (!isParty) throw forbidden('Unauthorized');

  return prisma.payment.findMany({
    where:   { contractId },
    orderBy: { createdAt: 'desc' },
    include: { milestone: { select: { title: true, order: true } } },
  });
}

export async function getMyPayments(userId, role, filters = {}) {
  const { page = 1, limit = 10, status } = filters;
  const skip = (page - 1) * limit;

  const where = {
    ...(role === 'BRAND'      && { brandId: userId }),
    ...(role === 'INFLUENCER' && { influencerId: userId }),
    ...(status                && { status }),
  };

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        milestone: { select: { title: true, order: true } },
        contract:  { select: { title: true } },
      },
    }),
    prisma.payment.count({ where }),
  ]);

  return {
    data: payments,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
}