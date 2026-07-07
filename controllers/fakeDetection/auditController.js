// src/controllers/audit.controller.js
import * as auditService from '../../services/fakeDetection/auditService.js';

// POST /api/audit/run/:influencerId  (brand or admin triggers)
export async function triggerAudit(req, res, next) {
  try {
    const { influencerId } = req.params;
    const data = await auditService.runAudit(influencerId, req.user.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

// GET /api/audit/me  (influencer sees own audit)
export async function getMyAudit(req, res, next) {
  try {
    const data = await auditService.getLatestAudit(req.user.id);
    res.json({ success: true, data: data ?? null });
  } catch (err) { next(err); }
}

// GET /api/audit/:influencerId  (brand views influencer audit before hiring)
export async function getInfluencerAudit(req, res, next) {
  try {
    const data = await auditService.getLatestAudit(req.params.influencerId);
    res.json({ success: true, data: data ?? null });
  } catch (err) { next(err); }
}

// GET /api/admin/audit?riskLevel=HIGH&page=1
export async function listAudits(req, res, next) {
  try {
    const { page = 1, limit = 20, riskLevel, minScore, maxScore } = req.query;
    const data = await auditService.listAudits({
      page: Number(page), limit: Number(limit),
      riskLevel,
      minScore: minScore != null ? Number(minScore) : undefined,
      maxScore: maxScore != null ? Number(maxScore) : undefined,
    });
    res.json({ success: true, ...data });
  } catch (err) { next(err); }
}