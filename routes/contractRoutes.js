import express from 'express';
import * as contractController from '../controllers/contractController.js';
import { authenticate } from '../middleware/authenticate.js';
 
const router = express.Router();
 
// ── Both roles ───────────────────────────────────────────────
 
// My contracts list
router.get(
  '/',
  authenticate,
  contractController.getMyContracts
);
 
// Single contract detail
router.get(
  '/:id',
  authenticate,
  contractController.getContractById
);
 
// Cancel contract (both can cancel)
router.patch(
  '/:id/cancel',
  authenticate,
  contractController.cancelContract
);
 
// Raise dispute (both can raise)
router.patch(
  '/:id/dispute',
  authenticate,
  contractController.raiseDispute
);
 
// ── Brand only ───────────────────────────────────────────────
 
// Create contract
router.post(
  '/',
  authenticate,
  authorize('BRAND'),
  contractController.createContract
);
 
// Send contract to influencer
router.patch(
  '/:id/send',
  authenticate,
  authorize('BRAND'),
  contractController.sendContract
);
 
// Respond to negotiation
router.patch(
  '/:id/negotiate/respond',
  authenticate,
  authorize('BRAND'),
  contractController.respondToNegotiation
);
 
// Review milestone (approve / request revision)
router.patch(
  '/milestones/:milestoneId/review',
  authenticate,
  authorize('BRAND'),
  contractController.reviewMilestone
);
 
// ── Influencer only ──────────────────────────────────────────
 
// Accept contract
router.patch(
  '/:id/accept',
  authenticate,
  authorize('INFLUENCER'),
  contractController.acceptContract
);
 
// Negotiate contract
router.patch(
  '/:id/negotiate',
  authenticate,
  authorize('INFLUENCER'),
  contractController.negotiateContract
);
 
// Submit milestone work
router.patch(
  '/milestones/:milestoneId/submit',
  authenticate,
  authorize('INFLUENCER'),
  contractController.submitMilestone
);
 
export default router;