import prisma from '../config/prisma.js';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Step 1 — Hard filters (SQL level)
function buildWhereClause(filters) {
  const where = {};

  if (filters.niches?.length) {
    where.niches = { hasSome: filters.niches };
  }
  if (filters.minFollowers || filters.maxFollowers) {
    where.followerCount = {};
    if (filters.minFollowers) where.followerCount.gte = filters.minFollowers;
    if (filters.maxFollowers) where.followerCount.lte = filters.maxFollowers;
  }
  if (filters.minEngagement) {
    where.engagementRate = { gte: filters.minEngagement };
  }
  if (filters.maxBudget) {
    where.pricePerPost = { lte: filters.maxBudget };
  }
  if (filters.location) {
    where.location = { contains: filters.location, mode: 'insensitive' };
  }

  return where;
}

// Step 2 — Weighted scoring
function calculateScore(influencer, filters) {
  let score = 0;

  // Niche match → 30 pts
  if (filters.niches?.length) {
    const matched = influencer.niches.filter(n => filters.niches.includes(n)).length;
    score += (matched / filters.niches.length) * 30;
  } else {
    score += 15; // no niche filter = neutral
  }

  // Engagement rate → 25 pts (above 5% = full marks)
  score += Math.min((influencer.engagementRate / 5) * 25, 25);

  // Follower range fit → 20 pts
  if (filters.minFollowers && filters.maxFollowers) {
    const mid = (filters.minFollowers + filters.maxFollowers) / 2;
    const distance = Math.abs(influencer.followerCount - mid) / mid;
    score += Math.max(0, 20 - distance * 20);
  } else {
    score += 10;
  }

  // Location match → 15 pts
  if (filters.location && influencer.location?.toLowerCase().includes(filters.location.toLowerCase())) {
    score += 15;
  } else if (!filters.location) {
    score += 10;
  }

  // Verified bonus → 10 pts
  if (influencer.isVerified) score += 10;

  return Math.round(Math.min(score, 100));
}

// Step 3 — Semantic search via pgvector
async function getQueryEmbedding(text) {
  const res = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return res.data[0].embedding;
}

// Main search function
export const searchInfluencers = async (filters) => {
  const { query, sortBy, page, limit } = filters;
  const skip = (page - 1) * limit;
  const where = buildWhereClause(filters);

  // Semantic search path — query is long (campaign brief)
  if (query && query.length > 15) {
    const embedding = await getQueryEmbedding(query);
    const vectorStr = `[${embedding.join(',')}]`;

    // pgvector cosine similarity — raw query (Prisma doesn't support vector ops natively)
    const results = await prisma.$queryRaw`
      SELECT 
        ip.*,
        u.name,
        u.avatar,
        (1 - (ip.embedding <=> ${vectorStr}::vector)) AS similarity
      FROM "InfluencerProfile" ip
      JOIN "User" u ON u.id = ip."userId"
      WHERE ip.embedding IS NOT NULL
        AND (${where.niches ? true : false} = false OR ip.niches && ${where.niches ?? []}::text[])
        AND (${where.followerCount?.gte ?? 0} = 0 OR ip."followerCount" >= ${where.followerCount?.gte ?? 0})
        AND (${where.followerCount?.lte ?? 0} = 0 OR ip."followerCount" <= ${where.followerCount?.lte ?? 9999999})
        AND (${where.engagementRate?.gte ?? 0} = 0 OR ip."engagementRate" >= ${where.engagementRate?.gte ?? 0})
        AND (${where.pricePerPost?.lte ?? 0} = 0 OR ip."pricePerPost" <= ${where.pricePerPost?.lte ?? 9999999})
      ORDER BY similarity DESC
      LIMIT ${limit} OFFSET ${skip}
    `;

    return results.map(r => ({
      ...r,
      matchScore: Math.round(r.similarity * 100),
      searchType: 'semantic',
    }));
  }

  // Filter + scoring path
  const influencers = await prisma.influencerProfile.findMany({
    where,
    include: { user: { select: { id: true, name: true, avatar: true } } },
    skip,
    take: limit,
  });

  const scored = influencers.map(inf => ({
    ...inf,
    matchScore: calculateScore(inf, filters),
    searchType: 'scored',
  }));

  // Sort
  if (sortBy === 'match') scored.sort((a, b) => b.matchScore - a.matchScore);
  else if (sortBy === 'engagement') scored.sort((a, b) => b.engagementRate - a.engagementRate);
  else if (sortBy === 'followers') scored.sort((a, b) => b.followerCount - a.followerCount);
  else if (sortBy === 'price') scored.sort((a, b) => (a.pricePerPost ?? 0) - (b.pricePerPost ?? 0));

  return scored;
};

// Save / unsave influencer
export const toggleSaveInfluencer = async (brandId, influencerId) => {
  const existing = await prisma.savedInfluencer.findUnique({
    where: { brandId_influencerId: { brandId, influencerId } },
  });

  if (existing) {
    await prisma.savedInfluencer.delete({ where: { id: existing.id } });
    return { saved: false };
  }

  await prisma.savedInfluencer.create({ data: { brandId, influencerId } });
  return { saved: true };
};

export const getSavedInfluencers = async (brandId) => {
  return prisma.savedInfluencer.findMany({
    where: { brandId },
    include: {
      influencer: {
        include: { user: { select: { id: true, name: true, avatar: true } } },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

// Embedding generate + store karo (jab influencer profile update ho)
export const updateInfluencerEmbedding = async (influencerId) => {
  const profile = await prisma.influencerProfile.findUnique({
    where: { id: influencerId },
    include: { user: { select: { name: true } } },
  });

  if (!profile) return;

  // Bio + niches + name ko combine karo for embedding
  const text = [
    profile.user.name,
    profile.bio ?? '',
    profile.niches.join(', '),
    profile.location ?? '',
  ].join('. ');

  const embedding = await getQueryEmbedding(text);
  const vectorStr = `[${embedding.join(',')}]`;

  await prisma.$executeRaw`
    UPDATE "InfluencerProfile"
    SET embedding = ${vectorStr}::vector
    WHERE id = ${influencerId}
  `;
};