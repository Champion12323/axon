// src/controllers/youtube.controller.js
import * as yt from '../../services/socialMedia/youtubeService.js';

// GET /api/youtube/auth  → redirect influencer to Google OAuth
export async function initiateAuth(req, res, next) {
  try {
    const { authUrl } = yt.getAuthUrl(req.user.id);
    res.json({ success: true, data: { authUrl } });
  } catch (err) { next(err); }
}

// GET /api/youtube/callback?code=&state=  (Google redirects here)
export async function handleCallback(req, res, next) {
  try {
    const { code, state } = req.query;
    if (!code || !state) {
      return res.redirect(`${process.env.FRONTEND_URL}/settings/integrations?yt=error`);
    }
    await yt.handleCallback(code, state);
    res.redirect(`${process.env.FRONTEND_URL}/settings/integrations?yt=connected`);
  } catch (err) {
    console.error('YouTube callback error:', err);
    res.redirect(`${process.env.FRONTEND_URL}/settings/integrations?yt=error`);
  }
}

// GET /api/youtube/profile  → influencer's own channel + top videos
export async function getProfile(req, res, next) {
  try {
    const data = await yt.getYoutubeProfile(req.user.id);
    res.json({ success: true, data: data ?? { connected: false } });
  } catch (err) { next(err); }
}

// POST /api/youtube/sync  → manual re-sync
export async function syncNow(req, res, next) {
  try {
    const account = await import('../config/prisma.js')
      .then(({ prisma }) => prisma.youtubeAccount.findUnique({ where: { influencerId: req.user.id } }));
    if (!account) return res.status(404).json({ success: false, message: 'YouTube not connected' });

    await yt.syncVideos(account.id);
    const data = await yt.getYoutubeProfile(req.user.id);
    res.json({ success: true, message: 'Sync complete', data });
  } catch (err) { next(err); }
}

// POST /api/youtube/campaign/:campaignId/link
// body: { videoId: "dQw4w9WgXcQ" }
export async function linkToCampaign(req, res, next) {
  try {
    const { campaignId } = req.params;
    const { videoId }    = req.body;
    if (!videoId) return res.status(400).json({ success: false, message: 'videoId required' });
    const data = await yt.linkVideoToCampaign(req.user.id, campaignId, videoId);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

// GET /api/youtube/campaign/:campaignId/stats  (brand or influencer)
export async function getCampaignStats(req, res, next) {
  try {
    const data = await yt.getCampaignYoutubeStats(req.params.campaignId);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

// DELETE /api/youtube/disconnect
export async function disconnect(req, res, next) {
  try {
    await yt.disconnectYoutube(req.user.id);
    res.json({ success: true, message: 'YouTube account disconnected' });
  } catch (err) { next(err); }
}