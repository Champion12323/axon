"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Check,
  ChevronRight,
  Clock3,
  DollarSign,
  Lightbulb,
  Play,
  Search,
  Sparkles,
  Star,
  TrendingUp,
  Trophy,
  Users,
  X,
  Zap,
} from "lucide-react";
 import { FaFacebook, FaInstagram, FaYoutube} from "react-icons/fa";
 import Navbar from "../ui/Navbar";
 import JoinModal from "../ui/JoinModal";

type Platform = "all" | "instagram" | "youtube" | "facebook";
type CampaignFilter = "recommended" | "highest" | "new" | "quick";

type Campaign = {
  id: number;
  brand: string;
  title: string;
  category: string;
  platform: string;
  reward: number;
  deliverables: string;
  deadline: string;
  match: number;
  badge: string;
  gradient: string;
  description: string;
};

const campaigns: Campaign[] = [
  {
    id: 1,
    brand: "UrbanX",
    title: "Summer Streetwear",
    category: "Fashion",
    platform: "Instagram Reels",
    reward: 25000,
    deliverables: "3 Reels",
    deadline: "14 days",
    match: 96,
    badge: "BEST MATCH",
    gradient: "from-cyan-400 via-blue-500 to-indigo-600",
    description:
      "Create authentic summer streetwear content showing how your audience can style everyday looks.",
  },
  {
    id: 2,
    brand: "FitFuel",
    title: "30 Day Fitness Challenge",
    category: "Fitness",
    platform: "Instagram + YouTube",
    reward: 18000,
    deliverables: "4 Videos",
    deadline: "21 days",
    match: 91,
    badge: "TRENDING",
    gradient: "from-lime-300 via-green-400 to-emerald-600",
    description:
      "Document your fitness journey and introduce your audience to the FitFuel challenge.",
  },
  {
    id: 3,
    brand: "TechVerse",
    title: "Next Gen Tech",
    category: "Technology",
    platform: "YouTube Shorts",
    reward: 35000,
    deliverables: "5 Shorts",
    deadline: "18 days",
    match: 89,
    badge: "HIGH VALUE",
    gradient: "from-violet-400 via-purple-500 to-fuchsia-600",
    description:
      "Turn exciting technology products into short-form videos designed for high retention.",
  },
  {
    id: 4,
    brand: "TravelLoop",
    title: "Hidden India",
    category: "Travel",
    platform: "Instagram",
    reward: 12000,
    deliverables: "2 Reels",
    deadline: "10 days",
    match: 86,
    badge: "QUICK START",
    gradient: "from-orange-300 via-orange-500 to-red-600",
    description:
      "Show your audience unique Indian destinations and create inspiring travel stories.",
  },
];

const analytics = {
  all: {
    followers: "284K",
    followersGrowth: "+8.4%",
    reach: "3.8M",
    reachGrowth: "+21%",
    engagement: "8.7%",
    engagementGrowth: "+12%",
    views: "5.2M",
    viewsGrowth: "+34%",
    chart: [42, 58, 48, 70, 63, 82, 96],
    best: "Short-form storytelling",
    insight:
      "Your YouTube Shorts are growing 2.4× faster than your Instagram Reels.",
  },
  instagram: {
    followers: "192K",
    followersGrowth: "+7.8%",
    reach: "2.1M",
    reachGrowth: "+18%",
    engagement: "9.4%",
    engagementGrowth: "+14%",
    views: "2.8M",
    viewsGrowth: "+28%",
    chart: [35, 50, 42, 65, 58, 77, 90],
    best: "Reels",
    insight:
      "Your Reels perform best when the hook appears within the first 2 seconds.",
  },
  youtube: {
    followers: "71K",
    followersGrowth: "+14.2%",
    reach: "1.4M",
    reachGrowth: "+32%",
    engagement: "7.9%",
    engagementGrowth: "+16%",
    views: "2.1M",
    viewsGrowth: "+46%",
    chart: [30, 45, 40, 62, 72, 78, 100],
    best: "Shorts",
    insight:
      "Your Shorts are driving your fastest audience growth right now.",
  },
  facebook: {
    followers: "21K",
    followersGrowth: "+4.1%",
    reach: "310K",
    reachGrowth: "+11%",
    engagement: "6.8%",
    engagementGrowth: "+8%",
    views: "340K",
    viewsGrowth: "+15%",
    chart: [25, 32, 38, 45, 52, 61, 68],
    best: "Video",
    insight:
      "Your audience responds particularly well to educational video content.",
  },
};

export default function ForCreatorsPage() {
  const [campaignFilter, setCampaignFilter] =
    useState<CampaignFilter>("recommended");
  const [selectedCampaign, setSelectedCampaign] =
    useState<Campaign | null>(null);
  const [platform, setPlatform] = useState<Platform>("all");
  const [clips, setClips] = useState(30);
  const [showAllPlatforms, setShowAllPlatforms] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  const currentAnalytics = analytics[platform];

  const filteredCampaigns = useMemo(() => {
    const list = [...campaigns];

    if (campaignFilter === "highest") {
      return list.sort((a, b) => b.reward - a.reward);
    }

    if (campaignFilter === "new") {
      return [list[2], list[3], list[0], list[1]];
    }

    if (campaignFilter === "quick") {
      return list.sort(
        (a, b) =>
          parseInt(a.deadline) -
          parseInt(b.deadline)
      );
    }

    return list.sort((a, b) => b.match - a.match);
  }, [campaignFilter]);

  const estimatedPerClip = 700;
  const baseIncome = clips * estimatedPerClip;
  const performanceBonus = Math.round(baseIncome * 0.22);
  const totalPotential = baseIncome + performanceBonus;

  return (
    <>
    <main id="creators" className="min-h-screen overflow-hidden bg-[#070611] text-white">
      <Navbar />
      {/* =========================================================
          HERO
      ========================================================= */}
      <section className="relative min-h-[92vh] px-6 pt-32 pb-24">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute left-[5%] top-[20%] h-72 w-72 rounded-full bg-purple-600/20 blur-[120px]" />
          <div className="absolute right-[5%] top-[15%] h-96 w-96 rounded-full bg-cyan-500/15 blur-[130px]" />
          <div className="absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-pink-500/10 blur-[120px]" />

          <div className="absolute left-[12%] top-[25%] h-1 w-1 animate-pulse rounded-full bg-white" />
          <div className="absolute left-[25%] top-[15%] h-1 w-1 animate-pulse rounded-full bg-cyan-300" />
          <div className="absolute right-[20%] top-[22%] h-1.5 w-1.5 animate-pulse rounded-full bg-purple-300" />
          <div className="absolute right-[10%] top-[45%] h-1 w-1 animate-pulse rounded-full bg-white" />
        </div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-500/10 px-4 py-2 text-sm font-bold text-purple-200 backdrop-blur">
              <Sparkles className="h-4 w-4" />
              AXON FOR CREATORS
            </div>

            <h1 className="max-w-4xl text-6xl font-black leading-[.9] tracking-[-0.06em] sm:text-7xl lg:text-8xl">
              Your audience
              <span className="block text-cyan-300">
                deserves
              </span>
              better opportunities.
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-8 text-white/60 sm:text-xl">
              Discover campaigns that fit your audience, understand
              what makes your content perform and turn your influence
              into a stronger creator business.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="#campaigns"
                className="group inline-flex items-center gap-3 rounded-full bg-white px-7 py-4 font-black text-black transition hover:scale-105"
              >
                Find Campaigns
                <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
              </a>

              <a
                href="#analytics"
                className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-7 py-4 font-bold backdrop-blur transition hover:bg-white/10"
              >
                View My Analytics
                <BarChart3 className="h-5 w-5" />
              </a>
            </div>

            <div className="mt-12 grid max-w-2xl grid-cols-3 gap-3">
              <HeroStat
                value="₹25K+"
                label="Campaign rewards"
                icon={<DollarSign />}
              />
              <HeroStat
                value="96%"
                label="Smart matching"
                icon={<Zap />}
              />
              <HeroStat
                value="3.8M"
                label="Potential reach"
                icon={<TrendingUp />}
              />
            </div>
          </div>

          {/* HERO CREATOR DASHBOARD */}
          <div className="relative mx-auto w-full max-w-[520px]">
            <div className="absolute -right-4 top-16 z-20 hidden w-48 rotate-3 rounded-3xl border border-cyan-300/30 bg-[#111020]/90 p-4 shadow-2xl backdrop-blur-xl sm:block">
              <div className="flex items-center gap-2 text-xs font-bold text-white/50">
                <Sparkles className="h-4 w-4 text-cyan-300" />
                AXON MATCH
              </div>
              <div className="mt-2 text-3xl font-black text-cyan-300">
                96%
              </div>
              <p className="mt-1 text-xs text-white/50">
                Perfect campaign fit
              </p>
            </div>

            <div className="absolute -left-8 bottom-20 z-20 hidden w-48 -rotate-3 rounded-3xl border border-lime-300/30 bg-[#111020]/90 p-4 shadow-2xl backdrop-blur-xl sm:block">
              <div className="flex items-center gap-2 text-xs font-bold text-white/50">
                <TrendingUp className="h-4 w-4 text-lime-300" />
                THIS MONTH
              </div>
              <div className="mt-2 text-3xl font-black text-lime-300">
                +31%
              </div>
              <p className="mt-1 text-xs text-white/50">
                Creator growth
              </p>
            </div>

            <div className="relative rounded-[42px] border border-white/10 bg-white/[0.045] p-4 shadow-[0_30px_100px_rgba(0,0,0,.45)] backdrop-blur-xl">
              <div className="rounded-[34px] bg-[#10101c] p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white/40">
                      CREATOR DASHBOARD
                    </p>
                    <h3 className="mt-1 text-xl font-black">
                      Good morning, Creator
                    </h3>
                  </div>

                  <div className="rounded-2xl bg-purple-500/15 p-3">
                    <Bell className="h-5 w-5 text-purple-300" />
                  </div>
                </div>

                <div className="mt-7 rounded-3xl bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase text-white/70">
                        Creator Score
                      </p>
                      <p className="mt-1 text-5xl font-black">
                        91
                      </p>
                    </div>
                    <Trophy className="h-12 w-12 text-white/80" />
                  </div>

                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/20">
                    <div className="h-full w-[91%] rounded-full bg-white" />
                  </div>

                  <p className="mt-3 text-xs font-bold text-white/80">
                    Top 12% of creators in your category
                  </p>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <MiniDashboardCard
                    label="Followers"
                    value="284K"
                    growth="+8.4%"
                  />
                  <MiniDashboardCard
                    label="Reach"
                    value="3.8M"
                    growth="+21%"
                  />
                </div>

                <div className="mt-4 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold">
                      Content Performance
                    </p>
                    <span className="text-xs text-lime-300">
                      +34%
                    </span>
                  </div>

                  <div className="mt-6 flex h-28 items-end gap-2">
                    {[32, 48, 40, 66, 52, 79, 94].map(
                      (height, index) => (
                        <div
                          key={index}
                          className="flex-1 rounded-t-lg bg-gradient-to-t from-purple-600 to-cyan-300 transition-all duration-500 hover:scale-y-110"
                          style={{ height: `${height}%` }}
                        />
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          CAMPAIGN MARKETPLACE
      ========================================================= */}
      <section
        id="campaigns"
        className="relative bg-[#f4f4f0] px-6 py-28 text-[#090912]"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr]">
            <div className="lg:sticky lg:top-28 lg:h-fit">
              <div className="inline-flex items-center gap-2 rounded-full bg-cyan-100 px-4 py-2 text-sm font-black text-cyan-700">
                <Search className="h-4 w-4" />
                CAMPAIGN DISCOVERY
              </div>

              <h2 className="mt-6 text-5xl font-black leading-[.9] tracking-[-0.05em] sm:text-6xl">
                Don't chase
                <span className="block text-blue-600">
                  opportunities.
                </span>
                Let them find you.
              </h2>

              <p className="mt-7 max-w-xl text-lg leading-8 text-black/55">
                Axon matches creators with campaigns based on niche,
                audience, content style, location and performance —
                not just follower count.
              </p>

              <div className="mt-8 rounded-[30px] bg-[#0b0a1f] p-6 text-white shadow-2xl">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-cyan-400 p-3 text-black">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-black">Axon Smart Matching</p>
                    <p className="text-xs text-white/40">
                      Your profile → right opportunities
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <MatchItem text="Your fashion niche" />
                  <MatchItem text="18–30 audience demographic" />
                  <MatchItem text="9.4% engagement rate" />
                  <MatchItem text="India-based audience" />
                </div>

                <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-300 py-4 font-black text-black transition hover:scale-[1.02]">
                  Find My Campaigns
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div>
              <div className="mb-6 flex flex-wrap gap-2">
                <CampaignFilter
                  active={campaignFilter === "recommended"}
                  onClick={() =>
                    setCampaignFilter("recommended")
                  }
                >
                  ✦ Recommended
                </CampaignFilter>

                <CampaignFilter
                  active={campaignFilter === "highest"}
                  onClick={() =>
                    setCampaignFilter("highest")
                  }
                >
                  ₹ Highest Reward
                </CampaignFilter>

                <CampaignFilter
                  active={campaignFilter === "new"}
                  onClick={() => setCampaignFilter("new")}
                >
                  New
                </CampaignFilter>

                <CampaignFilter
                  active={campaignFilter === "quick"}
                  onClick={() => setCampaignFilter("quick")}
                >
                  ⚡ Quick Start
                </CampaignFilter>
              </div>

              <div className="space-y-4">
                {filteredCampaigns.map((campaign) => (
                  <CampaignCard
                    key={campaign.id}
                    campaign={campaign}
                    onClick={() => setSelectedCampaign(campaign)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          CREATOR JOURNEY
      ========================================================= */}
      <section className="bg-[#070611] px-6 py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <div className="text-sm font-black tracking-[.25em] text-purple-300">
              THE CREATOR JOURNEY
            </div>

            <h2 className="mt-5 text-5xl font-black tracking-[-0.05em] sm:text-7xl">
              From opportunity
              <span className="text-purple-300">
                {" "}
                to income.
              </span>
            </h2>

            <p className="mt-6 text-lg text-white/50">
              Everything you need to discover, execute and grow
              through brand collaborations.
            </p>
          </div>

          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <JourneyCard
              number="01"
              title="Discover"
              description="Find campaigns that fit your niche and audience."
              icon={<Search />}
              className="bg-cyan-300 text-black"
            />

            <JourneyCard
              number="02"
              title="Create"
              description="Turn campaign briefs into content your audience loves."
              icon={<Play />}
              className="bg-purple-500"
            />

            <JourneyCard
              number="03"
              title="Publish"
              description="Deliver and publish your approved campaign content."
              icon={<Sparkles />}
              className="bg-pink-400 text-black"
            />

            <JourneyCard
              number="04"
              title="Earn"
              description="Get paid and build your creator reputation."
              icon={<DollarSign />}
              className="bg-lime-300 text-black"
            />
          </div>
        </div>
      </section>

      {/* =========================================================
          ANALYTICS
      ========================================================= */}
      <section
        id="analytics"
        className="bg-[#e8f7d9] px-6 py-28 text-[#090912]"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-14 lg:grid-cols-[.85fr_1.15fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-lime-200 px-4 py-2 text-sm font-black text-green-800">
                <BarChart3 className="h-4 w-4" />
                ACCOUNT ANALYTICS
              </div>

              <h2 className="mt-6 text-5xl font-black leading-[.9] tracking-[-0.05em] sm:text-7xl">
                Don't just
                <span className="block text-green-700">
                  post.
                </span>
                Understand.
              </h2>

              <p className="mt-7 max-w-xl text-lg leading-8 text-black/55">
                Connect Instagram, YouTube and Facebook and see
                exactly how your creator business is performing from
                one intelligent dashboard.
              </p>

              <div className="mt-8 flex flex-wrap gap-2">
                <PlatformButton
                  active={platform === "all"}
                  onClick={() => setPlatform("all")}
                >
                  All Platforms
                </PlatformButton>

                <PlatformButton
                  active={platform === "instagram"}
                  onClick={() => setPlatform("instagram")}
                >
                  <FaInstagram className="h-4 w-4" />
                  Instagram
                </PlatformButton>

                <PlatformButton
                  active={platform === "youtube"}
                  onClick={() => setPlatform("youtube")}
                >
                  <FaYoutube className="h-4 w-4" />
                  YouTube
                </PlatformButton>

                <PlatformButton
                  active={platform === "facebook"}
                  onClick={() => setPlatform("facebook")}
                >
                  <FaFacebook className="h-4 w-4" />
                  Facebook
                </PlatformButton>
              </div>

              <div className="mt-8 rounded-[30px] bg-[#0b0a1f] p-6 text-white shadow-xl">
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-yellow-300 p-3 text-black">
                    <Lightbulb className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-xs font-black tracking-widest text-yellow-300">
                      AXON INTELLIGENCE
                    </p>

                    <p className="mt-3 text-lg font-bold leading-7">
                      {currentAnalytics.insight}
                    </p>

                    <button className="mt-5 inline-flex items-center gap-2 text-sm font-black text-yellow-300">
                      See what to do next
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ANALYTICS DASHBOARD */}
            <div className="rounded-[40px] bg-[#0b0a1f] p-4 shadow-2xl">
              <div className="rounded-[32px] bg-[#121120] p-6 text-white">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold text-white/35">
                      CREATOR INTELLIGENCE
                    </p>
                    <h3 className="mt-1 text-2xl font-black">
                      {platform === "all"
                        ? "All Platforms"
                        : platform === "instagram"
                        ? "Instagram"
                        : platform === "youtube"
                        ? "YouTube"
                        : "Facebook"}
                    </h3>
                  </div>

                  <div className="rounded-2xl bg-lime-300 px-4 py-2 text-sm font-black text-black">
                    Live Data
                  </div>
                </div>

                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  <AnalyticsStat
                    title="Followers"
                    value={currentAnalytics.followers}
                    growth={currentAnalytics.followersGrowth}
                  />

                  <AnalyticsStat
                    title="Reach"
                    value={currentAnalytics.reach}
                    growth={currentAnalytics.reachGrowth}
                  />

                  <AnalyticsStat
                    title="Engagement"
                    value={currentAnalytics.engagement}
                    growth={currentAnalytics.engagementGrowth}
                  />

                  <AnalyticsStat
                    title="Content Views"
                    value={currentAnalytics.views}
                    growth={currentAnalytics.viewsGrowth}
                  />
                </div>

                <div className="mt-4 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-black">
                        Content Performance
                      </p>
                      <p className="mt-1 text-xs text-white/35">
                        Last 7 periods
                      </p>
                    </div>

                    <TrendingUp className="h-5 w-5 text-lime-300" />
                  </div>

                  <div className="mt-7 flex h-40 items-end gap-2">
                    {currentAnalytics.chart.map(
                      (height, index) => (
                        <div
                          key={index}
                          className="group relative flex flex-1 items-end"
                          style={{ height: "100%" }}
                        >
                          <div
                            className="w-full rounded-t-xl bg-gradient-to-t from-purple-600 to-lime-300 transition-all duration-500 group-hover:scale-y-105"
                            style={{
                              height: `${height}%`,
                            }}
                          />
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl bg-purple-500 p-5">
                    <p className="text-xs font-bold text-white/60">
                      BEST CONTENT
                    </p>
                    <p className="mt-2 text-xl font-black">
                      {currentAnalytics.best}
                    </p>
                    <p className="mt-2 text-xs text-white/70">
                      Your strongest format right now.
                    </p>
                  </div>

                  <div className="rounded-3xl bg-cyan-300 p-5 text-black">
                    <p className="text-xs font-bold text-black/50">
                      GROWTH
                    </p>
                    <p className="mt-2 text-xl font-black">
                      +34%
                    </p>
                    <p className="mt-2 text-xs text-black/60">
                      Compared with previous period.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          CONTENT INTELLIGENCE
      ========================================================= */}
      <section className="bg-[#070611] px-6 py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div>
              <div className="text-sm font-black tracking-[.25em] text-pink-300">
                CONTENT INTELLIGENCE
              </div>

              <h2 className="mt-5 text-5xl font-black leading-[.9] tracking-[-0.05em] sm:text-7xl">
                Know what your
                <span className="block text-pink-300">
                  audience wants.
                </span>
              </h2>

              <p className="mt-7 max-w-xl text-lg leading-8 text-white/50">
                Axon turns your performance data into useful
                recommendations instead of making you stare at
                charts.
              </p>

              <div className="mt-9 rounded-[32px] border border-white/10 bg-white/[0.04] p-6">
                <div className="flex gap-4">
                  <div className="rounded-2xl bg-yellow-300 p-3 text-black">
                    <Sparkles className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="font-black">
                      ✦ Axon found a pattern
                    </p>

                    <p className="mt-3 text-lg font-bold leading-7">
                      Your audience responds strongest to affordable
                      fashion + local content.
                    </p>

                    <p className="mt-3 text-sm text-white/40">
                      Content in this category generates 41% more
                      watch time for your account.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <ContentCard
                rank="#1"
                title="5 outfits under ₹2,000"
                views="1.2M"
                growth="+84%"
                className="bg-pink-400 text-black"
              />

              <ContentCard
                rank="#2"
                title="Delhi streetwear"
                views="842K"
                growth="+51%"
                className="bg-cyan-300 text-black"
              />

              <ContentCard
                rank="#3"
                title="3 styling mistakes"
                views="624K"
                growth="+37%"
                className="bg-purple-500"
              />

              <ContentCard
                rank="#4"
                title="Weekend fashion"
                views="412K"
                growth="+29%"
                className="bg-lime-300 text-black"
              />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          AUDIENCE INTELLIGENCE
      ========================================================= */}
      <section className="bg-[#ffefe3] px-6 py-28 text-[#090912]">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-14 lg:grid-cols-[1fr_1fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-orange-200 px-4 py-2 text-sm font-black text-orange-800">
                <Users className="h-4 w-4" />
                AUDIENCE INTELLIGENCE
              </div>

              <h2 className="mt-6 text-5xl font-black leading-[.9] tracking-[-0.05em] sm:text-7xl">
                Know who is
                <span className="block text-orange-600">
                  watching you.
                </span>
              </h2>

              <p className="mt-7 text-lg leading-8 text-black/55">
                Understand your audience so you can create better
                content and attract brands that genuinely fit your
                community.
              </p>
            </div>

            <div className="rounded-[38px] bg-white p-7 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black">
                  Your Audience
                </h3>
                <Users className="h-5 w-5 text-orange-500" />
              </div>

              <div className="mt-8 space-y-5">
                <AudienceBar
                  label="18–24"
                  percentage="48%"
                  width="48%"
                />
                <AudienceBar
                  label="25–34"
                  percentage="31%"
                  width="31%"
                />
                <AudienceBar
                  label="35–44"
                  percentage="14%"
                  width="14%"
                />
                <AudienceBar
                  label="45+"
                  percentage="7%"
                  width="7%"
                />
              </div>

              <div className="mt-8 border-t border-black/10 pt-7">
                <p className="text-xs font-black tracking-widest text-black/40">
                  TOP CITIES
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {[
                    "Delhi 22%",
                    "Mumbai 15%",
                    "Bengaluru 11%",
                    "Gurugram 8%",
                  ].map((city) => (
                    <span
                      key={city}
                      className="rounded-full bg-orange-100 px-4 py-2 text-sm font-bold text-orange-800"
                    >
                      {city}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 rounded-2xl bg-lime-100 p-4 text-sm font-bold text-green-800">
                ✦ Your audience profile is highly attractive to
                fashion & lifestyle brands.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          CREATOR SCORE
      ========================================================= */}
      <section className="bg-[#070611] px-6 py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <div className="text-sm font-black tracking-[.25em] text-yellow-300">
              AXON CREATOR SCORE
            </div>

            <h2 className="mt-5 text-5xl font-black tracking-[-0.05em] sm:text-7xl">
              Your performance
              <span className="text-yellow-300"> becomes your power.</span>
            </h2>

            <p className="mt-6 text-lg text-white/50">
              A dynamic creator score built from audience quality,
              engagement, content performance and campaign
              reliability.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-2">
            <div className="rounded-[38px] bg-gradient-to-br from-yellow-300 via-orange-400 to-pink-500 p-8 text-black">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-sm font-black uppercase">
                    Creator Score
                  </p>
                  <p className="mt-2 text-8xl font-black leading-none">
                    91
                  </p>
                </div>

                <Trophy className="h-20 w-20 opacity-60" />
              </div>

              <div className="mt-8 h-3 rounded-full bg-black/15">
                <div className="h-full w-[91%] rounded-full bg-black" />
              </div>

              <p className="mt-4 font-bold">
                Top 12% of creators in your category.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <ScoreCard
                title="Audience Quality"
                score="94"
                color="bg-cyan-300 text-black"
              />
              <ScoreCard
                title="Engagement"
                score="89"
                color="bg-purple-500"
              />
              <ScoreCard
                title="Content"
                score="93"
                color="bg-pink-400 text-black"
              />
              <ScoreCard
                title="Reliability"
                score="96"
                color="bg-lime-300 text-black"
              />
            </div>
          </div>

          <div className="mt-6 rounded-[30px] border border-white/10 bg-white/[0.04] p-6 text-center">
            <p className="text-white/50">
              Better performance →
              <span className="mx-2 font-black text-white">
                stronger score
              </span>
              →
              <span className="mx-2 font-black text-cyan-300">
                better campaign matches
              </span>
              →
              <span className="mx-2 font-black text-lime-300">
                more opportunities
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================
          EARNINGS
      ========================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-700 via-fuchsia-600 to-pink-500 px-6 py-28">
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-cyan-300/20 blur-3xl" />

        <div className="relative mx-auto max-w-6xl">
          <div className="text-center">
            <div className="text-sm font-black tracking-[.25em] text-white/70">
              YOUR CREATOR BUSINESS
            </div>

            <h2 className="mt-5 text-5xl font-black tracking-[-0.05em] sm:text-7xl">
              More opportunities.
              <br />
              More potential income.
            </h2>
          </div>

          <div className="mt-14 rounded-[40px] bg-black/20 p-6 backdrop-blur-xl sm:p-10">
            <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
              <div>
                <p className="text-sm font-black text-white/60">
                  HOW MANY CAMPAIGNS?
                </p>

                <div className="mt-5 flex items-end gap-3">
                  <span className="text-7xl font-black">
                    {clips}
                  </span>
                  <span className="pb-3 font-bold text-white/50">
                    campaign deliverables
                  </span>
                </div>

                <input
                  type="range"
                  min="5"
                  max="60"
                  value={clips}
                  onChange={(e) =>
                    setClips(Number(e.target.value))
                  }
                  className="mt-8 w-full accent-lime-300"
                />

                <div className="mt-3 flex justify-between text-xs font-bold text-white/40">
                  <span>5</span>
                  <span>30</span>
                  <span>60</span>
                </div>

                <div className="mt-8 space-y-3">
                  <EarningRow
                    label={`${clips} × ₹${estimatedPerClip}`}
                    value={`₹${baseIncome.toLocaleString("en-IN")}`}
                  />
                  <EarningRow
                    label="Potential performance bonuses"
                    value={`+₹${performanceBonus.toLocaleString(
                      "en-IN"
                    )}`}
                  />
                </div>
              </div>

              <div className="rounded-[32px] bg-white p-7 text-black sm:p-9">
                <p className="text-sm font-black text-black/40">
                  ILLUSTRATIVE MONTHLY POTENTIAL
                </p>

                <p className="mt-4 text-6xl font-black tracking-[-0.05em] sm:text-7xl">
                  ₹{totalPotential.toLocaleString("en-IN")}
                </p>

                <div className="mt-7 h-px bg-black/10" />

                <div className="mt-6 flex items-center gap-3">
                  <div className="rounded-full bg-lime-200 p-2 text-green-700">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-bold">
                    Grow your campaign volume as your creator
                    profile strengthens.
                  </p>
                </div>

                <button className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-black py-4 font-black text-white transition hover:scale-[1.02]">
                  Start Growing
                  <ArrowRight className="h-4 w-4" />
                </button>

                <p className="mt-4 text-center text-xs text-black/40">
                  Illustrative only. Actual earnings depend on
                  campaign terms, approvals and performance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FLYWHEEL
      ========================================================= */}
      <section className="bg-[#070611] px-6 py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <div className="text-sm font-black tracking-[.25em] text-cyan-300">
              THE AXON FLYWHEEL
            </div>

            <h2 className="mt-5 text-5xl font-black tracking-[-0.05em] sm:text-7xl">
              Grow once.
              <span className="block text-cyan-300">
                Get stronger every time.
              </span>
            </h2>
          </div>

          <div className="mt-16 grid gap-3 md:grid-cols-6">
            {[
              ["01", "Discover", "Find the right campaign"],
              ["02", "Create", "Make great content"],
              ["03", "Measure", "Track performance"],
              ["04", "Improve", "Learn what works"],
              ["05", "Earn", "Get rewarded"],
              ["06", "Grow", "Unlock better opportunities"],
            ].map(([number, title, description], index) => (
              <div
                key={title}
                className={`rounded-[28px] p-5 ${
                  index % 3 === 0
                    ? "bg-cyan-300 text-black"
                    : index % 3 === 1
                    ? "bg-purple-500"
                    : "bg-pink-400 text-black"
                }`}
              >
                <p className="text-xs font-black opacity-50">
                  {number}
                </p>
                <h3 className="mt-8 text-xl font-black">
                  {title}
                </h3>
                <p className="mt-2 text-xs font-medium opacity-70">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          FINAL CTA
      ========================================================= */}
      <section className="bg-white px-6 py-24 text-[#070611]">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[#0b0a1f] text-cyan-300">
            <Sparkles />
          </div>

          <h2 className="mt-8 text-5xl font-black leading-[.9] tracking-[-0.06em] sm:text-7xl lg:text-8xl">
            Your audience is already watching.
            <span className="block text-purple-600">
              Now turn attention into opportunity.
            </span>
          </h2>

          <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-black/50">
            Join Axon, discover campaigns built for your audience and
            use real data to become a stronger creator.
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <a href="#join" onClick={(e)=> {e.preventDefault(); setShowJoin(true)}} className="group inline-flex items-center gap-3 rounded-full bg-[#0b0a1f] px-8 py-4 font-black text-white transition hover:scale-105">
              Find My First Campaign
              <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
            </a>

            <a href="#join" onClick={(e)=> {e.preventDefault(); setShowJoin(true)}} className="inline-flex items-center gap-3 rounded-full bg-cyan-300 px-8 py-4 font-black text-black transition hover:scale-105">
              Connect My Accounts
              <BarChart3 className="h-5 w-5" />
            </a>
          </div>
        </div>
      </section>

      {/* =========================================================
          CAMPAIGN MODAL
      ========================================================= */}
      {selectedCampaign && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-5 backdrop-blur-md">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[36px] bg-[#111020] text-white shadow-2xl">
            <button
              onClick={() => setSelectedCampaign(null)}
              className="absolute right-5 top-5 z-10 rounded-full bg-black/40 p-3 text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div
              className={`h-44 bg-gradient-to-br ${selectedCampaign.gradient} p-7`}
            >
              <span className="rounded-full bg-black/25 px-3 py-1 text-xs font-black backdrop-blur">
                {selectedCampaign.badge}
              </span>

              <div className="mt-12">
                <p className="text-sm font-bold text-white/70">
                  {selectedCampaign.brand}
                </p>
                <h3 className="text-3xl font-black">
                  {selectedCampaign.title}
                </h3>
              </div>
            </div>

            <div className="p-7">
              <p className="leading-7 text-white/55">
                {selectedCampaign.description}
              </p>

              <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <ModalStat
                  label="Reward"
                  value={`₹${selectedCampaign.reward.toLocaleString(
                    "en-IN"
                  )}`}
                />
                <ModalStat
                  label="Deliverables"
                  value={selectedCampaign.deliverables}
                />
                <ModalStat
                  label="Deadline"
                  value={selectedCampaign.deadline}
                />
                <ModalStat
                  label="Match"
                  value={`${selectedCampaign.match}%`}
                />
              </div>

              <div className="mt-6 rounded-3xl bg-white/[0.04] p-5">
                <p className="text-xs font-black tracking-widest text-cyan-300">
                  WHY YOU MATCH
                </p>

                <div className="mt-4 space-y-3">
                  <MatchItem text="Your content category matches the campaign." />
                  <MatchItem text="Your audience fits the target demographic." />
                  <MatchItem text="Your recent engagement is above campaign requirements." />
                </div>
              </div>

              <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-300 py-4 font-black text-black transition hover:scale-[1.01]">
                Apply for Campaign
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
    {showJoin && (<JoinModal onClose={() => setShowJoin(false)} />)}
    </>
  );
}

/* =============================================================
   COMPONENTS
============================================================= */

function HeroStat({
  value,
  label,
  icon,
}: {
  value: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
      <div className="flex items-center gap-2 text-cyan-300">
        <span className="[&>svg]:h-4 [&>svg]:w-4">
          {icon}
        </span>
        <span className="text-xl font-black">{value}</span>
      </div>
      <p className="mt-1 text-xs text-white/40">{label}</p>
    </div>
  );
}

function MiniDashboardCard({
  label,
  value,
  growth,
}: {
  label: string;
  value: string;
  growth: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs text-white/35">{label}</p>
      <div className="mt-2 flex items-end justify-between gap-2">
        <span className="text-2xl font-black">{value}</span>
        <span className="text-xs font-bold text-lime-300">
          {growth}
        </span>
      </div>
    </div>
  );
}

function MatchItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-lime-300 text-black">
        <Check className="h-3 w-3" />
      </div>
      <span className="text-sm text-white/60">{text}</span>
    </div>
  );
}

function CampaignFilter({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-5 py-3 text-sm font-black transition ${
        active
          ? "bg-black text-white shadow-lg"
          : "bg-white text-black/55 hover:bg-black/5"
      }`}
    >
      {children}
    </button>
  );
}

function CampaignCard({
  campaign,
  onClick,
}: {
  campaign: Campaign;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group w-full rounded-[32px] bg-white p-4 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
    >
      <div className="flex flex-col gap-5 sm:flex-row">
        <div
          className={`relative h-44 shrink-0 overflow-hidden rounded-[25px] bg-gradient-to-br ${campaign.gradient} p-5 sm:w-48`}
        >
          <span className="rounded-full bg-black/20 px-3 py-1 text-[10px] font-black text-white backdrop-blur">
            {campaign.badge}
          </span>

          <div className="absolute bottom-4 left-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
              <Play className="h-4 w-4 fill-white" />
            </div>
          </div>
        </div>

        <div className="flex-1 p-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-black/40">
                {campaign.brand} · {campaign.category}
              </p>

              <h3 className="mt-1 text-2xl font-black tracking-tight">
                {campaign.title}
              </h3>
            </div>

            <div className="rounded-2xl bg-lime-100 px-3 py-2 text-sm font-black text-green-700">
              {campaign.match}% match
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-full bg-black/5 px-3 py-2 text-xs font-bold">
              {campaign.platform}
            </span>
            <span className="rounded-full bg-black/5 px-3 py-2 text-xs font-bold">
              {campaign.deliverables}
            </span>
            <span className="flex items-center gap-1 rounded-full bg-black/5 px-3 py-2 text-xs font-bold">
              <Clock3 className="h-3 w-3" />
              {campaign.deadline}
            </span>
          </div>

          <div className="mt-6 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold text-black/40">
                CAMPAIGN REWARD
              </p>
              <p className="text-2xl font-black">
                ₹{campaign.reward.toLocaleString("en-IN")}
              </p>
            </div>

            <span className="flex items-center gap-1 text-sm font-black">
              View campaign
              <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

function JourneyCard({
  number,
  title,
  description,
  icon,
  className,
}: {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  className: string;
}) {
  return (
    <div
      className={`group min-h-[260px] rounded-[32px] p-6 transition duration-300 hover:-translate-y-2 ${className}`}
    >
      <div className="flex items-start justify-between">
        <span className="text-xs font-black opacity-50">
          {number}
        </span>

        <div className="rounded-2xl bg-black/10 p-3 [&>svg]:h-5 [&>svg]:w-5">
          {icon}
        </div>
      </div>

      <h3 className="mt-20 text-3xl font-black">{title}</h3>

      <p className="mt-3 text-sm font-medium opacity-70">
        {description}
      </p>
    </div>
  );
}

function PlatformButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-full px-4 py-3 text-sm font-black transition ${
        active
          ? "bg-black text-white shadow-lg"
          : "bg-white text-black/55 hover:bg-black/5"
      }`}
    >
      {children}
    </button>
  );
}

function AnalyticsStat({
  title,
  value,
  growth,
}: {
  title: string;
  value: string;
  growth: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-xs font-bold text-white/35">{title}</p>

      <div className="mt-3 flex items-end justify-between gap-3">
        <span className="text-3xl font-black">{value}</span>
        <span className="rounded-full bg-lime-300/10 px-2 py-1 text-xs font-black text-lime-300">
          {growth}
        </span>
      </div>
    </div>
  );
}

function ContentCard({
  rank,
  title,
  views,
  growth,
  className,
}: {
  rank: string;
  title: string;
  views: string;
  growth: string;
  className: string;
}) {
  return (
    <div
      className={`group min-h-[230px] rounded-[32px] p-6 transition duration-300 hover:-translate-y-2 ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-black opacity-50">
          {rank}
        </span>
        <TrendingUp className="h-5 w-5 opacity-50" />
      </div>

      <h3 className="mt-14 text-2xl font-black">{title}</h3>

      <div className="mt-5 flex items-end justify-between">
        <div>
          <p className="text-xs font-bold opacity-50">VIEWS</p>
          <p className="text-2xl font-black">{views}</p>
        </div>

        <span className="text-sm font-black">{growth}</span>
      </div>
    </div>
  );
}

function AudienceBar({
  label,
  percentage,
  width,
}: {
  label: string;
  percentage: string;
  width: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm font-black">
        <span>{label}</span>
        <span>{percentage}</span>
      </div>

      <div className="h-3 rounded-full bg-black/5">
        <div
          className="h-full rounded-full bg-orange-500"
          style={{ width }}
        />
      </div>
    </div>
  );
}

function ScoreCard({
  title,
  score,
  color,
}: {
  title: string;
  score: string;
  color: string;
}) {
  return (
    <div
      className={`rounded-[28px] p-6 transition hover:-translate-y-1 ${color}`}
    >
      <p className="text-xs font-black uppercase opacity-50">
        {title}
      </p>

      <p className="mt-10 text-5xl font-black">{score}</p>

      <div className="mt-4 h-2 rounded-full bg-black/10">
        <div
          className="h-full rounded-full bg-current"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

function EarningRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/10 pb-3">
      <span className="text-sm text-white/50">{label}</span>
      <span className="font-black">{value}</span>
    </div>
  );
}

function ModalStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-white/[0.05] p-4">
      <p className="text-[10px] font-black uppercase text-white/30">
        {label}
      </p>
      <p className="mt-2 font-black">{value}</p>
    </div>
  );
}