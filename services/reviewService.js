import prisma from '../config/prisma.js';
import { emitNotification } from '../notificationCenter/notificationEmitter.js';

// ─────────────────────────────────────────────
// CREATE REVIEW
// 🔔 Notifies: reviewee — new review received
// ─────────────────────────────────────────────

export async function createReview(io, reviewerId, data) {
  const { contractId, rating, body, tags } = data;

  // Contract fetch — verify completed + reviewer is party
  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    include: {
      campaign: { select: { id: true, title: true } },
      brand:    { select: { id: true, name: true } },
      influencer: { select: { id: true, name: true } },
    },
  });

  if (!contract) throw Object.assign(new Error('Contract not found'), { statusCode: 404 });

  // Only COMPLETED contracts can be reviewed
  if (contract.status !== 'COMPLETED') {
    throw Object.assign(new Error('Can only review completed contracts'), { statusCode: 400 });
  }

  // Reviewer must be brand or influencer on this contract
  const isBrand      = contract.brandId === reviewerId;
  const isInfluencer = contract.influencerId === reviewerId;

  if (!isBrand && !isInfluencer) {
    throw Object.assign(new Error('Unauthorized'), { statusCode: 403 });
  }

  // Check already reviewed
  const existing = await prisma.review.findUnique({
    where: { contractId_reviewerId: { contractId, reviewerId } },
  });
  if (existing) throw Object.assign(new Error('You have already reviewed this contract'), { statusCode: 409 });

  const reviewerRole = isBrand ? 'BRAND' : 'INFLUENCER';
  const revieweeId   = isBrand ? contract.influencerId : contract.brandId;
  const reviewee     = isBrand ? contract.influencer : contract.brand;
  const reviewer     = isBrand ? contract.brand : contract.influencer;

  // Create review + update reviewee's avg rating in transaction
  const [review] = await prisma.$transaction(async (tx) => {
    const newReview = await tx.review.create({
      data: {
        contractId,
        reviewerId,
        revieweeId,
        campaignId: contract.campaignId,
        rating,
        body,
        tags,
        reviewerRole,
      },
      include: {
        reviewer: { select: { id: true, name: true, avatar: true } },
      },
    });

    // Recalculate avg rating for reviewee
    const stats = await tx.review.aggregate({
      where: { revieweeId, isVisible: true },
      _avg:  { rating: true },
      _count: { rating: true },
    });

    await tx.user.update({
      where: { id: revieweeId },
      data: {
        averageRating: parseFloat((stats._avg.rating ?? 0).toFixed(2)),
        totalReviews:  stats._count.rating,
      },
    });

    return [newReview];
  });

  // 🔔 Reviewee ko notify karo
  await emitNotification(io, {
    userId: revieweeId,
    type:   'SYSTEM',
    title:  `${reviewer.name} left you a ${rating}-star review`,
    body:   body.slice(0, 100) + (body.length > 100 ? '...' : ''),
    link:   `/profile/reviews`,
    meta:   { reviewId: review.id, contractId, rating },
  });

  return review;
}

// ─────────────────────────────────────────────
// GET REVIEWS FOR A USER (public profile)
// ─────────────────────────────────────────────

export async function getUserReviews(revieweeId, filters = {}) {
  const { page = 1, limit = 10, rating, role } = filters;
  const skip = (page - 1) * limit;

  const where = {
    revieweeId,
    isVisible: true,
    ...(rating && { rating: Number(rating) }),
    ...(role   && { reviewerRole: role }),
  };

  const [reviews, total, stats] = await Promise.all([
    prisma.review.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        reviewer: { select: { id: true, name: true, avatar: true } },
        campaign: { select: { id: true, title: true } },
      },
    }),
    prisma.review.count({ where }),
    // Rating breakdown (1-5 star counts)
    prisma.review.groupBy({
      by: ['rating'],
      where: { revieweeId, isVisible: true },
      _count: { rating: true },
    }),
  ]);

  // Build breakdown { 1: 0, 2: 1, 3: 2, 4: 10, 5: 35 }
  const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  stats.forEach(s => { breakdown[s.rating] = s._count.rating; });

  const user = await prisma.user.findUnique({
    where:  { id: revieweeId },
    select: { averageRating: true, totalReviews: true },
  });

  return {
    data: reviews,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    summary: {
      averageRating: user?.averageRating ?? 0,
      totalReviews:  user?.totalReviews  ?? 0,
      breakdown,
    },
  };
}

// ─────────────────────────────────────────────
// CHECK REVIEW STATUS — Can user review this contract?
// ─────────────────────────────────────────────

export async function getReviewStatus(contractId, userId) {
  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    select: { status: true, brandId: true, influencerId: true },
  });

  if (!contract) throw Object.assign(new Error('Contract not found'), { statusCode: 404 });

  const isParty = contract.brandId === userId || contract.influencerId === userId;
  if (!isParty) throw Object.assign(new Error('Unauthorized'), { statusCode: 403 });

  const existing = await prisma.review.findUnique({
    where: { contractId_reviewerId: { contractId, reviewerId: userId } },
  });

  return {
    canReview:     contract.status === 'COMPLETED' && !existing,
    alreadyReviewed: !!existing,
    contractStatus: contract.status,
    review: existing ?? null,
  };
}

// ─────────────────────────────────────────────
// MARK HELPFUL
// ─────────────────────────────────────────────

export async function markHelpful(reviewId, userId) {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw Object.assign(new Error('Review not found'), { statusCode: 404 });

  // Reviewer apna review helpful mark nahi kar sakta
  if (review.reviewerId === userId) {
    throw Object.assign(new Error('Cannot mark your own review as helpful'), { statusCode: 400 });
  }

  return prisma.review.update({
    where: { id: reviewId },
    data:  { helpfulCount: { increment: 1 } },
  });
}