import prisma from '../config/prisma.js';

// ─────────────────────────────────────────────
// BRAND ANALYTICS
// ─────────────────────────────────────────────

export async function getBrandOverview(brandId) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const [
    totalSpend,
    lastMonthSpend,
    campaignCounts,
    thisMonthCampaigns,
    totalInfluencers,
    thisMonthInfluencers,
    avgEngagement,
  ] = await Promise.all([

    // Total spend all time
    prisma.payment.aggregate({
      where: { brandId, status: 'COMPLETED' },
      _sum: { totalAmount: true },
    }),

    // Last month spend (for delta)
    prisma.payment.aggregate({
      where: {
        brandId, status: 'COMPLETED',
        completedAt: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
      _sum: { totalAmount: true },
    }),

    // Campaign status breakdown
    prisma.campaign.groupBy({
      by: ['status'],
      where: { brandId },
      _count: { status: true },
    }),

    // New campaigns this month
    prisma.campaign.count({
      where: { brandId, createdAt: { gte: startOfMonth } },
    }),

    // Total unique influencers hired
    prisma.contract.findMany({
      where: { brandId, status: { in: ['ACTIVE', 'COMPLETED'] } },
      select: { influencerId: true },
      distinct: ['influencerId'],
    }),

    // New influencers this month
    prisma.contract.findMany({
      where: { brandId, createdAt: { gte: startOfMonth } },
      select: { influencerId: true },
      distinct: ['influencerId'],
    }),

    // Avg engagement from Instagram insights
    prisma.instagramInsight.aggregate({
      where: {
        influencerProfile: {
          user: {
            contractsAsInfluencer: { some: { brandId } },
          },
        },
      },
      _avg: { engagementRate: true },
    }),
  ]);

  const thisMonthSpendRaw = await prisma.payment.aggregate({
    where: { brandId, status: 'COMPLETED', completedAt: { gte: startOfMonth } },
    _sum: { totalAmount: true },
  });

  const thisMonthSpend = thisMonthSpendRaw._sum.totalAmount ?? 0;
  const prevMonthSpend = lastMonthSpend._sum.totalAmount ?? 1;
  const spendDelta = prevMonthSpend > 0
    ? Math.round(((thisMonthSpend - prevMonthSpend) / prevMonthSpend) * 100)
    : 0;

  const statusMap = {};
  campaignCounts.forEach(c => { statusMap[c.status] = c._count.status; });

  return {
    totalSpend:        totalSpend._sum.totalAmount ?? 0,
    spendDeltaPct:     spendDelta,
    campaigns: {
      total:     Object.values(statusMap).reduce((a, b) => a + b, 0),
      breakdown: statusMap,
      newThisMonth: thisMonthCampaigns,
    },
    influencers: {
      total:        totalInfluencers.length,
      newThisMonth: thisMonthInfluencers.length,
    },
    avgEngagementRate: parseFloat((avgEngagement._avg.engagementRate ?? 0).toFixed(2)),
  };
}

export async function getBrandSpendTrend(brandId, months = 6) {
  const results = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end   = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

    const agg = await prisma.payment.aggregate({
      where: {
        brandId, status: 'COMPLETED',
        completedAt: { gte: start, lte: end },
      },
      _sum: { totalAmount: true },
    });

    results.push({
      month:  start.toLocaleString('default', { month: 'short', year: '2-digit' }),
      amount: agg._sum.totalAmount ?? 0,
    });
  }

  return results;
}

export async function getBrandTopInfluencers(brandId, limit = 10) {
  const contracts = await prisma.contract.findMany({
    where:   { brandId, status: { in: ['ACTIVE', 'COMPLETED'] } },
    include: {
      influencer: {
        select: {
          id: true, name: true, avatar: true,
          influencerProfile: {
            select: { engagementRate: true, followerCount: true },
          },
          reviewsReceived: {
            select: { rating: true },
            where:  { reviewerId: brandId },
          },
        },
      },
      campaign:  { select: { id: true, title: true } },
      payments:  { select: { totalAmount: true, status: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: limit * 2, // over-fetch, dedupe below
  });

  // Dedupe by influencer, sum spend
  const map = new Map();
  for (const c of contracts) {
    const id   = c.influencer.id;
    const paid = c.payments
      .filter(p => p.status === 'COMPLETED')
      .reduce((sum, p) => sum + p.totalAmount, 0);

    if (!map.has(id)) {
      map.set(id, {
        influencer:     c.influencer,
        campaignTitle:  c.campaign.title,
        totalSpend:     paid,
        contractStatus: c.status,
        rating:         c.influencer.reviewsReceived[0]?.rating ?? null,
      });
    } else {
      map.get(id).totalSpend += paid;
    }
  }

  return Array.from(map.values())
    .sort((a, b) => b.totalSpend - a.totalSpend)
    .slice(0, limit);
}

// ─────────────────────────────────────────────
// INFLUENCER ANALYTICS
// ─────────────────────────────────────────────

export async function getInfluencerOverview(influencerId) {
  const now = new Date();
  const startOfMonth     = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth   = new Date(now.getFullYear(), now.getMonth(), 0);

  const [
    totalEarnings,
    thisMonthEarnings,
    lastMonthEarnings,
    pendingPayout,
    campaignCounts,
    thisMonthCampaigns,
    ratingStats,
    latestInsight,
  ] = await Promise.all([

    prisma.payment.aggregate({
      where: { influencerId, status: 'COMPLETED' },
      _sum:  { influencerPayout: true },
    }),

    prisma.payment.aggregate({
      where: { influencerId, status: 'COMPLETED', completedAt: { gte: startOfMonth } },
      _sum:  { influencerPayout: true },
    }),

    prisma.payment.aggregate({
      where: {
        influencerId, status: 'COMPLETED',
        completedAt: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
      _sum: { influencerPayout: true },
    }),

    // Pending payouts
    prisma.payment.aggregate({
      where: { influencerId, payoutStatus: { in: ['PENDING', 'PROCESSING'] } },
      _sum:  { influencerPayout: true },
    }),

    // Campaign counts by status
    prisma.contract.groupBy({
      by: ['status'],
      where: { influencerId },
      _count: { status: true },
    }),

    prisma.contract.count({
      where: { influencerId, createdAt: { gte: startOfMonth } },
    }),

    // Reviews received
    prisma.review.aggregate({
      where: { revieweeId: influencerId, isVisible: true },
      _avg:  { rating: true },
      _count: { rating: true },
    }),

    // Latest Instagram insight
    prisma.instagramInsight.findFirst({
      where:   { influencerProfile: { userId: influencerId } },
      orderBy: { fetchedAt: 'desc' },
      select:  { engagementRate: true, followerCount: true, fetchedAt: true },
    }),
  ]);

  const thisMonthAmt  = thisMonthEarnings._sum.influencerPayout ?? 0;
  const lastMonthAmt  = lastMonthEarnings._sum.influencerPayout ?? 1;
  const earningsDelta = lastMonthAmt > 0
    ? Math.round(((thisMonthAmt - lastMonthAmt) / lastMonthAmt) * 100)
    : 0;

  const statusMap = {};
  campaignCounts.forEach(c => { statusMap[c.status] = c._count.status; });

  return {
    totalEarnings:    totalEarnings._sum.influencerPayout ?? 0,
    thisMonthEarnings: thisMonthAmt,
    earningsDeltaPct:  earningsDelta,
    pendingPayout:     pendingPayout._sum.influencerPayout ?? 0,
    campaigns: {
      breakdown:    statusMap,
      newThisMonth: thisMonthCampaigns,
    },
    rating: {
      average:      parseFloat((ratingStats._avg.rating ?? 0).toFixed(1)),
      totalReviews: ratingStats._count.rating,
    },
    instagram: latestInsight ?? null,
  };
}

export async function getInfluencerEarningsTrend(influencerId, months = 6) {
  const results = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end   = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

    const [earned, pending] = await Promise.all([
      prisma.payment.aggregate({
        where: {
          influencerId, status: 'COMPLETED',
          completedAt: { gte: start, lte: end },
        },
        _sum: { influencerPayout: true },
      }),
      prisma.payment.aggregate({
        where: {
          influencerId,
          payoutStatus: { in: ['PENDING', 'PROCESSING'] },
          createdAt: { gte: start, lte: end },
        },
        _sum: { influencerPayout: true },
      }),
    ]);

    results.push({
      month:   start.toLocaleString('default', { month: 'short', year: '2-digit' }),
      earned:  earned._sum.influencerPayout ?? 0,
      pending: pending._sum.influencerPayout ?? 0,
    });
  }

  return results;
}

export async function getInfluencerCampaignHistory(influencerId, filters = {}) {
  const { page = 1, limit = 10, status } = filters;
  const skip = (page - 1) * limit;

  const where = {
    influencerId,
    ...(status && { status }),
  };

  const [contracts, total] = await Promise.all([
    prisma.contract.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        campaign: { select: { id: true, title: true, type: true } },
        brand:    { select: { id: true, name: true } },
        payments: {
          where:  { status: 'COMPLETED' },
          select: { influencerPayout: true },
        },
        milestones: { select: { status: true } },
      },
    }),
    prisma.contract.count({ where }),
  ]);

  const data = await Promise.all(contracts.map(async (c) => {
    const earned = c.payments.reduce((sum, p) => sum + p.influencerPayout, 0);
    const review = await prisma.review.findUnique({
      where: { contractId_reviewerId: { contractId: c.id, reviewerId: c.brandId } },
      select: { rating: true },
    });

    return {
      contractId:     c.id,
      campaign:       c.campaign,
      brand:          c.brand,
      status:         c.status,
      earned,
      rating:         review?.rating ?? null,
      milestonesTotal:    c.milestones.length,
      milestonesCompleted: c.milestones.filter(m => ['APPROVED','PAID'].includes(m.status)).length,
    };
  }));

  return {
    data,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
}