// src/services/audit.service.js
import  prisma  from '../../config/prisma.js';
import {
  scoreEngagementRate, scoreFollowerFollowingRatio, scoreLikeCommentRatio,
  scorePostingConsistency, scoreAudienceGrowthPattern, scoreAccountCompleteness,
  scoreCommentQuality, scoreRecentActivityRate, scoreViewToFollowerRatio,
  scoreLocationConsistency, computeFakeScore, classifyRisk,
  extractFlags, generateVerdict,
} from './heuristicsEngine.js';

// ─── 1. Run full audit for an influencer ─────────────────────────────────────
export async function runAudit(influencerId, triggeredBy = null) {
  // Create audit record
  const audit = await prisma.influencerAudit.create({
    data: { influencerId, platform: 'all', status: 'PROCESSING', triggeredBy },
  });

  try {
    // Pull all connected platform data from DB
    const [igAccount, ytAccount, twAccount] = await Promise.all([
      prisma.instagramAccount?.findUnique({ where: { influencerId } }).catch(() => null),
      prisma.youtubeAccount?.findUnique({
        where: { influencerId },
        include: { videos: { orderBy: { publishedAt: 'desc' }, take: 20 } },
      }).catch(() => null),
      prisma.twitterAccount?.findUnique({ where: { influencerId } }).catch(() => null),
    ]);

    const platformResults = {};
    const allSignalSets   = [];

    // ── Instagram audit ───────────────────────────────────────────────────────
    if (igAccount) {
      const ig = auditInstagram(igAccount);
      platformResults.instagram = ig;
      allSignalSets.push({ platform: 'instagram', weight: 0.4, ...ig });
    }

    // ── YouTube audit ─────────────────────────────────────────────────────────
    if (ytAccount) {
      const yt = auditYoutube(ytAccount);
      platformResults.youtube = yt;
      allSignalSets.push({ platform: 'youtube', weight: 0.35, ...yt });
    }

    // ── Twitter/X audit ───────────────────────────────────────────────────────
    if (twAccount) {
      const tw = auditTwitter(twAccount);
      platformResults.twitter = tw;
      allSignalSets.push({ platform: 'twitter', weight: 0.25, ...tw });
    }

    // No platforms connected → pending manual review
    if (allSignalSets.length === 0) {
      await prisma.influencerAudit.update({
        where: { id: audit.id },
        data: {
          status:    'COMPLETED',
          fakeScore: 0,
          riskLevel: 'LOW',
          verdict:   'No social accounts connected yet. Connect platforms to enable audit.',
          completedAt: new Date(),
        },
      });
      return audit;
    }

    // ── Weighted average across platforms ─────────────────────────────────────
    const totalWeight   = allSignalSets.reduce((s, p) => s + p.weight, 0);
    const blendedScore  = allSignalSets.reduce((s, p) => s + p.fakeScore * p.weight, 0) / totalWeight;
    const fakeScore     = Math.round(blendedScore);
    const riskLevel     = classifyRisk(fakeScore);

    // Merge all signal breakdowns
    const allSignals    = allSignalSets.flatMap((p) =>
      (p.breakdown ?? []).map((s) => ({ ...s, platform: p.platform }))
    );
    const allFlags      = [...new Set(allSignalSets.flatMap((p) => p.flags ?? []))];
    const verdict       = generateVerdict(fakeScore, riskLevel, allFlags, 'multi-platform');

    await prisma.influencerAudit.update({
      where: { id: audit.id },
      data: {
        status:         'COMPLETED',
        fakeScore,
        riskLevel,
        authenticScore: 100 - fakeScore,
        platformResults,
        signals:        allSignals,
        flags:          allFlags,
        verdict,
        completedAt:    new Date(),
      },
    });

    return { ...audit, fakeScore, riskLevel, verdict, flags: allFlags, platformResults };
  } catch (err) {
    await prisma.influencerAudit.update({
      where: { id: audit.id },
      data: { status: 'FAILED' },
    });
    throw err;
  }
}

// ─── 2. Get latest audit for influencer ──────────────────────────────────────
export async function getLatestAudit(influencerId) {
  return prisma.influencerAudit.findFirst({
    where:   { influencerId },
    orderBy: { createdAt: 'desc' },
  });
}

// ─── 3. List audits for admin ─────────────────────────────────────────────────
export async function listAudits({ page = 1, limit = 20, riskLevel, minScore, maxScore } = {}) {
  const where = {
    status: 'COMPLETED',
    ...(riskLevel && { riskLevel }),
    ...(minScore != null && { fakeScore: { gte: minScore } }),
    ...(maxScore != null && { fakeScore: { ...((minScore != null) ? { gte: minScore } : {}), lte: maxScore } }),
  };

  const [data, total] = await Promise.all([
    prisma.influencerAudit.findMany({
      where,
      skip:    (page - 1) * limit,
      take:    limit,
      orderBy: { fakeScore: 'desc' },
      include: { influencer: { select: { id: true, name: true, email: true } } },
    }),
    prisma.influencerAudit.count({ where }),
  ]);

  return { data, total, page, pages: Math.ceil(total / limit) };
}

// ─── Platform-specific audit functions ───────────────────────────────────────

function auditInstagram(ig) {
  const signals = {
    engagementRate: scoreEngagementRate({
      followers:   ig.followers,
      avgLikes:    ig.avgLikes   ?? 0,
      avgComments: ig.avgComments ?? 0,
      platform:    'instagram',
    }),
    followerFollowingRatio: scoreFollowerFollowingRatio({
      followers: ig.followers,
      following: ig.following ?? 0,
    }),
    likeCommentRatio: scoreLikeCommentRatio({
      avgLikes:    ig.avgLikes    ?? 0,
      avgComments: ig.avgComments ?? 0,
    }),
    postingConsistency: scorePostingConsistency({
      postsPerMonth: ig.postsPerMonth ?? null,
    }),
    audienceGrowthPattern: scoreAudienceGrowthPattern({
      monthlyFollowerHistory: ig.followerHistory ?? [],
    }),
    accountCompleteness: scoreAccountCompleteness({
      hasBio:       !!(ig.bio),
      hasProfilePic:!!(ig.profilePic),
      hasWebsite:   !!(ig.website),
      postCount:    ig.mediaCount ?? 0,
      platform:     'instagram',
    }),
    commentQuality: scoreCommentQuality({
      sampleComments: ig.recentComments ?? [],
    }),
    recentActivityRate: scoreRecentActivityRate({
      avgEngagementDecayRatio: ig.engagementDecayRatio ?? null,
    }),
    viewToFollowerRatio: scoreViewToFollowerRatio({
      avgViews:  ig.avgReelViews ?? 0,
      followers: ig.followers,
      platform:  'instagram',
    }),
    locationConsistency: scoreLocationConsistency({
      influencerCountry:    ig.country ?? 'IN',
      indianAudiencePercent: ig.indianAudiencePercent ?? null,
    }),
  };

  const { fakeScore, breakdown } = computeFakeScore(signals);
  const riskLevel = classifyRisk(fakeScore);
  const flags     = extractFlags(breakdown);

  return { fakeScore, riskLevel, breakdown, flags };
}

function auditYoutube(yt) {
  const videos     = yt.videos ?? [];
  const avgViews   = videos.length ? videos.reduce((s, v) => s + Number(v.viewCount), 0) / videos.length : 0;
  const avgLikes   = videos.length ? videos.reduce((s, v) => s + v.likeCount, 0) / videos.length : 0;
  const avgComments= videos.length ? videos.reduce((s, v) => s + v.commentCount, 0) / videos.length : 0;

  // Engagement decay: compare recent 5 vs older 5
  let decayRatio = null;
  if (videos.length >= 10) {
    const recent = videos.slice(0, 5).reduce((s, v) => s + Number(v.viewCount), 0) / 5;
    const older  = videos.slice(5, 10).reduce((s, v) => s + Number(v.viewCount), 0) / 5;
    decayRatio   = older > 0 ? recent / older : null;
  }

  const signals = {
    engagementRate: scoreEngagementRate({
      followers: yt.subscribers,
      avgLikes, avgComments, avgViews,
      platform: 'youtube',
    }),
    followerFollowingRatio: { score: 5, detail: 'YouTube channels don\'t follow others — N/A' },
    likeCommentRatio: scoreLikeCommentRatio({ avgLikes, avgComments }),
    postingConsistency: scorePostingConsistency({ postsPerMonth: yt.videoCount > 0 ? yt.videoCount / 12 : 0 }),
    audienceGrowthPattern: { score: 15, detail: 'Growth history not available for YouTube' },
    accountCompleteness: scoreAccountCompleteness({
      hasBio:       !!(yt.channelTitle),
      hasProfilePic:!!(yt.channelThumb),
      hasWebsite:   false,
      postCount:    yt.videoCount,
      platform:     'youtube',
    }),
    commentQuality:      { score: 20, detail: 'YouTube comment sampling not yet implemented' },
    recentActivityRate:  scoreRecentActivityRate({ avgEngagementDecayRatio: decayRatio }),
    viewToFollowerRatio: scoreViewToFollowerRatio({ avgViews, followers: yt.subscribers, platform: 'youtube' }),
    locationConsistency: { score: 15, detail: 'YouTube audience geo not available without Analytics API' },
  };

  const { fakeScore, breakdown } = computeFakeScore(signals);
  const riskLevel = classifyRisk(fakeScore);
  const flags     = extractFlags(breakdown);

  return { fakeScore, riskLevel, breakdown, flags };
}

function auditTwitter(tw) {
  const signals = {
    engagementRate: scoreEngagementRate({
      followers:   tw.followers,
      avgLikes:    tw.avgLikes   ?? 0,
      avgComments: tw.avgReplies ?? 0,
      platform:    'twitter',
    }),
    followerFollowingRatio: scoreFollowerFollowingRatio({
      followers: tw.followers,
      following: tw.following ?? 0,
    }),
    likeCommentRatio: scoreLikeCommentRatio({
      avgLikes:    tw.avgLikes   ?? 0,
      avgComments: tw.avgReplies ?? 0,
    }),
    postingConsistency: scorePostingConsistency({ postsPerMonth: tw.tweetsPerMonth ?? null }),
    audienceGrowthPattern: scoreAudienceGrowthPattern({ monthlyFollowerHistory: tw.followerHistory ?? [] }),
    accountCompleteness: scoreAccountCompleteness({
      hasBio:       !!(tw.bio),
      hasProfilePic:!!(tw.profilePic),
      hasWebsite:   !!(tw.website),
      postCount:    tw.tweetCount ?? 0,
      platform:     'twitter',
    }),
    commentQuality:      { score: 20, detail: 'Twitter reply sampling not yet implemented' },
    recentActivityRate:  scoreRecentActivityRate({ avgEngagementDecayRatio: tw.engagementDecayRatio ?? null }),
    viewToFollowerRatio: { score: 15, detail: 'Twitter view tracking limited' },
    locationConsistency: scoreLocationConsistency({
      influencerCountry:     tw.country ?? 'IN',
      indianAudiencePercent: tw.indianAudiencePercent ?? null,
    }),
  };

  const { fakeScore, breakdown } = computeFakeScore(signals);
  const riskLevel = classifyRisk(fakeScore);
  const flags     = extractFlags(breakdown);

  return { fakeScore, riskLevel, breakdown, flags };
}