import * as searchService from '../services/searchService.js';
import { searchSchema } from '../schemas/searchSchema.js';
export const search = async (req, res) => {
  const filters = searchSchema.parse(req.query);
  const results = await searchService.searchInfluencers(filters);
  res.json({ success: true, data: results, count: results.length });
};

export const toggleSave = async (req, res) => {
  const { influencerId } = req.params;
  const result = await searchService.toggleSaveInfluencer(req.user.id, influencerId);
  res.json({ success: true, data: result });
};

export const getSaved = async (req, res) => {
  const saved = await searchService.getSavedInfluencers(req.user.id);
  res.json({ success: true, data: saved });
};