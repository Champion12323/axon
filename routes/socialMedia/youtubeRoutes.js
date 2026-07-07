// src/routes/youtube.routes.js
import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/authenticate.js';
import * as yt from '../../controllers/socialMedia/youtubeController.js';

const router = Router();

// ── Influencer ────────────────────────────────────────────────────────────────
router.get('/auth',       authenticate, requireRole('INFLUENCER'), yt.initiateAuth);
router.get('/callback',   yt.handleCallback);   // public — Google redirects here
router.get('/profile',    authenticate, requireRole('INFLUENCER'), yt.getProfile);
router.post('/sync',      authenticate, requireRole('INFLUENCER'), yt.syncNow);
router.delete('/disconnect', authenticate, requireRole('INFLUENCER'), yt.disconnect);

// ── Campaign linking (influencer attaches their video to a campaign) ───────────
router.post('/campaign/:campaignId/link', authenticate, requireRole('INFLUENCER'), yt.linkToCampaign);

// ── Campaign stats (brand + influencer both can view) ─────────────────────────
router.get('/campaign/:campaignId/stats', authenticate, yt.getCampaignStats);

export default router;

