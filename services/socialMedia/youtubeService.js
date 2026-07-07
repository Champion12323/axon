// src/services/youtube.service.js
import crypto from 'crypto';
import prisma from '../../config/prisma.js';
// ─── Encryption (reuse same pattern as KYC) ──────────────────────────────────
const ALG = 'aes-256-gcm';
const KEY = Buffer.from(process.env.YT_ENCRYPT_KEY, 'hex'); // 32-byte hex

function encrypt(text) {
  const iv     = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALG, KEY, iv);
  const enc    = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag    = cipher.getAuthTag();
  return `${iv.toString('hex')}:${tag.toString('hex')}:${enc.toString('hex')}`;
}

function decrypt(payload) {
  const [ivHex, tagHex, encHex] = payload.split(':');
  const dec = crypto.createDecipheriv(ALG, KEY, Buffer.from(ivHex, 'hex'));
  dec.setAuthTag(Buffer.from(tagHex, 'hex'));
  return dec.update(Buffer.from(encHex, 'hex')) + dec.final('utf8');
}

// ─── Google OAuth config ─────────────────────────────────────────────────────
const GG = {
  clientId:     process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri:  process.env.YOUTUBE_REDIRECT_URI,
  authBase:     'https://accounts.google.com/o/oauth2/v2/auth',
  tokenUrl:     'https://oauth2.googleapis.com/token',
  revokeUrl:    'https://oauth2.googleapis.com/revoke',
  // YouTube Data API v3
  channelUrl:   'https://www.googleapis.com/youtube/v3/channels',
  videosUrl:    'https://www.googleapis.com/youtube/v3/videos',
  searchUrl:    'https://www.googleapis.com/youtube/v3/search',
  // YouTube Analytics API
  analyticsUrl: 'https://youtubeanalytics.googleapis.com/v2/reports',
};

const SCOPES = [
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/yt-analytics.readonly',
  'openid email profile',
].join(' ');

// ─── 1. Generate OAuth URL ───────────────────────────────────────────────────
export function getAuthUrl(influencerId) {
  const state = Buffer.from(JSON.stringify({
    influencerId,
    nonce: crypto.randomBytes(8).toString('hex'),
  })).toString('base64url');

  const params = new URLSearchParams({
    client_id:     GG.clientId,
    redirect_uri:  GG.redirectUri,
    response_type: 'code',
    scope:         SCOPES,
    access_type:   'offline',   // get refresh token
    prompt:        'consent',   // force consent to always get refresh_token
    state,
  });

  return { authUrl: `${GG.authBase}?${params.toString()}`, state };
}

// ─── 2. Handle callback — exchange code + fetch channel ──────────────────────
export async function handleCallback(code, state) {
  let influencerId;
  try {
    influencerId = JSON.parse(Buffer.from(state, 'base64url').toString()).influencerId;
  } catch {
    throw Object.assign(new Error('Invalid state'), { status: 400 });
  }

  // Exchange code for tokens
  const tokenRes = await fetch(GG.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id:     GG.clientId,
      client_secret: GG.clientSecret,
      redirect_uri:  GG.redirectUri,
      grant_type:    'authorization_code',
    }),
  });

  if (!tokenRes.ok) {
    const e = await tokenRes.text();
    throw Object.assign(new Error(`Token exchange failed: ${e}`), { status: 502 });
  }

  const token = await tokenRes.json();
  // token: { access_token, refresh_token, expires_in, token_type }

  if (!token.refresh_token) {
    throw Object.assign(
      new Error('No refresh token returned. User must re-authorize with prompt=consent.'),
      { status: 400 }
    );
  }

  const expiresAt = new Date(Date.now() + token.expires_in * 1000);

  // Fetch channel info
  const channel = await fetchChannelInfo(token.access_token);

  // Upsert YouTube account
  const account = await prisma.youtubeAccount.upsert({
    where:  { influencerId },
    create: {
      influencerId,
      accessToken:    encrypt(token.access_token),
      refreshToken:   encrypt(token.refresh_token),
      tokenExpiresAt: expiresAt,
      ...channel,
    },
    update: {
      accessToken:    encrypt(token.access_token),
      refreshToken:   encrypt(token.refresh_token),
      tokenExpiresAt: expiresAt,
      ...channel,
      lastSyncedAt:   new Date(),
    },
  });

  // Kick off initial video sync in background
  syncVideos(account.id, token.access_token).catch(console.error);

  return { connected: true, channelTitle: channel.channelTitle, channelId: channel.channelId };
}

// ─── 3. Get a valid access token (auto-refresh if expired) ───────────────────
async function getValidToken(accountId) {
  const account = await prisma.youtubeAccount.findUnique({ where: { id: accountId } });
  if (!account) throw new Error('YouTube account not found');

  if (account.tokenExpiresAt > new Date()) {
    return decrypt(account.accessToken);
  }

  // Refresh
  const res = await fetch(GG.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id:     GG.clientId,
      client_secret: GG.clientSecret,
      refresh_token: decrypt(account.refreshToken),
      grant_type:    'refresh_token',
    }),
  });

  if (!res.ok) throw new Error('Token refresh failed');

  const token = await res.json();
  const expiresAt = new Date(Date.now() + token.expires_in * 1000);

  await prisma.youtubeAccount.update({
    where: { id: accountId },
    data: {
      accessToken:    encrypt(token.access_token),
      tokenExpiresAt: expiresAt,
    },
  });

  return token.access_token;
}

// ─── 4. Fetch channel info from YouTube Data API ─────────────────────────────
async function fetchChannelInfo(accessToken) {
  const params = new URLSearchParams({
    part: 'snippet,statistics,brandingSettings',
    mine: 'true',
  });

  const res = await fetch(`${GG.channelUrl}?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) throw new Error('Failed to fetch channel info');
  const data = await res.json();
  const ch   = data.items?.[0];
  if (!ch) throw new Error('No YouTube channel found on this account');

  const stats = ch.statistics;
  const subs  = parseInt(stats.subscriberCount ?? '0');
  const views = parseInt(stats.viewCount       ?? '0');
  const vids  = parseInt(stats.videoCount      ?? '0');

  return {
    channelId:        ch.id,
    channelTitle:     ch.snippet.title,
    channelHandle:    ch.snippet.customUrl   ?? null,
    channelThumb:     ch.snippet.thumbnails?.default?.url ?? null,
    channelUrl:       `https://youtube.com/channel/${ch.id}`,
    subscribers:      subs,
    totalViews:       BigInt(views),
    videoCount:       vids,
    avgViewsPerVideo: vids > 0 ? Math.round(views / vids) : 0,
  };
}

// ─── 5. Sync recent videos + their stats ─────────────────────────────────────
export async function syncVideos(accountId, accessTokenOverride = null) {
  const accessToken = accessTokenOverride ?? await getValidToken(accountId);
  const account = await prisma.youtubeAccount.findUnique({ where: { id: accountId } });

  // Fetch latest 50 uploads
  const searchParams = new URLSearchParams({
    part:       'snippet',
    channelId:  account.channelId,
    order:      'date',
    type:       'video',
    maxResults: '50',
  });

  const searchRes = await fetch(`${GG.searchUrl}?${searchParams}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!searchRes.ok) throw new Error('Failed to fetch video list');
  const searchData = await searchRes.json();
  const videoIds = (searchData.items ?? []).map((i) => i.id.videoId).join(',');

  if (!videoIds) return;

  // Fetch stats for all videos in one call
  const statsParams = new URLSearchParams({
    part: 'snippet,statistics,contentDetails',
    id:   videoIds,
  });

  const statsRes = await fetch(`${GG.videosUrl}?${statsParams}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!statsRes.ok) throw new Error('Failed to fetch video stats');
  const statsData = await statsRes.json();

  // Fetch analytics (watch time) — last 90 days
  const analyticsMap = await fetchVideoAnalytics(accessToken, account.channelId);

  // Upsert each video
  for (const v of statsData.items ?? []) {
    const analytics = analyticsMap[v.id] ?? {};
    await prisma.youtubeVideo.upsert({
      where:  { videoId: v.id },
      create: {
        accountId,
        videoId:     v.id,
        title:       v.snippet.title,
        description: v.snippet.description ?? null,
        thumbnail:   v.snippet.thumbnails?.medium?.url ?? null,
        publishedAt: new Date(v.snippet.publishedAt),
        duration:    v.contentDetails?.duration ?? null,
        viewCount:   BigInt(v.statistics?.viewCount    ?? '0'),
        likeCount:   parseInt(v.statistics?.likeCount  ?? '0'),
        commentCount:parseInt(v.statistics?.commentCount ?? '0'),
        estimatedMinutesWatched: BigInt(analytics.estimatedMinutesWatched ?? '0'),
        averageViewDuration:     analytics.averageViewDuration ?? 0,
        averageViewPercentage:   analytics.averageViewPercentage ?? 0,
      },
      update: {
        title:       v.snippet.title,
        viewCount:   BigInt(v.statistics?.viewCount    ?? '0'),
        likeCount:   parseInt(v.statistics?.likeCount  ?? '0'),
        commentCount:parseInt(v.statistics?.commentCount ?? '0'),
        estimatedMinutesWatched: BigInt(analytics.estimatedMinutesWatched ?? '0'),
        averageViewDuration:     analytics.averageViewDuration ?? 0,
        averageViewPercentage:   analytics.averageViewPercentage ?? 0,
        syncedAt:    new Date(),
      },
    });
  }

  // Refresh channel stats too
  const updatedChannel = await fetchChannelInfo(accessToken);
  await prisma.youtubeAccount.update({
    where: { id: accountId },
    data: { ...updatedChannel, lastSyncedAt: new Date() },
  });
}

// ─── 6. YouTube Analytics API — watch time per video ─────────────────────────
async function fetchVideoAnalytics(accessToken, channelId) {
  const end   = new Date().toISOString().split('T')[0];
  const start = new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0];

  const params = new URLSearchParams({
    ids:        `channel==${channelId}`,
    startDate:  start,
    endDate:    end,
    metrics:    'estimatedMinutesWatched,averageViewDuration,averageViewPercentage',
    dimensions: 'video',
    sort:       '-estimatedMinutesWatched',
    maxResults: '50',
  });

  try {
    const res = await fetch(`${GG.analyticsUrl}?${params}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return {};

    const data = await res.json();
    const map  = {};
    for (const row of data.rows ?? []) {
      map[row[0]] = {
        estimatedMinutesWatched: row[1],
        averageViewDuration:     row[2],
        averageViewPercentage:   row[3],
      };
    }
    return map;
  } catch { return {}; }
}

// ─── 7. Get influencer's YouTube profile (for profile page) ──────────────────
export async function getYoutubeProfile(influencerId) {
  const account = await prisma.youtubeAccount.findUnique({
    where:   { influencerId },
    include: {
      videos: {
        orderBy: { viewCount: 'desc' },
        take: 10,
        select: {
          videoId: true, title: true, thumbnail: true, publishedAt: true,
          viewCount: true, likeCount: true, commentCount: true,
          averageViewPercentage: true, duration: true,
        },
      },
    },
  });

  if (!account) return null;

  return {
    connected:       true,
    channelId:       account.channelId,
    channelTitle:    account.channelTitle,
    channelHandle:   account.channelHandle,
    channelThumb:    account.channelThumb,
    channelUrl:      account.channelUrl,
    subscribers:     account.subscribers,
    totalViews:      account.totalViews.toString(),
    videoCount:      account.videoCount,
    avgViewsPerVideo:account.avgViewsPerVideo,
    engagementRate:  account.engagementRate,
    lastSyncedAt:    account.lastSyncedAt,
    topVideos:       account.videos.map(serializeVideo),
  };
}

// ─── 8. Link video to campaign ───────────────────────────────────────────────
export async function linkVideoToCampaign(influencerId, campaignId, videoId) {
  const account = await prisma.youtubeAccount.findUnique({ where: { influencerId } });
  if (!account) throw Object.assign(new Error('YouTube not connected'), { status: 400 });

  const video = await prisma.youtubeVideo.findUnique({ where: { videoId } });
  if (!video) throw Object.assign(new Error('Video not found. Run sync first.'), { status: 404 });

  return prisma.campaignYoutubeVideo.upsert({
    where:  { campaignId_videoId: { campaignId, videoId } },
    create: {
      campaignId,
      accountId:      account.id,
      videoId,
      viewsAtTracking: video.viewCount,
    },
    update: { trackedAt: new Date() },
  });
}

// ─── 9. Get campaign YouTube analytics ───────────────────────────────────────
export async function getCampaignYoutubeStats(campaignId) {
  const links = await prisma.campaignYoutubeVideo.findMany({
    where:   { campaignId },
    include: {
      video:   true,
      account: { select: { channelTitle: true, channelHandle: true, subscribers: true } },
    },
  });

  if (!links.length) return { videos: [], totals: null };

  const totals = links.reduce((acc, l) => ({
    totalViews:   acc.totalViews   + Number(l.video.viewCount),
    totalLikes:   acc.totalLikes   + l.video.likeCount,
    totalComments:acc.totalComments+ l.video.commentCount,
    watchMinutes: acc.watchMinutes + Number(l.video.estimatedMinutesWatched),
  }), { totalViews: 0, totalLikes: 0, totalComments: 0, watchMinutes: 0 });

  return {
    videos: links.map((l) => ({
      ...serializeVideo(l.video),
      channelTitle:   l.account.channelTitle,
      channelHandle:  l.account.channelHandle,
      subscribers:    l.account.subscribers,
      viewsGained:    Number(l.video.viewCount) - Number(l.viewsAtTracking),
    })),
    totals,
  };
}

// ─── 10. Disconnect YouTube ───────────────────────────────────────────────────
export async function disconnectYoutube(influencerId) {
  const account = await prisma.youtubeAccount.findUnique({ where: { influencerId } });
  if (!account) return;

  // Revoke token
  try {
    await fetch(`${GG.revokeUrl}?token=${decrypt(account.accessToken)}`, { method: 'POST' });
  } catch { /* ignore revoke errors */ }

  await prisma.youtubeAccount.delete({ where: { influencerId } });
}

// ─── Helper: serialize BigInt fields ─────────────────────────────────────────
function serializeVideo(v) {
  return {
    ...v,
    viewCount:               v.viewCount?.toString(),
    estimatedMinutesWatched: v.estimatedMinutesWatched?.toString(),
  };
}