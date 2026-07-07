// src/modules/admin/admin.service.js
import prisma from '../config/prisma.js';

export const getOverview = async () => {
  const [totalUsers, activeCampaigns, openDisputes, revenue] = await Promise.all([
    prisma.user.count(),
    prisma.campaign.count({ where: { status: 'ACTIVE' } }),
    prisma.contract.count({ where: { status: 'DISPUTED' } }),
    prisma.payment.aggregate({ where: { status: 'COMPLETED' }, _sum: { platformFee: true } }),
  ]);
  return { totalUsers, activeCampaigns, openDisputes, platformRevenue: revenue._sum.platformFee ?? 0 };
};

export const getUsers = async ({ search, role, page = 1, limit = 15 }) => {
  const skip = (page - 1) * limit;
  const where = {
    ...(role   && { role }),
    ...(search && { OR: [
      { name:  { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ]}),
  };
  const [data, total] = await Promise.all([
    prisma.user.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.user.count({ where }),
  ]);
  return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

export const suspendUser    = (userId) => prisma.user.update({ where: { id: userId }, data: { isSuspended: true } });
export const verifyUser     = (userId) => prisma.user.update({ where: { id: userId }, data: { isVerified: true } });

export const getCampaigns = async ({ status, page = 1, limit = 15 }) => {
  const skip = (page - 1) * limit;
  const where = { ...(status && { status }) };
  const [data, total] = await Promise.all([
    prisma.campaign.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' },
      include: { brand: { select: { name: true } }, _count: { select: { applications: true } } } }),
    prisma.campaign.count({ where }),
  ]);
  return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

export const approveCampaign = (id) => prisma.campaign.update({ where: { id }, data: { status: 'ACTIVE' } });
export const rejectCampaign  = (id) => prisma.campaign.update({ where: { id }, data: { status: 'CANCELLED' } });

export const getDisputes = async ({ page = 1, limit = 15 }) => {
  const skip = (page - 1) * limit;
  const where = { status: 'DISPUTED' };
  const [data, total] = await Promise.all([
    prisma.contract.findMany({ where, skip, take: limit, orderBy: { updatedAt: 'desc' },
      include: {
        campaign: { select: { title: true } },
        disputeRaisedByUser: { select: { name: true } },
      },
    }),
    prisma.contract.count({ where }),
  ]);
  return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

export const resolveDispute = (contractId, resolution) =>
  prisma.contract.update({ where: { id: contractId }, data: { status: 'COMPLETED', disputeResolution: resolution } });

export const getRevenueOverview = async () => {
  const agg = await prisma.payment.aggregate({
    where: { status: 'COMPLETED' },
    _sum: { totalAmount: true, platformFee: true },
    _count: { id: true },
  });
  return {
    totalGMV:           agg._sum.totalAmount ?? 0,
    platformRevenue:    agg._sum.platformFee  ?? 0,
    totalTransactions:  agg._count.id,
  };
};

export const getMonthlyRevenue = async (months = 6) => {
  const results = [];
  const now = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end   = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    const agg = await prisma.payment.aggregate({
      where: { status: 'COMPLETED', completedAt: { gte: start, lte: end } },
      _sum: { platformFee: true, totalAmount: true },
    });
    results.push({
      month:   start.toLocaleString('default', { month: 'short', year: '2-digit' }),
      fees:    agg._sum.platformFee  ?? 0,
      revenue: agg._sum.totalAmount  ?? 0,
    });
  }
  return results;
};