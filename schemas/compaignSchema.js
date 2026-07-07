// src/validators/campaign.validator.js

import { z } from 'zod';

// ─── Base shape (no refinements) ─────────────────────────────────────────────
const campaignShape = z.object({
  title: z.string().min(5, 'Title at least 5 characters').max(100),
  description: z.string().min(20, 'Description at least 20 characters').max(2000),
  type: z.enum(['PAID_POST', 'STORY', 'REEL', 'YOUTUBE', 'TIKTOK', 'MULTI_PLATFORM']),

  budgetMin: z.number().positive('Budget must be positive'),
  budgetMax: z.number().positive(),
  currency: z.string().default('USD'),

  minFollowers: z.number().int().min(100).default(1000),
  maxFollowers: z.number().int().optional(),
  platforms: z.array(z.enum(['instagram', 'facebook', 'youtube', 'tiktok'])).min(1),
  niche: z.array(z.string()).min(1, 'At least one niche required'),
  targetLocations: z.array(z.string()).optional().default([]),
  minEngagementRate: z.number().min(0).max(100).optional(),

  deliverables: z.string().min(1),
  contentGuidelines: z.string().optional(),
  hashtags: z.array(z.string()).optional().default([]),
  brandMentions: z.array(z.string()).optional().default([]),

  applicationDeadline: z.string().datetime(),
  campaignStartDate: z.string().datetime(),
  campaignEndDate: z.string().datetime(),

  maxInfluencers: z.number().int().min(1).default(1),
  briefFileUrl: z.string().url().optional(),
});

// ─── Refinement helper (reused for create & update) ──────────────────────────
const addDateBudgetRefinements = (schema) =>
  schema
    .refine(d => !d.budgetMin || !d.budgetMax || d.budgetMin <= d.budgetMax, {
      message: 'budgetMin cannot exceed budgetMax',
      path: ['budgetMin'],
    })
    .refine(
      d =>
        !d.applicationDeadline ||
        !d.campaignStartDate ||
        new Date(d.applicationDeadline) < new Date(d.campaignStartDate),
      {
        message: 'Application deadline must be before campaign start',
        path: ['applicationDeadline'],
      }
    )
    .refine(
      d =>
        !d.campaignStartDate ||
        !d.campaignEndDate ||
        new Date(d.campaignStartDate) < new Date(d.campaignEndDate),
      {
        message: 'Start date must be before end date',
        path: ['campaignStartDate'],
      }
    );

// ─── Schemas ─────────────────────────────────────────────────────────────────
export const createCampaignSchema = addDateBudgetRefinements(campaignShape);

export const updateCampaignSchema = addDateBudgetRefinements(
  campaignShape.partial().extend({
    status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED']).optional(),
  })
);

export const applyToCampaignSchema = z.object({
  proposedRate: z.number().positive().optional(),
  coverLetter: z.string().min(50, 'Cover letter min 50 characters').max(1000).optional(),
  portfolioUrls: z.array(z.string().url()).optional().default([]),
});

export const updateApplicationSchema = z.object({
  status: z.enum(['SHORTLISTED', 'REJECTED', 'HIRED']),
  brandNote: z.string().max(500).optional(),
});

export const listCampaignsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED']).optional(),
  type: z.enum(['PAID_POST', 'STORY', 'REEL', 'YOUTUBE', 'TIKTOK', 'MULTI_PLATFORM']).optional(),
  platform: z.enum(['instagram', 'facebook', 'youtube', 'tiktok']).optional(),
  minBudget: z.coerce.number().optional(),
  maxBudget: z.coerce.number().optional(),
  niche: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'budgetMax', 'applicationDeadline']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});