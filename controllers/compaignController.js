// src/controllers/campaign.controller.js

import * as campaignService from '../services/compaignService.js';
import {
  createCampaignSchema,
  updateCampaignSchema,
  applyToCampaignSchema,
  updateApplicationSchema,
  listCampaignsSchema,
} from '../schemas/compaignSchema.js';

// ─────────────────────────────────────────────
// BRAND — Campaigns
// ─────────────────────────────────────────────

export async function createCampaign(req, res, next) {
  try {
    const data     = createCampaignSchema.parse(req.body);
    const campaign = await campaignService.createCampaign(req.user.id, data);
    res.status(201).json({ success: true, data: campaign });
  } catch (err) { next(err); }
}

export async function updateCampaign(req, res, next) {
  try {
    const data     = updateCampaignSchema.parse(req.body);
    const campaign = await campaignService.updateCampaign(req.params.id, req.user.id, data);
    res.json({ success: true, data: campaign });
  } catch (err) { next(err); }
}

export async function deleteCampaign(req, res, next) {
  try {
    await campaignService.deleteCampaign(req.params.id, req.user.id);
    res.json({ success: true, message: 'Campaign deleted' });
  } catch (err) { next(err); }
}

export async function getBrandCampaigns(req, res, next) {
  try {
    const filters = listCampaignsSchema.parse(req.query);
    const result  = await campaignService.getBrandCampaigns(req.user.id, filters);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

export async function getCampaignApplications(req, res, next) {
  try {
    const result = await campaignService.getCampaignApplications(
      req.io, req.params.id, req.user.id, req.query
    );
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

export async function reviewApplication(req, res, next) {
  try {
    const data   = updateApplicationSchema.parse(req.body);
    // ✅ BUG FIX: req.io missing tha
    const result = await campaignService.reviewApplication(req.io, req.params.appId, req.user.id, data);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

// ─────────────────────────────────────────────
// INFLUENCER — Browse + Apply
// ─────────────────────────────────────────────

export async function listActiveCampaigns(req, res, next) {
  try {
    const filters = listCampaignsSchema.parse(req.query);
    const result  = await campaignService.listActiveCampaigns(filters);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

export async function getCampaignById(req, res, next) {
  try {
    const campaign = await campaignService.getCampaignById(
      req.params.id, req.user.id, req.user.role
    );
    res.json({ success: true, data: campaign });
  } catch (err) { next(err); }
}

export async function applyToCampaign(req, res, next) {
  try {
    const data        = applyToCampaignSchema.parse(req.body);
    const application = await campaignService.applyToCampaign(req.io, req.params.id, req.user.id, data);
    res.status(201).json({ success: true, data: application });
  } catch (err) { next(err); }
}

export async function getMyApplications(req, res, next) {
  try {
    const result = await campaignService.getInfluencerApplications(req.user.id, req.query);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

// ─────────────────────────────────────────────
// ✅ DIRECT INVITE — Brand side
// ─────────────────────────────────────────────

export async function inviteInfluencer(req, res, next) {
  try {
    const { influencerId } = req.body;
    if (!influencerId) return res.status(400).json({ success: false, message: 'influencerId required' });

    const invite = await campaignService.inviteInfluencer(
      req.io, req.params.id, req.user.id, influencerId
    );
    res.status(201).json({ success: true, data: invite });
  } catch (err) { next(err); }
}

export async function getCampaignInvites(req, res, next) {
  try {
    const invites = await campaignService.getCampaignInvites(req.params.id, req.user.id);
    res.json({ success: true, data: invites });
  } catch (err) { next(err); }
}

// ─────────────────────────────────────────────
// ✅ DIRECT INVITE — Influencer side
// ─────────────────────────────────────────────

export async function getMyInvites(req, res, next) {
  try {
    const result = await campaignService.getMyInvites(req.user.id, req.query);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

export async function acceptInvite(req, res, next) {
  try {
    const result = await campaignService.acceptInvite(req.io, req.params.inviteId, req.user.id);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function declineInvite(req, res, next) {
  try {
    const result = await campaignService.declineInvite(req.io, req.params.inviteId, req.user.id);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}