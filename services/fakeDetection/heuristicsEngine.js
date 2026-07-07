// src/services/heuristics.engine.js
// Pure scoring logic — no DB, no API calls. Takes raw platform data, returns signals.

// ─── Signal weights (must sum to 100) ────────────────────────────────────────
export const SIGNAL_WEIGHTS = {
  engagementRate:        25,  // Most reliable signal
  followerFollowingRatio:15,  // High following vs followers = suspicious
  likeCommentRatio:      12,  // Fake likes rarely come with comments
  postingConsistency:    10,  // Ghost accounts → sudden spikes
  audienceGrowthPattern:  8,  // Bought followers → unnatural spikes
  accountCompleteness:    8,  // Bio, profile pic, posts present?
  commentQuality:         7,  // Generic "nice post!" = bot indicator
  recentActivityRate:     6,  // Inactive accounts in followers
  viewToFollowerRatio:    5,  // YouTube/Reels — views vs subs
  locationConsistency:    4,  // Indian influencer with 80% US followers?
};

// ─── Engagement rate benchmarks by follower tier (Indian market) ─────────────
const ER_BENCHMARKS = {
  nano:   { min: 0,        max: 10_000,     goodER: 6.0,  avgER: 3.5 },
  micro:  { min: 10_000,   max: 100_000,    goodER: 4.5,  avgER: 2.5 },
  mid:    { min: 100_000,  max: 500_000,    goodER: 2.5,  avgER: 1.5 },
  macro:  { min: 500_000,  max: 1_000_000,  goodER: 1.8,  avgER: 1.0 },
  mega:   { min: 1_000_000,max: Infinity,   goodER: 1.2,  avgER: 0.7 },
};

function getTier(followers) {
  return Object.values(ER_BENCHMARKS).find(
    (t) => followers >= t.min && followers < t.max
  ) ?? ER_BENCHMARKS.mega;
}

// ─── Core signal calculators ──────────────────────────────────────────────────

/**
 * Signal 1: Engagement Rate
 * Low ER relative to follower tier = likely fake followers diluting engagement
 */
export function scoreEngagementRate({ followers, avgLikes, avgComments, avgViews = 0, platform }) {
  if (!followers || followers === 0) return { score: 50, detail: 'No follower data' };

  const tier = getTier(followers);
  let er;

  if (platform === 'youtube') {
    // YouTube: (likes + comments) / views * 100
    er = avgViews > 0 ? ((avgLikes + avgComments) / avgViews) * 100 : 0;
    // YouTube ER benchmark ~4–8% of views
    const ytGood = 6, ytAvg = 3;
    if (er >= ytGood) return { score: 5,  detail: `Strong ER ${er.toFixed(1)}% (YT avg ~${ytAvg}%)` };
    if (er >= ytAvg)  return { score: 25, detail: `Average ER ${er.toFixed(1)}%` };
    if (er >= 1)      return { score: 55, detail: `Below avg ER ${er.toFixed(1)}%` };
    return              { score: 80, detail: `Very low ER ${er.toFixed(1)}% — suspicious` };
  }

  er = ((avgLikes + avgComments) / followers) * 100;

  if (er >= tier.goodER) return { score: 5,  detail: `Excellent ER ${er.toFixed(2)}% (benchmark >${tier.goodER}%)` };
  if (er >= tier.avgER)  return { score: 20, detail: `Average ER ${er.toFixed(2)}%` };
  if (er >= tier.avgER / 2) return { score: 55, detail: `Below avg ER ${er.toFixed(2)}% vs ${tier.avgER}% expected` };
  return                 { score: 85, detail: `Critically low ER ${er.toFixed(2)}% — strong fake signal` };
}

/**
 * Signal 2: Follower-Following Ratio
 * Real influencers follow few, are followed by many
 */
export function scoreFollowerFollowingRatio({ followers, following }) {
  if (!following || following === 0) return { score: 10, detail: 'Follows nobody — clean' };

  const ratio = followers / following;

  if (ratio >= 10)   return { score: 5,  detail: `Ratio ${ratio.toFixed(0)}:1 — healthy influencer profile` };
  if (ratio >= 3)    return { score: 20, detail: `Ratio ${ratio.toFixed(1)}:1 — acceptable` };
  if (ratio >= 1)    return { score: 45, detail: `Ratio ${ratio.toFixed(1)}:1 — follow-back pattern possible` };
  if (ratio >= 0.5)  return { score: 65, detail: `Ratio ${ratio.toFixed(2)}:1 — mass-following behavior` };
  return               { score: 85, detail: `Ratio ${ratio.toFixed(2)}:1 — aggressive follow-back farming` };
}

/**
 * Signal 3: Like-to-Comment Ratio
 * Bought likes rarely come with real comments. >100:1 ratio is suspicious.
 */
export function scoreLikeCommentRatio({ avgLikes, avgComments }) {
  if (!avgComments || avgComments === 0) {
    return avgLikes > 0
      ? { score: 75, detail: 'Zero comments with likes — strong bot signal' }
      : { score: 30, detail: 'No engagement data' };
  }

  const ratio = avgLikes / avgComments;

  if (ratio <= 20)   return { score: 5,  detail: `Like:comment ratio ${ratio.toFixed(0)}:1 — very healthy` };
  if (ratio <= 50)   return { score: 15, detail: `Ratio ${ratio.toFixed(0)}:1 — normal` };
  if (ratio <= 100)  return { score: 35, detail: `Ratio ${ratio.toFixed(0)}:1 — slightly elevated` };
  if (ratio <= 200)  return { score: 65, detail: `Ratio ${ratio.toFixed(0)}:1 — suspicious, possible bought likes` };
  return               { score: 90, detail: `Ratio ${ratio.toFixed(0)}:1 — almost certainly purchased likes` };
}

/**
 * Signal 4: Posting Consistency
 * Inactive periods followed by sudden bursts = bought engagement campaigns
 */
export function scorePostingConsistency({ postsPerMonth, monthlyVariance = null }) {
  if (postsPerMonth == null) return { score: 30, detail: 'No posting history' };

  if (postsPerMonth === 0) return { score: 70, detail: 'No recent posts — ghost or inactive account' };
  if (postsPerMonth < 1)   return { score: 50, detail: 'Very infrequent posts (<1/month)' };
  if (postsPerMonth > 30)  return { score: 40, detail: 'Extremely high post frequency — possible spam' };

  // High variance = burst posting (engagement pod or bought campaign)
  if (monthlyVariance != null && monthlyVariance > postsPerMonth * 1.5) {
    return { score: 55, detail: 'Inconsistent posting pattern — burst activity detected' };
  }

  return { score: 10, detail: `Consistent ${postsPerMonth.toFixed(1)} posts/month` };
}

/**
 * Signal 5: Audience Growth Pattern
 * Organic growth is gradual. Spikes >30% in a month = likely purchased.
 * Pass in array of monthly follower counts.
 */
export function scoreAudienceGrowthPattern({ monthlyFollowerHistory = [] }) {
  if (monthlyFollowerHistory.length < 2) return { score: 20, detail: 'Insufficient growth history' };

  let maxSpike = 0;
  let spikeDetails = '';

  for (let i = 1; i < monthlyFollowerHistory.length; i++) {
    const prev = monthlyFollowerHistory[i - 1];
    const curr = monthlyFollowerHistory[i];
    if (prev === 0) continue;
    const growth = ((curr - prev) / prev) * 100;
    if (growth > maxSpike) {
      maxSpike = growth;
      spikeDetails = `+${growth.toFixed(0)}% in one month`;
    }
  }

  if (maxSpike <= 5)   return { score: 5,  detail: `Steady organic growth (max spike ${maxSpike.toFixed(0)}%)` };
  if (maxSpike <= 15)  return { score: 15, detail: `Normal growth spikes (max ${maxSpike.toFixed(0)}%)` };
  if (maxSpike <= 30)  return { score: 35, detail: `Elevated spike ${spikeDetails} — viral post possible` };
  if (maxSpike <= 60)  return { score: 65, detail: `Suspicious spike ${spikeDetails} — investigate` };
  return                 { score: 90, detail: `Extreme spike ${spikeDetails} — almost certainly purchased` };
}

/**
 * Signal 6: Account Completeness
 * Real influencers have complete profiles. Fake/bot accounts often don't.
 */
export function scoreAccountCompleteness({ hasBio, hasProfilePic, hasWebsite, postCount, platform }) {
  let missing = [];
  if (!hasBio)        missing.push('bio');
  if (!hasProfilePic) missing.push('profile pic');
  if (postCount < 3)  missing.push('posts');

  if (missing.length === 0) return { score: 5,  detail: 'Complete profile' };
  if (missing.length === 1) return { score: 20, detail: `Missing: ${missing.join(', ')}` };
  if (missing.length === 2) return { score: 50, detail: `Incomplete profile — missing ${missing.join(', ')}` };
  return                      { score: 80, detail: `Very incomplete profile — ${missing.join(', ')} missing` };
}

/**
 * Signal 7: Comment Quality
 * Analyze sample comments for generic/emoji-only/repetitive patterns
 */
export function scoreCommentQuality({ sampleComments = [] }) {
  if (sampleComments.length === 0) return { score: 30, detail: 'No comments to analyze' };

  const BOT_PATTERNS = [
    /^(nice|great|wow|amazing|awesome|beautiful|love this|follow me|check my|follow back|follow for follow|f4f|l4l|dm me|click link|visit my)/i,
    /^[🔥❤️👏💯✨🙌😍💪🎉]+$/,             // emoji-only
    /^.{1,4}$/,                              // too short (1–4 chars)
    /(buy followers|get followers|grow fast|increase followers)/i,
  ];

  let botCount = 0;
  for (const c of sampleComments) {
    if (BOT_PATTERNS.some((p) => p.test(c.trim()))) botCount++;
  }

  const botRatio = botCount / sampleComments.length;

  if (botRatio <= 0.1)  return { score: 5,  detail: `${(botRatio*100).toFixed(0)}% generic comments — healthy` };
  if (botRatio <= 0.25) return { score: 20, detail: `${(botRatio*100).toFixed(0)}% generic — slightly elevated` };
  if (botRatio <= 0.50) return { score: 55, detail: `${(botRatio*100).toFixed(0)}% bot-like comments` };
  return                  { score: 85, detail: `${(botRatio*100).toFixed(0)}% comments look automated` };
}

/**
 * Signal 8: Recent Activity Rate
 * Check if engagement is coming from recently active accounts
 * (estimated via ratio of recent posts that still get engagement)
 */
export function scoreRecentActivityRate({ avgEngagementDecayRatio = null }) {
  // decay ratio: recent 5 posts avg ER / older 5 posts avg ER
  // If recent posts perform much worse → follower base is inactive/bought
  if (avgEngagementDecayRatio == null) return { score: 20, detail: 'No decay data available' };

  if (avgEngagementDecayRatio >= 0.8) return { score: 5,  detail: 'Consistent engagement over time — organic audience' };
  if (avgEngagementDecayRatio >= 0.6) return { score: 20, detail: 'Slight engagement decay — normal' };
  if (avgEngagementDecayRatio >= 0.4) return { score: 50, detail: 'Significant decay — audience becoming inactive' };
  return                                { score: 80, detail: 'Severe engagement decay — likely fake followers aging out' };
}

/**
 * Signal 9: View-to-Follower Ratio (YouTube / Reels)
 */
export function scoreViewToFollowerRatio({ avgViews, followers, platform }) {
  if (!avgViews || !followers) return { score: 20, detail: 'No view data' };

  const ratio = avgViews / followers;

  if (platform === 'youtube') {
    if (ratio >= 0.15) return { score: 5,  detail: `${(ratio*100).toFixed(0)}% view rate — excellent` };
    if (ratio >= 0.05) return { score: 15, detail: `${(ratio*100).toFixed(0)}% view rate — good` };
    if (ratio >= 0.01) return { score: 45, detail: `${(ratio*100).toFixed(0)}% view rate — below avg` };
    return               { score: 80, detail: `${(ratio*100).toFixed(0)}% view rate — sub count may be inflated` };
  }

  // Instagram Reels
  if (ratio >= 0.3)  return { score: 5,  detail: `${(ratio*100).toFixed(0)}% reel view rate — strong` };
  if (ratio >= 0.1)  return { score: 20, detail: `${(ratio*100).toFixed(0)}% reel view rate — ok` };
  if (ratio >= 0.03) return { score: 50, detail: `${(ratio*100).toFixed(0)}% reel view rate — low` };
  return               { score: 75, detail: `${(ratio*100).toFixed(0)}% reel view rate — suspicious` };
}

/**
 * Signal 10: Location Consistency
 * Indian influencer with mostly non-Indian audience = suspicious
 */
export function scoreLocationConsistency({ influencerCountry = 'IN', topAudienceCountry = null, indianAudiencePercent = null }) {
  if (!topAudienceCountry && indianAudiencePercent == null) {
    return { score: 15, detail: 'No audience location data' };
  }

  if (influencerCountry === 'IN' && indianAudiencePercent != null) {
    if (indianAudiencePercent >= 50) return { score: 5,  detail: `${indianAudiencePercent}% Indian audience — consistent` };
    if (indianAudiencePercent >= 25) return { score: 25, detail: `${indianAudiencePercent}% Indian audience — somewhat consistent` };
    return                             { score: 65, detail: `Only ${indianAudiencePercent}% Indian audience — location mismatch` };
  }

  return { score: 15, detail: 'Location data partially available' };
}

// ─── Composite scorer ─────────────────────────────────────────────────────────
export function computeFakeScore(signals) {
  // signals: { signalName: { score: 0-100, detail: string } }
  let weightedSum  = 0;
  let totalWeight  = 0;
  const breakdown  = [];

  for (const [name, weight] of Object.entries(SIGNAL_WEIGHTS)) {
    const result = signals[name];
    if (!result) continue;
    weightedSum += result.score * weight;
    totalWeight += weight;
    breakdown.push({ name, weight, score: result.score, detail: result.detail });
  }

  const fakeScore = totalWeight > 0 ? weightedSum / totalWeight : 0;
  return { fakeScore: Math.min(100, Math.round(fakeScore)), breakdown };
}

// ─── Risk level classifier ────────────────────────────────────────────────────
export function classifyRisk(fakeScore) {
  if (fakeScore <= 20) return 'LOW';
  if (fakeScore <= 45) return 'MEDIUM';
  if (fakeScore <= 70) return 'HIGH';
  return 'CRITICAL';
}

// ─── Flag extractor ───────────────────────────────────────────────────────────
export function extractFlags(breakdown) {
  const flags = [];
  for (const s of breakdown) {
    if (s.score >= 55) {
      const FLAG_MAP = {
        engagementRate:         'low_engagement_rate',
        followerFollowingRatio: 'mass_following',
        likeCommentRatio:       'suspicious_like_comment_ratio',
        postingConsistency:     'inconsistent_posting',
        audienceGrowthPattern:  'unnatural_growth_spike',
        accountCompleteness:    'incomplete_profile',
        commentQuality:         'bot_comments_detected',
        recentActivityRate:     'decaying_engagement',
        viewToFollowerRatio:    'low_view_rate',
        locationConsistency:    'audience_location_mismatch',
      };
      if (FLAG_MAP[s.name]) flags.push(FLAG_MAP[s.name]);
    }
  }
  return flags;
}

// ─── Verdict generator ────────────────────────────────────────────────────────
export function generateVerdict(fakeScore, riskLevel, flags, platform) {
  const pct = 100 - fakeScore;
  const riskLabels = {
    LOW:      `This ${platform} account appears authentic with ${pct}% authenticity score. Safe to proceed with brand deals.`,
    MEDIUM:   `Moderate risk detected. ${fakeScore}% fake score suggests some inauthentic activity. Request engagement proof before hiring.`,
    HIGH:     `High risk account. Multiple signals (${flags.slice(0,3).join(', ')}) indicate significant fake followers. Proceed only with caution.`,
    CRITICAL: `CRITICAL: This account likely has purchased followers/engagement. Fake score ${fakeScore}/100. Do not hire without manual verification.`,
  };
  return riskLabels[riskLevel];
}