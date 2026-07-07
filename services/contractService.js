// src/services/contract.service.js

import prisma from '../config/prisma.js';
import { emitNotification } from '../notificationCenter/notificationEmitter.js';

const PLATFORM_FEES = 10;

function calcPayout(amount) {
  const fees = (amount * PLATFORM_FEES) / 100;
  return {
    platformFees: parseFloat(fees.toFixed(2)),
    influencerPayout: parseFloat((amount - fees).toFixed(2)),
  };
}

function notFoundError(msg)    { return Object.assign(new Error(msg), { statusCode: 404 }); }
function forbiddenError(msg)   { return Object.assign(new Error(msg), { statusCode: 403 }); }
function badRequestError(msg)  { return Object.assign(new Error(msg), { statusCode: 400 }); }

// ─────────────────────────────────────────────
// CREATE CONTRACT
// 🔔 Notifies: influencer — contract received
// ─────────────────────────────────────────────

export async function createContract(io, brandId, data) {
  const { milestones, ...contractData } = data;

  const application = await prisma.application.findUnique({
    where: { id: data.applicationId },
    include: {
      campaign: true,
      influencer: { select: { id: true, name: true } },
    },
  });

  if (!application) throw notFoundError('Application not found');
  if (application.campaign.brandId !== brandId) {
    throw forbiddenError('Application not found or does not belong to this brand');
  }
  if (application.status !== 'HIRED') {
    throw badRequestError('Influencer must be HIRED before creating contract');
  }

  const existing = await prisma.contract.findUnique({
    where: { applicationId: data.applicationId },
  });
  if (existing) throw badRequestError('Contract already exists for this application');

  const { platformFees, influencerPayout } = calcPayout(data.totalAmount);

  const contract = await prisma.contract.create({
    data: {
      ...contractData,
      brandId,
      influencerId: application.influencerId,
      campaignId: application.campaignId,
      status: 'DRAFT',
      platformFees,
      influencerPayout,
      milestones: {
        create: milestones.map((m) => ({
          ...m,
          dueDate: new Date(m.dueDate),
          status: 'PENDING',
        })),
      },
    },
    include: { milestones: { orderBy: { order: 'asc' } } },
  });

  // 🔔 Influencer — contract created (draft, not sent yet — no notification)
  return contract;
}

// ─────────────────────────────────────────────
// SEND CONTRACT
// 🔔 Notifies: influencer — new contract to review
// ─────────────────────────────────────────────

export async function sendContract(io, brandId, contractId) {
  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    include: {
      campaign: { select: { title: true } },
      brand: { select: { name: true } },
      influencer: { select: { id: true, name: true } },
    },
  });

  if (!contract) throw notFoundError('Contract not found');
  if (contract.brandId !== brandId) throw forbiddenError('Contract not found or does not belong to this brand');
  if (contract.status !== 'DRAFT') throw badRequestError('Only DRAFT contracts can be sent');

  const updated = await prisma.contract.update({
    where: { id: contractId },
    data: { status: 'SENT' },
    include: { milestones: { orderBy: { order: 'asc' } } },
  });

  // 🔔 Influencer — contract received
  await emitNotification(io, {
    userId: contract.influencer.id,
    type: 'CONTRACT',
    title: `New contract from ${contract.brand.name}`,
    body: `Review and sign the contract for "${contract.campaign.title}"`,
    link: `/contracts/${contractId}`,
    meta: { contractId, campaignId: contract.campaignId },
  });

  return updated;
}

// ─────────────────────────────────────────────
// ACCEPT CONTRACT
// 🔔 Notifies: brand — contract signed
// ─────────────────────────────────────────────

export async function acceptContract(io, influencerId, contractId) {
  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    include: {
      campaign: { select: { title: true } },
      influencer: { select: { name: true } },
    },
  });

  if (!contract) throw notFoundError('Contract not found');
  if (contract.influencerId !== influencerId) throw forbiddenError('Contract not found or does not belong to this influencer');
  if (contract.status !== 'SENT') throw badRequestError('Only SENT contracts can be accepted');

  const updated = await prisma.contract.update({
    where: { id: contractId },
    data: {
      status: 'ACTIVE',
      influencerSignedAt: new Date(),
      brandSignedAt: new Date(),
    },
    include: { milestones: { orderBy: { order: 'asc' } } },
  });

  // 🔔 Brand — contract signed
  await emitNotification(io, {
    userId: contract.brandId,
    type: 'CONTRACT',
    title: `Contract signed by ${contract.influencer.name}`,
    body: `"${contract.campaign.title}" contract is now active`,
    link: `/contracts/${contractId}`,
    meta: { contractId, campaignId: contract.campaignId },
  });

  return updated;
}

// ─────────────────────────────────────────────
// NEGOTIATE CONTRACT
// 🔔 Notifies: brand — influencer requested changes
// ─────────────────────────────────────────────

// ✅ BUG FIX: `data` parameter add kiya
export async function negotiateContract(io, influencerId, contractId, data) {
  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    include: {
      campaign: { select: { title: true } },
      influencer: { select: { name: true } },
    },
  });

  if (!contract) throw notFoundError('Contract not found');
  if (contract.influencerId !== influencerId) throw forbiddenError('Contract not found or does not belong to this influencer');
  if (contract.status !== 'SENT') throw badRequestError('Only SENT contracts can be negotiated');

  const updated = await prisma.contract.update({
    where: { id: contractId },
    data: {
      status: 'NEGOTIATING',
      negotiationNotes: data.negotiationNotes,
    },
  });

  // 🔔 Brand — negotiation requested
  await emitNotification(io, {
    userId: contract.brandId,
    type: 'CONTRACT',
    title: `${contract.influencer.name} requested contract changes`,
    body: `"${contract.campaign.title}" — review their negotiation notes`,
    link: `/contracts/${contractId}`,
    meta: { contractId, campaignId: contract.campaignId },
  });

  return updated;
}

// ─────────────────────────────────────────────
// RESPOND TO NEGOTIATION
// 🔔 Notifies: influencer — brand responded
// ─────────────────────────────────────────────

// ✅ BUG FIX: UPDATE_AND_RESEND block dead code se bahar nikala
export async function respondToNegotiation(io, brandId, contractId, data) {
  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    include: {
      campaign: { select: { title: true } },
      influencer: { select: { id: true, name: true } },
    },
  });

  if (!contract) throw notFoundError('Contract not found');
  if (contract.brandId !== brandId) throw forbiddenError('Contract not found or does not belong to this brand');
  if (contract.status !== 'NEGOTIATING') throw badRequestError('Only NEGOTIATING contracts can be responded to');

  let updated;
  let notifTitle, notifBody;

  if (data.action === 'ACCEPT_NEGOTIATION') {
    updated = await prisma.contract.update({
      where: { id: contractId },
      data: {
        status: 'ACTIVE',
        brandResponse: data.brandResponse,
        brandSignedAt: new Date(),
        influencerSignedAt: new Date(),
      },
      include: { milestones: { orderBy: { order: 'asc' } } },
    });
    notifTitle = 'Brand accepted your negotiation';
    notifBody  = `"${contract.campaign.title}" contract is now active`;

  } else if (data.action === 'REJECT_NEGOTIATION') {
    updated = await prisma.contract.update({
      where: { id: contractId },
      data: { status: 'SENT', brandResponse: data.brandResponse },
    });
    notifTitle = 'Brand rejected your negotiation';
    notifBody  = `"${contract.campaign.title}" — review the original terms`;

  } else if (data.action === 'UPDATE_AND_RESEND') {
    // ✅ BUG FIX: platformFees (was platformFee — wrong variable name)
    const { platformFees, influencerPayout } = calcPayout(
      data.totalAmount ?? contract.totalAmount
    );

    if (data.milestones) {
      await prisma.milestone.deleteMany({ where: { contractId } });
    }

    updated = await prisma.contract.update({
      where: { id: contractId },
      data: {
        status: 'SENT',
        brandResponse: data.brandResponse,
        totalAmount: data.totalAmount ?? contract.totalAmount,
        platformFees,
        influencerPayout,
        negotiationNotes: null,
        ...(data.milestones && {
          milestones: {
            create: data.milestones.map((m) => ({
              ...m,
              dueDate: new Date(m.dueDate),
              status: 'PENDING',
            })),
          },
        }),
      },
      include: { milestones: { orderBy: { order: 'asc' } } },
    });
    notifTitle = 'Brand sent a revised contract';
    notifBody  = `"${contract.campaign.title}" — review the updated terms`;

  } else {
    throw badRequestError('Invalid action');
  }

  // 🔔 Influencer — brand responded
  await emitNotification(io, {
    userId: contract.influencer.id,
    type: 'CONTRACT',
    title: notifTitle,
    body: notifBody,
    link: `/contracts/${contractId}`,
    meta: { contractId, campaignId: contract.campaignId, action: data.action },
  });

  return updated;
}

// ─────────────────────────────────────────────
// SUBMIT MILESTONE
// 🔔 Notifies: brand — milestone submitted for review
// ─────────────────────────────────────────────

export async function submitMilestone(io, influencerId, milestoneId, data) {
  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: {
      contract: {
        include: { campaign: { select: { title: true } } },
      },
    },
  });

  if (!milestone) throw notFoundError('Milestone not found');
  if (milestone.contract.influencerId !== influencerId) {
    throw forbiddenError('Milestone not found or does not belong to this influencer');
  }

  // ✅ BUG FIX: single status check — removed duplicate conflicting check
  if (!['PENDING', 'IN_PROGRESS', 'REVISION_NEEDED'].includes(milestone.status)) {
    throw badRequestError('Only PENDING, IN_PROGRESS or REVISION_NEEDED milestones can be submitted');
  }

  if (milestone.revisionCount >= milestone.contract.revisionLimit) {
    throw badRequestError(
      `Revision limit of ${milestone.contract.revisionLimit} reached. Cannot submit again.`
    );
  }

  const updated = await prisma.milestone.update({
    where: { id: milestoneId },
    data: {
      status: 'SUBMITTED',
      submittedAt: new Date(),
      submissionUrls: data.submissionUrls,
      submissionNote: data.submissionNote,
    },
  });

  // 🔔 Brand — milestone submitted
  await emitNotification(io, {
    userId: milestone.contract.brandId,
    type: 'CONTRACT',
    title: `Milestone submitted for review`,
    body: `"${milestone.title}" — ${milestone.contract.campaign.title}`,
    link: `/contracts/${milestone.contractId}`,
    meta: { contractId: milestone.contractId, milestoneId },
  });

  return updated;
}

// ─────────────────────────────────────────────
// REVIEW MILESTONE
// 🔔 Notifies: influencer — approved or revision needed
// ─────────────────────────────────────────────

// ✅ BUG FIX: APPROVE + REQUEST_REVISION both reachable, updatedMilestone scoped correctly
export async function reviewMilestone(io, milestoneId, brandId, data) {
  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: {
      contract: {
        include: { campaign: { select: { title: true } } },
      },
    },
  });

  if (!milestone) throw notFoundError('Milestone not found');
  if (milestone.contract.brandId !== brandId) {
    throw forbiddenError('Milestone not found or does not belong to this brand');
  }
  if (milestone.status !== 'SUBMITTED') throw badRequestError('Only SUBMITTED milestones can be reviewed');

  let updatedMilestone;
  let notifTitle, notifBody;

  if (data.action === 'APPROVE') {
    updatedMilestone = await prisma.milestone.update({
      where: { id: milestoneId },
      data: { status: 'APPROVED', approvedAt: new Date(), reviewedAt: new Date() },
    });

    // Check if all milestones approved → complete contract
    const allMilestones = await prisma.milestone.findMany({
      where: { contractId: milestone.contractId },
    });
    const allDone = allMilestones.every((m) =>
      ['APPROVED', 'PAID'].includes(m.status)
    );
    if (allDone) {
      await prisma.contract.update({
        where: { id: milestone.contractId },
        data: { status: 'COMPLETED', completedAt: new Date() },
      });

      // 🔔 Influencer — contract completed
      await emitNotification(io, {
        userId: milestone.contract.influencerId,
        type: 'CONTRACT',
        title: 'All milestones approved — contract completed!',
        body: `"${milestone.contract.campaign.title}" is now complete. Payment will be released shortly.`,
        link: `/contracts/${milestone.contractId}`,
        meta: { contractId: milestone.contractId },
      });
      return updatedMilestone;
    }

    notifTitle = `Milestone approved`;
    notifBody  = `"${milestone.title}" has been approved — ${milestone.contract.campaign.title}`;

  } else if (data.action === 'REQUEST_REVISION') {
    updatedMilestone = await prisma.milestone.update({
      where: { id: milestoneId },
      data: {
        status: 'REVISION_NEEDED',
        revisionNote: data.revisionNote,
        revisionCount: { increment: 1 },
        reviewedAt: new Date(),
      },
    });
    notifTitle = `Revision requested for milestone`;
    notifBody  = `"${milestone.title}" needs changes — ${milestone.contract.campaign.title}`;

  } else {
    throw badRequestError('Invalid action');
  }

  // 🔔 Influencer — milestone review result
  await emitNotification(io, {
    userId: milestone.contract.influencerId,
    type: 'CONTRACT',
    title: notifTitle,
    body: notifBody,
    link: `/contracts/${milestone.contractId}`,
    meta: { contractId: milestone.contractId, milestoneId, action: data.action },
  });

  return updatedMilestone;
}

// ─────────────────────────────────────────────
// CANCEL CONTRACT
// 🔔 Notifies: other party — contract cancelled
// ─────────────────────────────────────────────

// ✅ BUG FIX: badRequestedError typo fixed, COMLEDTED typo fixed
export async function cancelContract(io, userId, contractId, data) {
  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    include: {
      campaign: { select: { title: true } },
      brand: { select: { id: true, name: true } },
      influencer: { select: { id: true, name: true } },
    },
  });

  if (!contract) throw notFoundError('Contract not found');
  if (contract.brandId !== userId && contract.influencerId !== userId) {
    throw forbiddenError('Contract not found or does not belong to this user');
  }
  if (['COMPLETED', 'CANCELLED'].includes(contract.status)) {
    throw badRequestError('Cannot cancel a completed or already cancelled contract');
  }

  const updated = await prisma.contract.update({
    where: { id: contractId },
    data: {
      status: 'CANCELLED',
      cancelledBy: userId,
      cancelReason: data.cancelReason,
    },
  });

  // 🔔 Dusre party ko notify karo
  const cancelledByBrand = userId === contract.brand.id;
  const notifyUserId = cancelledByBrand ? contract.influencer.id : contract.brand.id;
  const cancellerName = cancelledByBrand ? contract.brand.name : contract.influencer.name;

  await emitNotification(io, {
    userId: notifyUserId,
    type: 'CONTRACT',
    title: `Contract cancelled by ${cancellerName}`,
    body: `"${contract.campaign.title}" contract has been cancelled`,
    link: `/contracts/${contractId}`,
    meta: { contractId, campaignId: contract.campaignId, cancelReason: data.cancelReason },
  });

  return updated;
}

// ─────────────────────────────────────────────
// RAISE DISPUTE
// 🔔 Notifies: other party — dispute raised
// ─────────────────────────────────────────────

// ✅ BUG FIX: logic fix — ACTIVE contracts dispute ho sakte hain (NOT block hata)
export async function raiseDispute(io, userId, contractId, data) {
  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    include: {
      campaign: { select: { title: true } },
      brand: { select: { id: true, name: true } },
      influencer: { select: { id: true, name: true } },
    },
  });

  if (!contract) throw notFoundError('Contract not found');
  if (contract.brandId !== userId && contract.influencerId !== userId) {
    throw forbiddenError('Contract not found or does not belong to this user');
  }
  // ✅ FIX: ACTIVE hona chahiye dispute ke liye (was blocking ACTIVE)
  if (contract.status !== 'ACTIVE') {
    throw badRequestError('Only ACTIVE contracts can be disputed');
  }

  const updated = await prisma.contract.update({
    where: { id: contractId },
    data: {
      status: 'DISPUTED',
      disputeRaisedBy: userId,
      disputeReason: data.disputeReason,
    },
  });

  // 🔔 Dusre party ko notify karo
  const raisedByBrand = userId === contract.brand.id;
  const notifyUserId = raisedByBrand ? contract.influencer.id : contract.brand.id;
  const raisedByName = raisedByBrand ? contract.brand.name : contract.influencer.name;

  await emitNotification(io, {
    userId: notifyUserId,
    type: 'CONTRACT',
    title: `Dispute raised by ${raisedByName}`,
    body: `"${contract.campaign.title}" contract is now under dispute`,
    link: `/contracts/${contractId}`,
    meta: { contractId, campaignId: contract.campaignId },
  });

  return updated;
}

// ─────────────────────────────────────────────
// GET — Fetch Contracts
// ─────────────────────────────────────────────

// ✅ BUG FIX: compaign → campaign typo fixed in both functions
export async function getContractById(userId, contractId) {
  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    include: {
      milestones: { orderBy: { order: 'asc' } },
      campaign: { select: { id: true, title: true, type: true } },
      brand: { select: { id: true, name: true, email: true } },
      influencer: { select: { id: true, name: true, email: true } },
    },
  });

  if (!contract) throw notFoundError('Contract not found');
  if (contract.brandId !== userId && contract.influencerId !== userId) {
    throw forbiddenError('Contract not found or does not belong to this user');
  }

  return contract;
}

export async function getMyContracts(userId, role, filters = {}) {
  const { page = 1, limit = 10, status } = filters;
  const skip = (page - 1) * limit;

  const where = {
    ...(role === 'BRAND' ? { brandId: userId } : { influencerId: userId }),
    ...(status && { status }),
  };

  const [contracts, total] = await prisma.$transaction([
    prisma.contract.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        milestones: { orderBy: { order: 'asc' } },
        campaign: { select: { id: true, title: true, type: true } },
        brand: { select: { id: true, name: true, email: true } },
        influencer: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.contract.count({ where }),
  ]);

  return {
    data: contracts,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}