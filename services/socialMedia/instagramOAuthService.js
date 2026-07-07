// src/services/instagramOAuthService.js

import axios from 'axios';
import crypto from 'crypto';
import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/AppError.js';

const FB_BASE      = 'https://graph.facebook.com/v20.0';
const APP_ID       = process.env.APP_ID;
const APP_SECRET   = process.env.APP_SECRET;
const REDIRECT_URI = process.env.FACEBOOK_REDIRECT_URI;
const ENC_KEY      = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');

// ─────────────────────────────────────────────
// Encryption helpers
// ─────────────────────────────────────────────

function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', ENC_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(text) {
  const [iv, encrypted] = text.split(':').map(h => Buffer.from(h, 'hex'));
  const decipher = crypto.createDecipheriv('aes-256-cbc', ENC_KEY, iv);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString();
}

// ─────────────────────────────────────────────
// Custom errors
// ─────────────────────────────────────────────

export class NoFacebookPageError extends Error {
  constructor() {
    super('No Facebook Pages found.');
    this.code = 'IG_NO_FACEBOOK_PAGE';
    this.statusCode = 422;
  }
}

export class NoInstagramBusinessAccountError extends Error {
  constructor() {
    super('No Instagram Business account linked to this Facebook profile.');
    this.code = 'IG_NO_BUSINESS_ACCOUNT';
    this.statusCode = 422;
  }
}

// ─────────────────────────────────────────────
// Helper — influencer token DB se lo
// ─────────────────────────────────────────────

async function getInfluencerToken(influencerId) {
  const profile = await prisma.influencerProfile.findUnique({
    where:  { userId: influencerId },
    select: { igUserId: true, fbPageId: true, igAccessToken: true, igTokenExpiry: true },
  });

  if (!profile?.igAccessToken) {
    throw new AppError('Instagram not connected', 400, 'IG_NOT_CONNECTED');
  }
  if (profile.igTokenExpiry < new Date()) {
    throw new AppError('Instagram token expired. Please reconnect.', 401, 'IG_TOKEN_EXPIRED');
  }

  return {
    token:    decrypt(profile.igAccessToken),
    igUserId: profile.igUserId,
    fbPageId: profile.fbPageId,
  };
}

// ─────────────────────────────────────────────
// Step 1 — OAuth redirect URL
// ─────────────────────────────────────────────

export function getOAuthRedirectUrl(state) {
  const params = new URLSearchParams({
    client_id:     APP_ID,
    redirect_uri:  REDIRECT_URI,
    scope: [
      'instagram_basic',
      'instagram_manage_insights',
      'instagram_content_publish',  // ✅ content publish ke liye
      'pages_show_list',
      'pages_read_engagement',
    ].join(','),
    response_type: 'code',
    state,
  });
  return `https://www.facebook.com/v20.0/dialog/oauth?${params}`;
}

// ─────────────────────────────────────────────
// Step 2 — code → short-lived token
// ─────────────────────────────────────────────

async function getShortLivedToken(code) {
  const { data } = await axios.get(`${FB_BASE}/oauth/access_token`, {
    params: {
      client_id:     APP_ID,
      client_secret: APP_SECRET,
      redirect_uri:  REDIRECT_URI,
      code,
    },
  });
  return data.access_token;
}

// ─────────────────────────────────────────────
// Step 3 — short → long-lived token (60 days)
// ─────────────────────────────────────────────

async function getLongLivedToken(shortToken) {
  const { data } = await axios.get(`${FB_BASE}/oauth/access_token`, {
    params: {
      grant_type:        'fb_exchange_token',
      client_id:         APP_ID,
      client_secret:     APP_SECRET,
      fb_exchange_token: shortToken,
    },
  });
  return { token: data.access_token, expiresIn: data.expires_in };
}

// ─────────────────────────────────────────────
// Step 4 — IG business account ID fetch
// ─────────────────────────────────────────────

async function getIgUserId(longLivedToken) {
  const { data } = await axios.get(`${FB_BASE}/me/accounts`, {
    params: {
      fields:       'name,instagram_business_account',
      access_token: longLivedToken,
    },
  });

  const pages = data.data ?? [];
  if (pages.length === 0) throw new NoFacebookPageError();

  const linkedPage = pages.find(p => p.instagram_business_account?.id);
  if (!linkedPage) throw new NoInstagramBusinessAccountError();

  return {
    igUserId:   linkedPage.instagram_business_account.id,
    fbPageId:   linkedPage.id,
    fbPageName: linkedPage.name,
  };
}

// ─────────────────────────────────────────────
// Main OAuth callback
// ─────────────────────────────────────────────

export async function handleOAuthCallback(code, influencerId) {
  const shortToken              = await getShortLivedToken(code);
  const { token, expiresIn }    = await getLongLivedToken(shortToken);
  const { igUserId, fbPageId, fbPageName } = await getIgUserId(token);

  const expiry = new Date(Date.now() + expiresIn * 1000);

  await prisma.influencerProfile.update({
    where: { userId: influencerId },
    data: {
      igUserId,
      fbPageId,
      fbPageName,
      igAccessToken: encrypt(token),
      igTokenExpiry: expiry,
      igConnectedAt: new Date(),
    },
  });

  return { igUserId, fbPageId, tokenExpiry: expiry };
}

// ─────────────────────────────────────────────
// Token refresh (cron use karega)
// ─────────────────────────────────────────────

export async function refreshLongLivedToken(encryptedToken) {
  const currentToken = decrypt(encryptedToken);

  const { data } = await axios.get(`${FB_BASE}/oauth/access_token`, {
    params: {
      grant_type:   'ig_refresh_token',
      access_token: currentToken,
    },
  });

  return {
    encryptedToken: encrypt(data.access_token),
    expiresIn:      data.expires_in,
  };
}

// ─────────────────────────────────────────────
// ✅ 1. Instagram Account Insights
// ─────────────────────────────────────────────

export async function getInstagramInsights(influencerId) {
  const { token, igUserId } = await getInfluencerToken(influencerId);

  const [accountInsights, profileData] = await Promise.all([
    axios.get(`${FB_BASE}/${igUserId}/insights`, {
      params: {
        metric:       'reach,impressions,profile_views',
        period:       'day',
        access_token: token,
      },
    }),
    axios.get(`${FB_BASE}/${igUserId}`, {
      params: {
        fields:       'followers_count,media_count,username,biography,website',
        access_token: token,
      },
    }),
  ]);

  return {
    accountInsights: accountInsights.data.data,
    profile:         profileData.data,
  };
}

// ─────────────────────────────────────────────
// ✅ 2. Audience Demographics (NEW)
// ─────────────────────────────────────────────

export async function getAudienceDemographics(influencerId) {
  const { token, igUserId } = await getInfluencerToken(influencerId);

  const [ageGender, country, city] = await Promise.all([
    // Age + Gender breakdown
    axios.get(`${FB_BASE}/${igUserId}/insights`, {
      params: {
        metric:       'follower_demographics',
        period:       'lifetime',
        breakdown:    'age,gender',
        metric_type:  'total_value',
        access_token: token,
      },
    }),

    // Country breakdown
    axios.get(`${FB_BASE}/${igUserId}/insights`, {
      params: {
        metric:       'follower_demographics',
        period:       'lifetime',
        breakdown:    'country',
        metric_type:  'total_value',
        access_token: token,
      },
    }),

    // City breakdown
    axios.get(`${FB_BASE}/${igUserId}/insights`, {
      params: {
        metric:       'follower_demographics',
        period:       'lifetime',
        breakdown:    'city',
        metric_type:  'total_value',
        access_token: token,
      },
    }),
  ]);

  return {
    ageGender: ageGender.data.data?.[0]?.total_value?.breakdowns ?? [],
    country:   country.data.data?.[0]?.total_value?.breakdowns   ?? [],
    city:      city.data.data?.[0]?.total_value?.breakdowns       ?? [],
  };
}

// ─────────────────────────────────────────────
// ✅ 3. Stories Insights (NEW)
// ─────────────────────────────────────────────

export async function getStoriesInsights(influencerId) {
  const { token, igUserId } = await getInfluencerToken(influencerId);

  // Step 1 — Active stories fetch karo
  const { data: storiesData } = await axios.get(`${FB_BASE}/${igUserId}/stories`, {
    params: {
      fields:       'id,media_type,timestamp,media_url,thumbnail_url',
      access_token: token,
    },
  });

  const stories = storiesData.data ?? [];
  if (stories.length === 0) return { stories: [], insights: [] };

  // Step 2 — Har story ke insights fetch karo
  const insights = await Promise.allSettled(
    stories.map(story =>
      axios.get(`${FB_BASE}/${story.id}/insights`, {
        params: {
          metric:       'impressions,reach,replies,exits,taps_forward,taps_back',
          access_token: token,
        },
      }).then(res => ({
        storyId:    story.id,
        mediaType:  story.media_type,
        timestamp:  story.timestamp,
        thumbnailUrl: story.thumbnail_url ?? story.media_url,
        metrics:    res.data.data,
      }))
    )
  );

  // Settled results — failed ones skip karo
  const resolved = insights
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value);

  return { stories, insights: resolved };
}

// ─────────────────────────────────────────────
// ✅ 4. Content Publish (NEW)
// Two-step: container create → publish
// ─────────────────────────────────────────────

export async function publishContent(influencerId, { mediaType, mediaUrl, caption, locationId }) {
  const { token, igUserId } = await getInfluencerToken(influencerId);

  // Validate mediaType
  const allowed = ['IMAGE', 'REEL', 'CAROUSEL'];
  if (!allowed.includes(mediaType?.toUpperCase())) {
    throw new AppError(`Invalid mediaType. Allowed: ${allowed.join(', ')}`, 400, 'INVALID_MEDIA_TYPE');
  }

  // Step 1 — Media container create karo
  const containerParams = {
    access_token: token,
    caption:      caption ?? '',
    ...(locationId && { location_id: locationId }),
  };

  if (mediaType.toUpperCase() === 'IMAGE') {
    containerParams.image_url  = mediaUrl;
  } else if (mediaType.toUpperCase() === 'REEL') {
    containerParams.media_type = 'REELS';
    containerParams.video_url  = mediaUrl;
  }

  const { data: containerData } = await axios.post(
    `${FB_BASE}/${igUserId}/media`,
    null,
    { params: containerParams }
  );

  const containerId = containerData.id;
  if (!containerId) throw new AppError('Failed to create media container', 500, 'IG_CONTAINER_FAILED');

  // Step 2 — Container status check (video processing ke liye wait karo)
  if (mediaType.toUpperCase() === 'REEL') {
    await waitForContainer(containerId, token);
  }

  // Step 3 — Publish karo
  const { data: publishData } = await axios.post(
    `${FB_BASE}/${igUserId}/media_publish`,
    null,
    {
      params: {
        creation_id:  containerId,
        access_token: token,
      },
    }
  );

  if (!publishData.id) throw new AppError('Failed to publish content', 500, 'IG_PUBLISH_FAILED');

  // Step 4 — Published media details fetch karo
  const { data: mediaDetails } = await axios.get(`${FB_BASE}/${publishData.id}`, {
    params: {
      fields:       'id,permalink,timestamp,media_type,thumbnail_url',
      access_token: token,
    },
  });

  return {
    mediaId:   publishData.id,
    permalink: mediaDetails.permalink,
    timestamp: mediaDetails.timestamp,
    mediaType: mediaDetails.media_type,
  };
}

// Helper — Reel processing ke liye poll karo (max 2 min)
async function waitForContainer(containerId, token, maxRetries = 12, delayMs = 10000) {
  for (let i = 0; i < maxRetries; i++) {
    const { data } = await axios.get(`${FB_BASE}/${containerId}`, {
      params: {
        fields:       'status_code,status',
        access_token: token,
      },
    });

    if (data.status_code === 'FINISHED') return true;
    if (data.status_code === 'ERROR') {
      throw new AppError(`Media processing failed: ${data.status}`, 500, 'IG_PROCESSING_FAILED');
    }

    // Wait before retry
    await new Promise(r => setTimeout(r, delayMs));
  }

  throw new AppError('Media processing timed out', 408, 'IG_PROCESSING_TIMEOUT');
}

// ─────────────────────────────────────────────
// Facebook Page Insights (existing — unchanged)
// ─────────────────────────────────────────────

export async function getFacebookPageInsights(fbPageId, accessToken) {
  const { data } = await axios.get(`${FB_BASE}/${fbPageId}/insights`, {
    params: {
      metric: [
        'page_impressions',
        'page_engaged_users',
        'page_fans',
        'page_views_total',
      ].join(','),
      period:       'day',
      access_token: decrypt(accessToken),
    },
  });
  return data.data;
}