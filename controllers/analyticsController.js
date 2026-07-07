import * as analyticsService from '../services/analyticsService.js';

// Brand
export const getBrandOverview = async (req, res) => {
  const data = await analyticsService.getBrandOverview(req.user.id);
  res.json({ success: true, data });
};

export const getBrandSpendTrend = async (req, res) => {
  const months = Number(req.query.months) || 6;
  const data = await analyticsService.getBrandSpendTrend(req.user.id, months);
  res.json({ success: true, data });
};

export const getBrandTopInfluencers = async (req, res) => {
  const limit = Number(req.query.limit) || 10;
  const data = await analyticsService.getBrandTopInfluencers(req.user.id, limit);
  res.json({ success: true, data });
};

// Influencer
export const getInfluencerOverview = async (req, res) => {
  const data = await analyticsService.getInfluencerOverview(req.user.id);
  res.json({ success: true, data });
};

export const getInfluencerEarningsTrend = async (req, res) => {
  const months = Number(req.query.months) || 6;
  const data = await analyticsService.getInfluencerEarningsTrend(req.user.id, months);
  res.json({ success: true, data });
};

export const getInfluencerCampaignHistory = async (req, res) => {
  const data = await analyticsService.getInfluencerCampaignHistory(req.user.id, req.query);
  res.json({ success: true, ...data });
};