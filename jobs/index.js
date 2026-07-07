import { startCampaignScheduler } from './schedulers/campaignScheduler.js';
import { campaignWorker } from './workers/campaignWorker.js';

export function initJobs() {
  console.log('[Jobs] Initializing background jobs...');

  // Worker start karo
  // (worker already initialized on import — just log karo)
  console.log('[Jobs] Campaign worker ready');

  // Scheduler start karo
  startCampaignScheduler();

  console.log('[Jobs] All jobs initialized ✅');
}