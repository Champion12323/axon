// src/services/campaign.service.js

import prisma from '../config/prisma.js';
import { emitNotification } from '../notificationCenter/notificationEmitter.js';

// ─────────────────────────────────────────────
// BRAND — Campaign CRUD
// ─────────────────────────────────────────────

export async function createCampaign(brandId, data) {
  return prisma.campaign.create({
    data: {
      ...data,
      brandId,
      status: 'DRAFT',
      applicationDeadline: new Date(data.applicationDeadline),
      campaignStartDate:   new Date(data.campaignStartDate),
      campaignEndDate:     new Date(data.campaignEndDate),
    },
  });
}

export async function updateCampaign(campaignId, brandId, data) {
  const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });

  if (!campaign) throw Object.assign(new Error('Campaign not found'), { statusCode: 404 });
  if (campaign.brandId !== brandId) throw Object.assign(new Error('Unauthorized'), { statusCode: 403 });
  if (campaign.status === 'COMPLETED' || campaign.status === 'CANCELLED') {
    throw Object.assign(new Error('Cannot edit a completed or cancelled campaign'), { statusCode: 400 });
  }

  return prisma.campaign.update({
    where: { id: campaignId },
    data: {
      ...data,
      ...(data.applicationDeadline && { applicationDeadline: new Date(data.applicationDeadline) }),
      ...(data.campaignStartDate   && { campaignStartDate:   new Date(data.campaignStartDate) }),
      ...(data.campaignEndDate     && { campaignEndDate:     new Date(data.campaignEndDate) }),
    },
  });
}

export async function deleteCampaign(campaignId, brandId) {
  const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });

  if (!campaign) throw Object.assign(new Error('Campaign not found'), { statusCode: 404 });
  if (campaign.brandId !== brandId) throw Object.assign(new Error('Unauthorized'), { statusCode: 403 });
  if (campaign.status !== 'DRAFT') {
    throw Object.assign(new Error('Only DRAFT campaigns can be deleted'), { statusCode: 400 });
  }

  return prisma.campaign.delete({ where: { id: campaignId } });
}

export async function getBrandCampaigns(brandId, filters) {
  const { page, limit, status, type, sortBy, sortOrder } = filters;
  const skip = (page - 1) * limit;

  const where = {
    brandId,
    ...(status && { status }),
    ...(type   && { type }),
  };

  const [campaigns, total] = await Promise.all([
    prisma.campaign.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: { _count: { select: { applications: true } } },
    }),
    prisma.campaign.count({ where }),
  ]);

  return {
    data: campaigns,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
}

// ─────────────────────────────────────────────
// INFLUENCER — Browse Campaigns
// ─────────────────────────────────────────────

export async function listActiveCampaigns(filters) {
  const {
    page, limit, type, platform, minBudget,
    maxBudget, niche, search, sortBy, sortOrder,
  } = filters;

  const skip = (page - 1) * limit;

  const where = {
    status: 'ACTIVE',
    applicationDeadline: { gt: new Date() },
    ...(type     && { type }),
    ...(platform && { platforms: { has: platform } }),
    ...(niche    && { niche:     { has: niche } }),
    ...((minBudget !== undefined || maxBudget !== undefined) && {
      budgetMax: {
        ...(minBudget !== undefined && { gte: minBudget }),
        ...(maxBudget !== undefined && { lte: maxBudget }),
      },
    }),
    ...(search && {
      OR: [
        { title:       { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const [campaigns, total] = await Promise.all([
    prisma.campaign.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      select: {
        id: true, title: true, description: true,
        type: true, status: true,
        budgetMin: true, budgetMax: true, currency: true,
        platforms: true, niche: true,
        minFollowers: true, maxFollowers: true,
        applicationDeadline: true,
        campaignStartDate: true, campaignEndDate: true,
        deliverables: true, hashtags: true,
        maxInfluencers: true, totalHired: true,
        brand: { select: { id: true, name: true } },
        _count: { select: { applications: true } },
      },
    }),
    prisma.campaign.count({ where }),
  ]);

  return {
    data: campaigns,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
}

export async function getCampaignById(campaignId, requestingUserId, role) {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: {
      brand: { select: { id: true, name: true, email: true } },
      _count: { select: { applications: true } },
    },
  });

  if (!campaign) throw Object.assign(new Error('Campaign not found'), { statusCode: 404 });

  if (role === 'INFLUENCER' && campaign.status !== 'ACTIVE') {
    throw Object.assign(new Error('Campaign not found'), { statusCode: 404 });
  }
  if (role === 'BRAND' && campaign.brandId !== requestingUserId) {
    throw Object.assign(new Error('Unauthorized'), { statusCode: 403 });
  }

  return campaign;
}

// ─────────────────────────────────────────────
// APPLICATIONS
// ─────────────────────────────────────────────

export async function applyToCampaign(io, campaignId, influencerId, data) {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: { brand: { select: { id: true, name: true } } },
  });

  if (!campaign) throw Object.assign(new Error('Campaign not found'), { statusCode: 404 });
  if (campaign.status !== 'ACTIVE') throw Object.assign(new Error('Campaign is not active'), { statusCode: 400 });
  if (new Date() > campaign.applicationDeadline) {
    throw Object.assign(new Error('Application deadline has passed'), { statusCode: 400 });
  }
  if (campaign.totalHired >= campaign.maxInfluencers) {
    throw Object.assign(new Error('Campaign is fully booked'), { statusCode: 400 });
  }

  const existing = await prisma.application.findUnique({
    where: { campaignId_influencerId: { campaignId, influencerId } },
  });
  if (existing) throw Object.assign(new Error('Already applied to this campaign'), { statusCode: 409 });

  const influencer = await prisma.user.findUnique({
    where:  { id: influencerId },
    select: { name: true },
  });

  const [application] = await prisma.$transaction([
    prisma.application.create({ data: { campaignId, influencerId, ...data } }),
    prisma.campaign.update({
      where: { id: campaignId },
      data:  { totalApplications: { increment: 1 } },
    }),
  ]);

  await emitNotification(io, {
    userId: campaign.brand.id,
    type:   'CAMPAIGN',
    title:  `New application for "${campaign.title}"`,
    body:   `${influencer.name} has applied to your campaign`,
    link:   `/campaigns/${campaignId}/applications`,
    meta:   { campaignId, applicationId: application.id, influencerId },
  });

  return application;
}

export async function reviewApplication(io, applicationId, brandId, data) {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      campaign:   { select: { id: true, title: true, brandId: true, totalHired: true, maxInfluencers: true } },
      influencer: { select: { id: true, name: true } },
    },
  });

  if (!application) throw Object.assign(new Error('Application not found'), { statusCode: 404 });
  if (application.campaign.brandId !== brandId) {
    throw Object.assign(new Error('Unauthorized'), { statusCode: 403 });
  }

  if (data.status === 'HIRED') {
    if (application.campaign.totalHired >= application.campaign.maxInfluencers) {
      throw Object.assign(new Error('No slots available'), { statusCode: 400 });
    }
  }

  const updates = [
    prisma.application.update({
      where: { id: applicationId },
      data:  { ...data, reviewedAt: new Date() },
    }),
  ];

  if (data.status === 'HIRED') {
    updates.push(
      prisma.campaign.update({
        where: { id: application.campaignId },
        data:  { totalHired: { increment: 1 } },
      })
    );
  }

  const [updated] = await prisma.$transaction(updates);

  const statusMessages = {
    SHORTLISTED: {
      title: `You've been shortlisted for "${application.campaign.title}"`,
      body:  'The brand has shortlisted your application. Stay tuned!',
    },
    HIRED: {
      title: `Congratulations! You've been hired for "${application.campaign.title}"`,
      body:  'The brand has selected you. Check your contract shortly.',
    },
    REJECTED: {
      title: `Application update for "${application.campaign.title}"`,
      body:  'The brand has reviewed your application. Keep applying to other campaigns!',
    },
  };

  const msg = statusMessages[data.status];
  if (msg) {
    await emitNotification(io, {
      userId: application.influencer.id,
      type:   'CAMPAIGN',
      title:  msg.title,
      body:   msg.body,
      link:   `/applications/${applicationId}`,
      meta:   { campaignId: application.campaign.id, applicationId, status: data.status },
    });
  }

  return updated;
}

export async function getCampaignApplications(campaignId, brandId, filters) {
  const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
  if (!campaign) throw Object.assign(new Error('Campaign not found'), { statusCode: 404 });
  if (campaign.brandId !== brandId) throw Object.assign(new Error('Unauthorized'), { statusCode: 403 });

  const { page = 1, limit = 10, status } = filters;
  const skip = (page - 1) * limit;

  const where = { campaignId, ...(status && { status }) };

  const [applications, total] = await Promise.all([
    prisma.application.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        influencer: {
          select: {
            id: true, name: true, email: true,
            influencerProfile: { select: { igUserId: true, niche: true } },
          },
        },
      },
    }),
    prisma.application.count({ where }),
  ]);

  return {
    data: applications,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
}

export async function getInfluencerApplications(influencerId, filters) {
  const { page = 1, limit = 10, status } = filters;
  const skip = (page - 1) * limit;

  const where = { influencerId, ...(status && { status }) };

  const [applications, total] = await Promise.all([
    prisma.application.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        campaign: {
          select: {
            id: true, title: true, type: true,
            status: true, budgetMin: true, budgetMax: true,
            currency: true, campaignStartDate: true, campaignEndDate: true,
            brand: { select: { id: true, name: true } },
          },
        },
      },
    }),
    prisma.application.count({ where }),
  ]);

  return {
    data: applications,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
}

// ─────────────────────────────────────────────
// ✅ DIRECT INVITE SYSTEM
// ─────────────────────────────────────────────

/**
 * Brand directly influencer ko invite kare
 * 🔔 Notifies: influencer — campaign invite
 */
export async function inviteInfluencer(io, campaignId, brandId, influencerId) {
  const [campaign, influencer] = await Promise.all([
    prisma.campaign.findUnique({
      where:   { id: campaignId },
      include: { brand: { select: { id: true, name: true } } },
    }),
    prisma.user.findUnique({
      where:  { id: influencerId },
      select: { id: true, name: true, role: true },
    }),
  ]);

  if (!campaign)  throw Object.assign(new Error('Campaign not found'), { statusCode: 404 });
  if (campaign.brandId !== brandId) throw Object.assign(new Error('Unauthorized'), { statusCode: 403 });
  if (campaign.status !== 'ACTIVE') throw Object.assign(new Error('Can only invite to ACTIVE campaigns'), { statusCode: 400 });
  if (!influencer) throw Object.assign(new Error('Influencer not found'), { statusCode: 404 });
  if (influencer.role !== 'INFLUENCER') throw Object.assign(new Error('User is not an influencer'), { statusCode: 400 });

  // Already applied check
  const alreadyApplied = await prisma.application.findUnique({
    where: { campaignId_influencerId: { campaignId, influencerId } },
  });
  if (alreadyApplied) throw Object.assign(new Error('Influencer already applied to this campaign'), { statusCode: 409 });

  // Already invited check
  const alreadyInvited = await prisma.campaignInvite.findUnique({
    where: { campaignId_influencerId: { campaignId, influencerId } },
  });
  if (alreadyInvited) throw Object.assign(new Error('Influencer already invited'), { statusCode: 409 });

  const invite = await prisma.campaignInvite.create({
    data: {
      campaignId,
      influencerId,
      brandId,
      status: 'PENDING',
    },
    include: {
      campaign:   { select: { id: true, title: true } },
      influencer: { select: { id: true, name: true } },
    },
  });

  // 🔔 Influencer ko notify karo
  await emitNotification(io, {
    userId: influencerId,
    type:   'CAMPAIGN',
    title:  `${campaign.brand.name} invited you to "${campaign.title}"`,
    body:   'You have been directly invited to collaborate. Check campaign details.',
    link:   `/campaigns/${campaignId}`,
    meta:   { campaignId, inviteId: invite.id },
  });

  return invite;
}

/**
 * Get all invites for a campaign (brand view)
 */
export async function getCampaignInvites(campaignId, brandId) {
  const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
  if (!campaign)  throw Object.assign(new Error('Campaign not found'), { statusCode: 404 });
  if (campaign.brandId !== brandId) throw Object.assign(new Error('Unauthorized'), { statusCode: 403 });

  return prisma.campaignInvite.findMany({
    where:   { campaignId },
    include: {
      influencer: {
        select: {
          id: true, name: true, avatar: true,
          influencerProfile: {
            select: { followerCount: true, engagementRate: true, niche: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get my invites (influencer view)
 */
export async function getMyInvites(influencerId, filters = {}) {
  const { page = 1, limit = 10, status } = filters;
  const skip = (page - 1) * limit;

  const where = {
    influencerId,
    ...(status && { status }),
  };

  const [invites, total] = await Promise.all([
    prisma.campaignInvite.findMany({
      where,
      skip,
      take:    limit,
      orderBy: { createdAt: 'desc' },
      include: {
        campaign: {
          select: {
            id: true, title: true, type: true, status: true,
            budgetMin: true, budgetMax: true, currency: true,
            applicationDeadline: true,
            brand: { select: { id: true, name: true, avatar: true } },
          },
        },
      },
    }),
    prisma.campaignInvite.count({ where }),
  ]);

  return {
    data: invites,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
}

/**
 * Influencer invite accept kare — auto-application create hogi
 * 🔔 Notifies: brand — invite accepted
 */
export async function acceptInvite(io, inviteId, influencerId) {
  const invite = await prisma.campaignInvite.findUnique({
    where:   { id: inviteId },
    include: {
      campaign:   { include: { brand: { select: { id: true, name: true } } } },
      influencer: { select: { id: true, name: true } },
    },
  });

  if (!invite) throw Object.assign(new Error('Invite not found'), { statusCode: 404 });
  if (invite.influencerId !== influencerId) throw Object.assign(new Error('Unauthorized'), { statusCode: 403 });
  if (invite.status !== 'PENDING') throw Object.assign(new Error('Invite already responded to'), { statusCode: 400 });
  if (invite.campaign.status !== 'ACTIVE') throw Object.assign(new Error('Campaign is no longer active'), { statusCode: 400 });

  // Transaction — invite accept + auto application create
  const [updatedInvite, application] = await prisma.$transaction([
    prisma.campaignInvite.update({
      where: { id: inviteId },
      data:  { status: 'ACCEPTED', respondedAt: new Date() },
    }),
    prisma.application.create({
      data: {
        campaignId:   invite.campaignId,
        influencerId,
        coverLetter:  'Accepted via direct invite',
        status:       'PENDING',
        isFromInvite: true,
      },
    }),
    prisma.campaign.update({
      where: { id: invite.campaignId },
      data:  { totalApplications: { increment: 1 } },
    }),
  ]);

  // 🔔 Brand ko notify karo
  await emitNotification(io, {
    userId: invite.campaign.brand.id,
    type:   'CAMPAIGN',
    title:  `${invite.influencer.name} accepted your invite`,
    body:   `They have applied to "${invite.campaign.title}"`,
    link:   `/campaigns/${invite.campaignId}/applications`,
    meta:   { campaignId: invite.campaignId, inviteId, applicationId: application.id },
  });

  return { invite: updatedInvite, application };
}

/**
 * Influencer invite decline kare
 * 🔔 Notifies: brand — invite declined
 */
export async function declineInvite(io, inviteId, influencerId) {
  const invite = await prisma.campaignInvite.findUnique({
    where:   { id: inviteId },
    include: {
      campaign:   { include: { brand: { select: { id: true, name: true } } } },
      influencer: { select: { id: true, name: true } },
    },
  });

  if (!invite) throw Object.assign(new Error('Invite not found'), { statusCode: 404 });
  if (invite.influencerId !== influencerId) throw Object.assign(new Error('Unauthorized'), { statusCode: 403 });
  if (invite.status !== 'PENDING') throw Object.assign(new Error('Invite already responded to'), { statusCode: 400 });

  const updated = await prisma.campaignInvite.update({
    where: { id: inviteId },
    data:  { status: 'DECLINED', respondedAt: new Date() },
  });

  // 🔔 Brand ko notify karo
  await emitNotification(io, {
    userId: invite.campaign.brand.id,
    type:   'CAMPAIGN',
    title:  `${invite.influencer.name} declined your invite`,
    body:   `Your invite for "${invite.campaign.title}" was declined`,
    link:   `/campaigns/${invite.campaignId}`,
    meta:   { campaignId: invite.campaignId, inviteId },
  });

  return updated;
}