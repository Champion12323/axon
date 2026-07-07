// src/routes/instagramAuthRoutes.js

import express from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { authenticate } from '../../middleware/authenticate.js';
import {
  getOAuthRedirectUrl,
  handleOAuthCallback,
  getInstagramInsights,
  getAudienceDemographics,
  getStoriesInsights,
  publishContent,
} from '../../services/socialMedia/instagramOAuthService.js';

const router = express.Router();

// ─────────────────────────────────────────────
// Existing routes
// ─────────────────────────────────────────────

// POST /auth/instagram/connect
router.post('/connect', authenticate, asyncHandler(async (req, res) => {
  const state = req.user.id;
  const url   = getOAuthRedirectUrl(state);
  res.json({ success: true, data: { redirectUrl: url } });
}));

// GET /auth/instagram/callback
router.get('/callback', asyncHandler(async (req, res) => {
  const { code, state: influencerId, error } = req.query;

  if (error) {
    return res.redirect(`${process.env.FRONTEND_URL}/settings?ig_error=${error}`);
  }

  try {
    await handleOAuthCallback(code, influencerId);
    res.redirect(`${process.env.FRONTEND_URL}/settings?ig_connected=true`);
  } catch (err) {
    const code = err.code ?? 'connection_failed';
    res.redirect(`${process.env.FRONTEND_URL}/settings?ig_error=${code}`);
  }
}));

// ─────────────────────────────────────────────
// ✅ 1. Account insights
// GET /auth/instagram/insights
// ─────────────────────────────────────────────

router.get('/insights', authenticate, asyncHandler(async (req, res) => {
  const data = await getInstagramInsights(req.user.id);
  res.json({ success: true, data });
}));

// ─────────────────────────────────────────────
// ✅ 2. Audience demographics (NEW)
// GET /auth/instagram/audience
// ─────────────────────────────────────────────

router.get('/audience', authenticate, asyncHandler(async (req, res) => {
  const data = await getAudienceDemographics(req.user.id);
  res.json({ success: true, data });
}));

// ─────────────────────────────────────────────
// ✅ 3. Stories insights (NEW)
// GET /auth/instagram/stories
// ─────────────────────────────────────────────

router.get('/stories', authenticate, asyncHandler(async (req, res) => {
  const data = await getStoriesInsights(req.user.id);
  res.json({ success: true, data });
}));

// ─────────────────────────────────────────────
// ✅ 4. Content publish (NEW)
// POST /auth/instagram/publish
// ─────────────────────────────────────────────

router.post('/publish', authenticate, asyncHandler(async (req, res) => {
  const { mediaType, mediaUrl, caption, locationId } = req.body;

  if (!mediaType || !mediaUrl) {
    return res.status(400).json({
      success: false,
      message: 'mediaType and mediaUrl are required',
    });
  }

  const data = await publishContent(req.user.id, {
    mediaType,
    mediaUrl,
    caption,
    locationId,
  });

  res.status(201).json({ success: true, data });
}));

export default router;