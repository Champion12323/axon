// src/routes/campaign.routes.js

import express from 'express';
import * as campaignController from '../controllers/compaignController.js';
import { authenticate, requireRole } from '../middleware/authenticate.js';

const router = express.Router();

// ─────────────────────────────────────────────
// INFLUENCER routes
// ─────────────────────────────────────────────

// Browse active campaigns
router.get('/',
  authenticate,
  campaignController.listActiveCampaigns
);

// My applications
router.get('/applications/my',
  authenticate,
  requireRole('INFLUENCER'),
  campaignController.getMyApplications
);

// ✅ My invites
router.get('/invites/my',
  authenticate,
  requireRole('INFLUENCER'),
  campaignController.getMyInvites
);

// ✅ Accept invite
router.post('/invites/:inviteId/accept',
  authenticate,
  requireRole('INFLUENCER'),
  campaignController.acceptInvite
);

// ✅ Decline invite
router.post('/invites/:inviteId/decline',
  authenticate,
  requireRole('INFLUENCER'),
  campaignController.declineInvite
);

// Apply to campaign
router.post('/:id/apply',
  authenticate,
  requireRole('INFLUENCER'),
  campaignController.applyToCampaign
);

// Single campaign detail
router.get('/:id',
  authenticate,
  campaignController.getCampaignById
);

// ─────────────────────────────────────────────
// BRAND routes
// ─────────────────────────────────────────────

// My campaigns
router.get('/brand/my',
  authenticate,
  requireRole('BRAND'),
  campaignController.getBrandCampaigns
);

// Create campaign
router.post('/create',
  authenticate,
  requireRole('BRAND'),
  campaignController.createCampaign
);

// Update campaign
router.put('/:id',
  authenticate,
  requireRole('BRAND'),
  campaignController.updateCampaign
);

// Delete campaign
router.delete('/:id',
  authenticate,
  requireRole('BRAND'),
  campaignController.deleteCampaign
);

// Campaign applications
router.get('/:id/applications',
  authenticate,
  requireRole('BRAND'),
  campaignController.getCampaignApplications
);

// Review application
router.patch('/:id/applications/:appId',
  authenticate,
  requireRole('BRAND'),
  campaignController.reviewApplication
);

// ✅ Invite influencer
router.post('/:id/invite',
  authenticate,
  requireRole('BRAND'),
  campaignController.inviteInfluencer
);

// ✅ Get campaign invites
router.get('/:id/invites',
  authenticate,
  requireRole('BRAND'),
  campaignController.getCampaignInvites
);

export default router;