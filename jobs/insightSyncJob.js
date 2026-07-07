// src/jobs/insightSyncJob.js
// Daily cron — fetches FB + IG insights for all connected influencers

import cron from 'node-cron';
import { syncAllInfluencers } from '../services/socialMedia/insightService.js';
import { refreshLongLivedToken } from '../services/socialMedia/instagramOAuthService.js';
import prisma from '../config/prisma.js';

/**
 * Refresh tokens that expire within 7 days
 */
async function refreshExpiringTokens() {
  const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const expiringProfiles = await prisma.influencerProfile.findMany({
    where: {
      igAccessToken: { not: null },
      igTokenExpiry: { lt: sevenDaysFromNow, gt: new Date() },
    },
    select: { userId: true, igAccessToken: true },
  });

  console.log(`[TokenRefresh] Found ${expiringProfiles.length} expiring tokens`);

  for (const profile of expiringProfiles) {
    try {
      const { encryptedToken, expiresIn } = await refreshLongLivedToken(profile.igAccessToken);

      await prisma.influencerProfile.update({
        where: { userId: profile.userId },
        data: {
          igAccessToken: encryptedToken,
          igTokenExpiry: new Date(Date.now() + expiresIn * 1000),
        },
      });

      console.log(`[TokenRefresh] Refreshed token for influencer: ${profile.userId}`);
    } catch (err) {
      // Token can't be refreshed — null it out, notify influencer to reconnect
      await prisma.influencerProfile.update({
        where: { userId: profile.userId },
        data: { igAccessToken: null, igTokenExpiry: null },
      });
      console.error(`[TokenRefresh] Failed for ${profile.userId}: ${err.message}`);
    }
  }
}

/**
 * Register all cron jobs — call this once in app.js
 */
export function registerInsightJobs() {

  // 1. Daily insight sync — runs at 2:00 AM every day
  cron.schedule('0 2 * * *', async () => {
    console.log('[Cron] Starting daily insight sync...');
    try {
      await syncAllInfluencers();
    } catch (err) {
      console.error('[Cron] Insight sync failed:', err.message);
    }
  });

  // 2. Token refresh check — runs every day at 1:00 AM
  cron.schedule('0 1 * * *', async () => {
    console.log('[Cron] Checking expiring tokens...');
    try {
      await refreshExpiringTokens();
    } catch (err) {
      console.error('[Cron] Token refresh failed:', err.message);
    }
  });

  console.log('[Jobs] Insight sync jobs registered.');
}