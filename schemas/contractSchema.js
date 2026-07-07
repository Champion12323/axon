// src/validators/contract.validator.js

import { z } from 'zod';

export const createContractSchema = z.object({
  applicationId:   z.string().uuid('Invalid application ID'),
  title:           z.string().min(5).max(150),
  scope:           z.string().min(20).max(3000),
  totalAmount:     z.number().positive('Amount must be positive'),
  currency:        z.string().default('INR'),
  startDate:       z.string().datetime(),
  endDate:         z.string().datetime(),
  revisionLimit:   z.number().int().min(1).max(10).default(2),
  contentRights:   z.string().max(500).optional(),
  exclusivity:     z.boolean().default(false),
  exclusivityDays: z.number().int().min(1).optional(),

  milestones: z.array(z.object({
    title:       z.string().min(3).max(150),
    description: z.string().min(10).max(1000),
    amount:      z.number().positive(),
    dueDate:     z.string().datetime(),
    order:       z.number().int().min(1),
  })).min(1, 'At least one milestone required'),

}).refine(d => new Date(d.startDate) < new Date(d.endDate), {
  message: 'Start date must be before end date',
  path: ['startDate'],
}).refine(d => {
  const total = d.milestones.reduce((s, m) => s + m.amount, 0);
  return Math.abs(total - d.totalAmount) < 1; // Allow 1 rupee rounding difference
}, {
  message: 'Milestone amounts must add up to total contract amount',
  path: ['milestones'],
});

export const negotiateContractSchema = z.object({
  negotiationNotes: z.string().min(10, 'Please explain what changes you need').max(1000),
});

export const brandRespondSchema = z.object({
  action:        z.enum(['ACCEPT_NEGOTIATION', 'REJECT_NEGOTIATION', 'UPDATE_AND_RESEND']),
  brandResponse: z.string().max(1000).optional(),

  // If UPDATE_AND_RESEND — brand can update these fields
  totalAmount:   z.number().positive().optional(),
  milestones:    z.array(z.object({
    id:          z.string().uuid().optional(), // existing milestone ID
    title:       z.string().min(3).max(150),
    description: z.string().min(10).max(1000),
    amount:      z.number().positive(),
    dueDate:     z.string().datetime(),
    order:       z.number().int().min(1),
  })).optional(),
});

export const submitMilestoneSchema = z.object({
  submissionNote: z.string().max(1000).optional(),
  submissionUrls: z.array(z.string().url('Invalid URL')).min(1, 'At least one submission URL required'),
});

export const reviewMilestoneSchema = z.object({
  action:       z.enum(['APPROVE', 'REQUEST_REVISION']),
  revisionNote: z.string().min(10).max(1000).optional(),
}).refine(d => {
  if (d.action === 'REQUEST_REVISION' && !d.revisionNote) {
    return false;
  }
  return true;
}, {
  message: 'Revision note required when requesting revision',
  path: ['revisionNote'],
});

export const cancelContractSchema = z.object({
  cancelReason: z.string().min(10, 'Please provide a reason').max(500),
});

export const disputeContractSchema = z.object({
  disputeReason: z.string().min(20, 'Please describe the dispute in detail').max(1000),
});