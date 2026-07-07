// src/jobs/youtube.sync.job.js
// Syncs all connected YouTube accounts every 6 hours
// Uses node-cron (already in your stack)

import cron from 'node-cron';
import  prisma  from '../config/prisma.js';
import { syncVideos } from '../services/socialMedia/youtubeService.js';

export function startYoutubeSyncJob() {
  // Every 6 hours: '0 */6 * * *'
  cron.schedule('0 */6 * * *', async () => {
    console.log('[YT Sync] Starting scheduled YouTube sync...');

    const accounts = await prisma.youtubeAccount.findMany({
      select: { id: true, channelTitle: true },
    });

    console.log(`[YT Sync] Syncing ${accounts.length} accounts`);

    // Process in batches of 5 to avoid rate limits
    const BATCH = 5;
    for (let i = 0; i < accounts.length; i += BATCH) {
      const batch = accounts.slice(i, i + BATCH);
      await Promise.allSettled(
        batch.map(async (acc) => {
          try {
            await syncVideos(acc.id);
            console.log(`[YT Sync] ✓ ${acc.channelTitle}`);
          } catch (err) {
            console.error(`[YT Sync] ✕ ${acc.channelTitle}:`, err.message);
          }
        })
      );
      // Brief pause between batches
      if (i + BATCH < accounts.length) {
        await new Promise((r) => setTimeout(r, 2000));
      }
    }

    console.log('[YT Sync] Done');
  });

  console.log('[YT Sync] Cron job registered (every 6 hours)');
}

// ── Add to your server startup (src/index.js) ─────────────────────────────────
