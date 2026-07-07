// src/routes/audit.routes.js
import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/authenticate.js';
import * as audit from '../../controllers/fakeDetection/auditController.js';

const router = Router();

// Influencer — see own audit result
router.get('/me', authenticate, requireRole('INFLUENCER'), audit.getMyAudit);

// Brand — view an influencer's audit before hiring
router.get('/:influencerId', authenticate, requireRole('BRAND'), audit.getInfluencerAudit);

// Brand or Admin — trigger a fresh audit
router.post('/run/:influencerId', authenticate, audit.triggerAudit);

// Admin — list all audits, filter by risk
router.get('/admin/list', authenticate, requireRole('ADMIN'), audit.listAudits);

export default router;

