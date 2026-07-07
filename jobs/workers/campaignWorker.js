import { Worker } from 'bullmq';
import { redisConnection } from '../../config/redis.js';
import { JOB_TYPES } from '../queues/campaignQueue.js';
import prisma from '../../config/prisma.js';
import { emitNotification } from '../../notificationCenter/notificationEmitter.js';
import { getIO } from '../../socket/socketHandler.js';

// ─────────────────────────────────────────────
// JOB 1 — Close campaigns past deadline
// ACTIVE → CLOSED jab applicationDeadline pass ho
// ─────────────────────────────────────────────

async function closeDeadlineCampaigns() {
  const campaigns = await prisma.campaign.findMany({
    where: {
      status:              'ACTIVE',
      applicationDeadline: { lt: new Date() },
    },
    select: {
      id: true, title: true, brandId: true,
      _count: { select: { applications: true } },
    },
  });

  if (campaigns.length === 0) {
    console.log('[Job] No campaigns to close');
    return { closed: 0 };
  }

  const ids = campaigns.map(c => c.id);

  await prisma.campaign.updateMany({
    where: { id: { in: ids } },
    data:  { status: 'CLOSED' },
  });

  // Brand ko notify karo — har campaign ke liye
  const io = getIO();
  await Promise.allSettled(
    campaigns.map(c =>
      emitNotification(io, {
        userId: c.brandId,
        type:   'CAMPAIGN',
        title:  `"${c.title}" applications closed`,
        body:   `Application deadline passed. ${c._count.applications} applications received. Review them now.`,
        link:   `/campaigns/${c.id}/applications`,
        meta:   { campaignId: c.id, totalApplications: c._count.applications },
      })
    )
  );

  console.log(`[Job] Closed ${campaigns.length} campaigns`);
  return { closed: campaigns.length };
}

// ─────────────────────────────────────────────
// JOB 2 — Complete campaigns past end date
// CLOSED/ACTIVE → COMPLETED jab campaignEndDate pass ho
// ─────────────────────────────────────────────

async function completeEndedCampaigns() {
  const campaigns = await prisma.campaign.findMany({
    where: {
      status:          { in: ['ACTIVE', 'CLOSED'] },
      campaignEndDate: { lt: new Date() },
    },
    include: {
      applications: {
        where:  { status: 'HIRED' },
        select: { influencerId: true },
      },
      brand: { select: { id: true, name: true } },
    },
  });

  if (campaigns.length === 0) {
    console.log('[Job] No campaigns to complete');
    return { completed: 0 };
  }

  const ids = campaigns.map(c => c.id);

  await prisma.campaign.updateMany({
    where: { id: { in: ids } },
    data:  { status: 'COMPLETED' },
  });

  const io = getIO();

  await Promise.allSettled(
    campaigns.flatMap(c => {
      const notifications = [];

      // Brand ko notify karo
      notifications.push(
        emitNotification(io, {
          userId: c.brand.id,
          type:   'CAMPAIGN',
          title:  `"${c.title}" campaign completed`,
          body:   `Your campaign has ended. Please review and rate your influencers.`,
          link:   `/campaigns/${c.id}`,
          meta:   { campaignId: c.id },
        })
      );

      // Har hired influencer ko notify karo
      c.applications.forEach(app => {
        notifications.push(
          emitNotification(io, {
            userId: app.influencerId,
            type:   'CAMPAIGN',
            title:  `"${c.title}" campaign completed`,
            body:   `The campaign has ended. Please submit your review for ${c.brand.name}.`,
            link:   `/campaigns/${c.id}`,
            meta:   { campaignId: c.id },
          })
        );
      });

      return notifications;
    })
  );

  console.log(`[Job] Completed ${campaigns.length} campaigns`);
  return { completed: campaigns.length };
}

// ─────────────────────────────────────────────
// JOB 3 — Instagram token expiry warning
// Token expire hone se 7 din pehle notify karo
// ─────────────────────────────────────────────

async function notifyTokenExpiry() {
  const warningDate = new Date();
  warningDate.setDate(warningDate.getDate() + 7); // 7 din baad expire hoga

  const profiles = await prisma.influencerProfile.findMany({
    where: {
      igAccessToken: { not: null },
      igTokenExpiry: {
        gte: new Date(),       // abhi valid hai
        lte: warningDate,      // 7 din mein expire hoga
      },
    },
    select: {
      userId:       true,
      igTokenExpiry: true,
      user:          { select: { name: true } },
    },
  });

  if (profiles.length === 0) {
    console.log('[Job] No tokens expiring soon');
    return { notified: 0 };
  }

  const io = getIO();

  await Promise.allSettled(
    profiles.map(p => {
      const daysLeft = Math.ceil(
        (p.igTokenExpiry - new Date()) / (1000 * 60 * 60 * 24)
      );

      return emitNotification(io, {
        userId: p.userId,
        type:   'SYSTEM',
        title:  'Instagram connection expiring soon',
        body:   `Your Instagram access expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}. Reconnect to keep insights syncing.`,
        link:   '/settings/instagram',
        meta:   { daysLeft, expiresAt: p.igTokenExpiry },
      });
    })
  );

  console.log(`[Job] Notified ${profiles.length} influencers about token expiry`);
  return { notified: profiles.length };
}

// ─────────────────────────────────────────────
// JOB 4 — Cancel expired invites
// PENDING invites jo 7 din se zyada purane hain
// ─────────────────────────────────────────────

async function cancelExpiredInvites() {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() - 7); // 7 din purane

  const expiredInvites = await prisma.campaignInvite.findMany({
    where: {
      status:    'PENDING',
      createdAt: { lt: expiryDate },
    },
    include: {
      campaign:   { select: { id: true, title: true } },
      influencer: { select: { id: true, name: true } },
      brand:      { select: { id: true, name: true } },
    },
  });

  if (expiredInvites.length === 0) {
    console.log('[Job] No expired invites to cancel');
    return { cancelled: 0 };
  }

  const ids = expiredInvites.map(i => i.id);

  await prisma.campaignInvite.updateMany({
    where: { id: { in: ids } },
    data:  { status: 'EXPIRED' },
  });

  const io = getIO();

  // Brand ko notify karo — invite expire hua
  await Promise.allSettled(
    expiredInvites.map(invite =>
      emitNotification(io, {
        userId: invite.brand.id,
        type:   'CAMPAIGN',
        title:  `Invite to ${invite.influencer.name} expired`,
        body:   `Your invite for "${invite.campaign.title}" was not responded to and has expired.`,
        link:   `/campaigns/${invite.campaign.id}/invites`,
        meta:   { campaignId: invite.campaign.id, inviteId: invite.id },
      })
    )
  );

  console.log(`[Job] Cancelled ${expiredInvites.length} expired invites`);
  return { cancelled: expiredInvites.length };
}

// ─────────────────────────────────────────────
// WORKER — Job processor
// ─────────────────────────────────────────────

export const campaignWorker = new Worker(
  'campaign-jobs',
  async (job) => {
    console.log(`[Worker] Processing job: ${job.name} (id: ${job.id})`);

    switch (job.name) {
      case JOB_TYPES.CLOSE_DEADLINE_CAMPAIGNS:
        return closeDeadlineCampaigns();

      case JOB_TYPES.COMPLETE_ENDED_CAMPAIGNS:
        return completeEndedCampaigns();

      case JOB_TYPES.NOTIFY_TOKEN_EXPIRY:
        return notifyTokenExpiry();

      case JOB_TYPES.CANCEL_EXPIRED_INVITES:
        return cancelExpiredInvites();

      default:
        throw new Error(`Unknown job type: ${job.name}`);
    }
  },
  {
    connection: redisConnection,
    concurrency: 2, // ek waqt mein 2 jobs process karo
  }
);

// Worker events
campaignWorker.on('completed', (job, result) => {
  console.log(`[Worker] ✅ Job completed: ${job.name}`, result);
});

campaignWorker.on('failed', (job, err) => {
  console.error(`[Worker] ❌ Job failed: ${job?.name}`, err.message);
});

campaignWorker.on('error', (err) => {
  console.error('[Worker] Error:', err.message);
});