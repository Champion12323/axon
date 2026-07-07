// src/services/insightService.js
// Handles Facebook Page insights + Instagram insights fetch, normalize, and DB upsert

import axios from 'axios';
import prisma from '../../config/prisma.js';
import { decrypt } from './instagramOAuthService.js';

const FB_BASE = 'https://graph.facebook.com/v19.0';

// ─────────────────────────────────────────────────────────────
// SECTION 1 — FACEBOOK PAGE INSIGHTS
// ─────────────────────────────────────────────────────────────

/**
 * Fetch Facebook Page metrics for the last N days
 */
async function fetchFBPageInsights(fbPageId, accessToken, days = 30) {
  const since = Math.floor((Date.now() - days * 86400 * 1000) / 1000);
  const until = Math.floor(Date.now() / 1000);

  const { data } = await axios.get(`${FB_BASE}/${fbPageId}/insights`, {
    params: {
      metric: [
        'page_impressions',          // Total impressions on page posts
        'page_impressions_unique',   // Unique reach
        'page_engaged_users',        // People who engaged
        'page_fans',                 // Total page followers/likes
        'page_fan_adds',             // New followers this period
        'page_views_total',          // Profile views
        'page_post_engagements',     // Likes + comments + shares on posts
      ].join(','),
      period: 'day',
      since,
      until,
      access_token: accessToken,
    },
  });

  return data.data; // array of metric objects
}

/**
 * Fetch Facebook Page basic profile info
 */
async function fetchFBPageProfile(fbPageId, accessToken) {
  const { data } = await axios.get(`${FB_BASE}/${fbPageId}`, {
    params: {
      fields: 'name,fan_count,followers_count,category,website',
      access_token: accessToken,
    },
  });
  return data;
}

/**
 * Fetch recent Facebook Page posts with engagement stats
 */
async function fetchFBPagePosts(fbPageId, accessToken, limit = 10) {
  const { data } = await axios.get(`${FB_BASE}/${fbPageId}/posts`, {
    params: {
      fields: 'id,message,created_time,likes.summary(true),comments.summary(true),shares',
      limit,
      access_token: accessToken,
    },
  });
  return data.data ?? [];
}

/**
 * Normalize FB metrics array → flat object
 */
function normalizeFBMetrics(metricsArray) {
  const result = {};
  for (const metric of metricsArray) {
    // Sum up all daily values for the period
    const total = metric.values?.reduce((sum, v) => sum + (v.value || 0), 0) ?? 0;
    result[metric.name] = total;
  }
  return result;
}

// ─────────────────────────────────────────────────────────────
// SECTION 2 — INSTAGRAM INSIGHTS
// ─────────────────────────────────────────────────────────────

/**
 * Fetch Instagram account-level insights
 */
async function fetchIGAccountInsights(igUserId, accessToken, days = 30) {
  const since = Math.floor((Date.now() - days * 86400 * 1000) / 1000);
  const until = Math.floor(Date.now() / 1000);

  const { data } = await axios.get(`${FB_BASE}/${igUserId}/insights`, {
    params: {
      metric: [
        'reach',           // Unique accounts reached
        'impressions',     // Total times content shown
        'profile_views',   // Profile page visits
        'website_clicks',  // Clicks on bio link
        'email_contacts',  // Email button clicks
      ].join(','),
      period: 'day',
      since,
      until,
      access_token: accessToken,
    },
  });

  return data.data ?? [];
}

/**
 * Fetch Instagram profile info (followers, posts count etc.)
 */
async function fetchIGProfile(igUserId, accessToken) {
  const { data } = await axios.get(`${FB_BASE}/${igUserId}`, {
    params: {
      fields: [
        'username',
        'name',
        'biography',
        'followers_count',
        'follows_count',
        'media_count',
        'profile_picture_url',
        'website',
      ].join(','),
      access_token: accessToken,
    },
  });
  return data;
}

/**
 * Fetch recent Instagram posts (media)
 */
async function fetchIGMedia(igUserId, accessToken, limit = 12) {
  const { data } = await axios.get(`${FB_BASE}/${igUserId}/media`, {
    params: {
      fields: [
        'id',
        'timestamp',
        'media_type',    // IMAGE, VIDEO, CAROUSEL_ALBUM
        'like_count',
        'comments_count',
        'caption',
        'permalink',
      ].join(','),
      limit,
      access_token: accessToken,
    },
  });
  return data.data ?? [];
}

/**
 * Fetch per-post insights for a single IG media item
 */
async function fetchIGPostInsights(mediaId, accessToken) {
  try {
    const { data } = await axios.get(`${FB_BASE}/${mediaId}/insights`, {
      params: {
        metric: 'reach,impressions,saved,shares,video_views',
        access_token: accessToken,
      },
    });

    // Normalize to flat object
    const result = {};
    for (const item of data.data ?? []) {
      result[item.name] = item.values?.[0]?.value ?? 0;
    }
    return result;
  } catch {
    // Some older posts return errors — skip gracefully
    return { reach: 0, impressions: 0, saved: 0, shares: 0, video_views: 0 };
  }
}

/**
 * Calculate engagement rate from post metrics
 * Formula: (likes + comments + saves) / reach * 100
 */
function calcEngagementRate(likes, comments, saves, reach) {
  if (!reach || reach === 0) return 0;
  return parseFloat(((likes + comments + saves) / reach * 100).toFixed(2));
}

/**
 * Normalize IG metrics array → flat object
 */
function normalizeIGMetrics(metricsArray) {
  const result = {};
  for (const metric of metricsArray) {
    const total = metric.values?.reduce((sum, v) => sum + (v.value || 0), 0) ?? 0;
    result[metric.name] = total;
  }
  return result;
}

// ─────────────────────────────────────────────────────────────
// SECTION 3 — RATE LIMIT SAFE BATCH FETCHER
// ─────────────────────────────────────────────────────────────

/**
 * Process array in chunks with delay to avoid hitting 200 calls/hr limit
 */
async function batchWithDelay(items, fn, chunkSize = 5, delayMs = 1000) {
  const results = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    const chunkResults = await Promise.all(chunk.map(fn));
    results.push(...chunkResults);
    if (i + chunkSize < items.length) {
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
  return results;
}

// ─────────────────────────────────────────────────────────────
// SECTION 4 — DB UPSERT
// ─────────────────────────────────────────────────────────────

/**
 * Save Facebook insights snapshot to DB
 */
async function saveFBInsights(influencerId, fbPageId, metrics, profile) {
  return prisma.facebookInsight.upsert({
    where: {
      influencerId_periodEnd: {
        influencerId,
        periodEnd: new Date(),
      },
    },
    update: {
      pageImpressions:     metrics.page_impressions ?? 0,
      pageReach:           metrics.page_impressions_unique ?? 0,
      pageEngagedUsers:    metrics.page_engaged_users ?? 0,
      pageFans:            metrics.page_fans ?? 0,
      newFans:             metrics.page_fan_adds ?? 0,
      pageViews:           metrics.page_views_total ?? 0,
      postEngagements:     metrics.page_post_engagements ?? 0,
      fetchedAt:           new Date(),
    },
    create: {
      influencerId,
      fbPageId,
      pageImpressions:     metrics.page_impressions ?? 0,
      pageReach:           metrics.page_impressions_unique ?? 0,
      pageEngagedUsers:    metrics.page_engaged_users ?? 0,
      pageFans:            metrics.page_fans ?? 0,
      newFans:             metrics.page_fan_adds ?? 0,
      pageViews:           metrics.page_views_total ?? 0,
      postEngagements:     metrics.page_post_engagements ?? 0,
      periodEnd:           new Date(),
      fetchedAt:           new Date(),
    },
  });
}

/**
 * Save Instagram insights snapshot to DB
 */
async function saveIGInsights(influencerId, igUserId, metrics, profile, posts) {
  const avgReach       = posts.length ? posts.reduce((s, p) => s + (p.reach ?? 0), 0) / posts.length : 0;
  const avgImpressions = posts.length ? posts.reduce((s, p) => s + (p.impressions ?? 0), 0) / posts.length : 0;
  const avgER          = posts.length ? posts.reduce((s, p) => s + (p.engagementRate ?? 0), 0) / posts.length : 0;

  return prisma.instagramInsight.upsert({
    where: {
      influencerId_periodEnd: {
        influencerId,
        periodEnd: new Date(),
      },
    },
    update: {
      followers:       profile.followers_count ?? 0,
      following:       profile.follows_count ?? 0,
      mediaCount:      profile.media_count ?? 0,
      reach:           metrics.reach ?? 0,
      impressions:     metrics.impressions ?? 0,
      profileViews:    metrics.profile_views ?? 0,
      websiteClicks:   metrics.website_clicks ?? 0,
      avgReach:        parseFloat(avgReach.toFixed(2)),
      avgImpressions:  parseFloat(avgImpressions.toFixed(2)),
      avgEngagementRate: parseFloat(avgER.toFixed(2)),
      fetchedAt:       new Date(),
    },
    create: {
      influencerId,
      igUserId,
      followers:       profile.followers_count ?? 0,
      following:       profile.follows_count ?? 0,
      mediaCount:      profile.media_count ?? 0,
      reach:           metrics.reach ?? 0,
      impressions:     metrics.impressions ?? 0,
      profileViews:    metrics.profile_views ?? 0,
      websiteClicks:   metrics.website_clicks ?? 0,
      avgReach:        parseFloat(avgReach.toFixed(2)),
      avgImpressions:  parseFloat(avgImpressions.toFixed(2)),
      avgEngagementRate: parseFloat(avgER.toFixed(2)),
      periodEnd:       new Date(),
      fetchedAt:       new Date(),
    },
  });
}

// ─────────────────────────────────────────────────────────────
// SECTION 5 — MAIN EXPORTED FUNCTIONS
// ─────────────────────────────────────────────────────────────

/**
 * Fetch + store FACEBOOK insights for one influencer
 */
export async function syncFacebookInsights(influencerId) {
  const profile = await prisma.influencerProfile.findUnique({
    where: { userId: influencerId },
    select: { fbPageId: true, igAccessToken: true },
  });

  if (!profile?.fbPageId || !profile?.igAccessToken) {
    throw new Error(`No Facebook Page linked for influencer: ${influencerId}`);
  }

  const token = decrypt(profile.igAccessToken); // same token works for FB Page too

  const [rawMetrics, pageProfile] = await Promise.all([
    fetchFBPageInsights(profile.fbPageId, token),
    fetchFBPageProfile(profile.fbPageId, token),
  ]);

  const metrics = normalizeFBMetrics(rawMetrics);
  await saveFBInsights(influencerId, profile.fbPageId, metrics, pageProfile);

  return { success: true, platform: 'facebook', influencerId };
}

/**
 * Fetch + store INSTAGRAM insights for one influencer
 */
export async function syncInstagramInsights(influencerId) {
  const profile = await prisma.influencerProfile.findUnique({
    where: { userId: influencerId },
    select: { igUserId: true, igAccessToken: true },
  });

  if (!profile?.igUserId || !profile?.igAccessToken) {
    throw new Error(`No Instagram account linked for influencer: ${influencerId}`);
  }

  const token = decrypt(profile.igAccessToken);

  // Fetch account-level data in parallel
  const [rawMetrics, igProfile, mediaPosts] = await Promise.all([
    fetchIGAccountInsights(profile.igUserId, token),
    fetchIGProfile(profile.igUserId, token),
    fetchIGMedia(profile.igUserId, token, 12),
  ]);

  // Fetch per-post insights in batches (rate limit safe)
  const postsWithInsights = await batchWithDelay(
    mediaPosts,
    async (post) => {
      const postInsights = await fetchIGPostInsights(post.id, token);
      return {
        ...post,
        ...postInsights,
        engagementRate: calcEngagementRate(
          post.like_count ?? 0,
          post.comments_count ?? 0,
          postInsights.saved ?? 0,
          postInsights.reach ?? 0
        ),
      };
    },
    5,    // 5 posts at a time
    800   // 800ms delay between chunks
  );

  const metrics = normalizeIGMetrics(rawMetrics);
  await saveIGInsights(influencerId, profile.igUserId, metrics, igProfile, postsWithInsights);

  return {
    success: true,
    platform: 'instagram',
    influencerId,
    postsProcessed: postsWithInsights.length,
  };
}

/**
 * Sync BOTH FB + IG for one influencer (used by cron)
 */
export async function syncAllInsights(influencerId) {
  const results = await Promise.allSettled([
    syncFacebookInsights(influencerId),
    syncInstagramInsights(influencerId),
  ]);

  return {
    facebook: results[0].status === 'fulfilled'
      ? results[0].value
      : { success: false, error: results[0].reason?.message },
    instagram: results[1].status === 'fulfilled'
      ? results[1].value
      : { success: false, error: results[1].reason?.message },
  };
}

/**
 * Bulk sync all connected influencers (cron job entry point)
 */
export async function syncAllInfluencers() {
  const influencers = await prisma.influencerProfile.findMany({
    where: {
      igAccessToken: { not: null },
      igTokenExpiry: { gt: new Date() }, // only non-expired tokens
    },
    select: { userId: true },
  });

  console.log(`[InsightService] Syncing ${influencers.length} influencers...`);

  const results = await batchWithDelay(
    influencers,
    ({ userId }) => syncAllInsights(userId),
    3,    // 3 influencers at a time
    2000  // 2s between chunks
  );

  const succeeded = results.filter(r => r.facebook?.success || r.instagram?.success).length;
  console.log(`[InsightService] Done. ${succeeded}/${influencers.length} succeeded.`);

  return results;
}