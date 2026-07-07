// src/modules/admin/admin.routes.js
import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/authenticate.js';
import * as s from './adminService.js';

const router = Router();
router.use(authenticate, requireRole('ADMIN'));

router.get('/overview',                    async (req, res) => res.json({ success: true, data: await s.getOverview() }));
router.get('/users',                       async (req, res) => res.json({ success: true, ...(await s.getUsers(req.query)) }));
router.patch('/users/:id/suspend',         async (req, res) => res.json({ success: true, data: await s.suspendUser(req.params.id) }));
router.patch('/users/:id/verify',          async (req, res) => res.json({ success: true, data: await s.verifyUser(req.params.id) }));
router.get('/campaigns',                   async (req, res) => res.json({ success: true, ...(await s.getCampaigns(req.query)) }));
router.patch('/campaigns/:id/approve',     async (req, res) => res.json({ success: true, data: await s.approveCampaign(req.params.id) }));
router.patch('/campaigns/:id/reject',      async (req, res) => res.json({ success: true, data: await s.rejectCampaign(req.params.id) }));
router.get('/disputes',                    async (req, res) => res.json({ success: true, ...(await s.getDisputes(req.query)) }));
router.patch('/disputes/:id/resolve',      async (req, res) => res.json({ success: true, data: await s.resolveDispute(req.params.id, req.body.resolution) }));
router.get('/revenue/overview',            async (req, res) => res.json({ success: true, data: await s.getRevenueOverview() }));
router.get('/revenue/monthly',             async (req, res) => res.json({ success: true, data: await s.getMonthlyRevenue() }));

export default router;