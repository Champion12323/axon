import cron from 'node-cron';
import { campaignQueue, JOB_TYPES } from '../queues/campaignQueue.js';

export function startCampaignScheduler() {
  console.log('[Scheduler] Campaign scheduler started');

  // ─── Job 1 — Close deadline campaigns
  // Har ghante chalega
  cron.schedule('0 * * * *', async () => {
    console.log('[Scheduler] Queuing: close deadline campaigns');
    await campaignQueue.add(JOB_TYPES.CLOSE_DEADLINE_CAMPAIGNS, {}, {
      jobId: `close-deadline-${Date.now()}`, // duplicate prevent
    });
  });

  // ─── Job 2 — Complete ended campaigns
  // Har 6 ghante chalega
  cron.schedule('0 */6 * * *', async () => {
    console.log('[Scheduler] Queuing: complete ended campaigns');
    await campaignQueue.add(JOB_TYPES.COMPLETE_ENDED_CAMPAIGNS, {}, {
      jobId: `complete-ended-${Date.now()}`,
    });
  });

  // ─── Job 3 — Token expiry warning
  // Roz subah 9 baje
  cron.schedule('0 9 * * *', async () => {
    console.log('[Scheduler] Queuing: notify token expiry');
    await campaignQueue.add(JOB_TYPES.NOTIFY_TOKEN_EXPIRY, {}, {
      jobId: `token-expiry-${new Date().toDateString()}`, // din mein ek baar
    });
  });

  // ─── Job 4 — Cancel expired invites
  // Roz raat 12 baje (midnight)
  cron.schedule('0 0 * * *', async () => {
    console.log('[Scheduler] Queuing: cancel expired invites');
    await campaignQueue.add(JOB_TYPES.CANCEL_EXPIRED_INVITES, {}, {
      jobId: `cancel-invites-${new Date().toDateString()}`,
    });
  });
}