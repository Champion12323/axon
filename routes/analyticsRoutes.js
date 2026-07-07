import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/authenticate.js';
import * as analyticsController from '../controllers/analyticsController.js';

const router = Router();
router.use(authenticate);

// Brand routes
router.get('/brand/overview',          requireRole('BRAND'), analyticsController.getBrandOverview);
router.get('/brand/spend-trend',       requireRole('BRAND'), analyticsController.getBrandSpendTrend);
router.get('/brand/top-influencers',   requireRole('BRAND'), analyticsController.getBrandTopInfluencers);

// Influencer routes
router.get('/influencer/overview',     requireRole('INFLUENCER'), analyticsController.getInfluencerOverview);
router.get('/influencer/earnings-trend', requireRole('INFLUENCER'), analyticsController.getInfluencerEarningsTrend);
router.get('/influencer/campaigns',    requireRole('INFLUENCER'), analyticsController.getInfluencerCampaignHistory);

export default router;