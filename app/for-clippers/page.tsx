"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  Check,
  ChevronRight,
  Clock3,
  DollarSign,
  Edit3,
  Flame,
  Filter,
  Play,
  Scissors,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Upload,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import Navbar from "../ui/Navbar";
import JoinModal from "../ui/JoinModal";
/* =========================================================
   TYPES
========================================================= */

type FilterType = "trending" | "highest" | "new" | "long";

type Campaign = {
  id: number;
  brand: string;
  title: string;
  category: string;
  videos: number;
  reward: number;
  bonus: number;
  deadline: string;
  color: string;
  tag: string;
  match: number;
};

/* =========================================================
   CAMPAIGN DATA
========================================================= */

const campaigns: Campaign[] = [
  {
    id: 1,
    brand: "Creator Studio",
    title: "Podcast Moments",
    category: "Podcast",
    videos: 18,
    reward: 700,
    bonus: 5000,
    deadline: "12 days",
    color: "from-purple-500 to-pink-500",
    tag: "TRENDING",
    match: 96,
  },
  {
    id: 2,
    brand: "FitFuel",
    title: "Fitness Transformation",
    category: "Fitness",
    videos: 24,
    reward: 550,
    bonus: 3500,
    deadline: "8 days",
    color: "from-orange-400 to-red-500",
    tag: "HIGH REWARD",
    match: 91,
  },
  {
    id: 3,
    brand: "TechVerse",
    title: "Tech Shorts",
    category: "Technology",
    videos: 31,
    reward: 900,
    bonus: 7500,
    deadline: "16 days",
    color: "from-blue-400 to-cyan-400",
    tag: "NEW",
    match: 88,
  },
  {
    id: 4,
    brand: "MoneyMind",
    title: "Finance Clips",
    category: "Finance",
    videos: 15,
    reward: 1100,
    bonus: 10000,
    deadline: "21 days",
    color: "from-emerald-400 to-green-500",
    tag: "LONG TERM",
    match: 84,
  },
];

/* =========================================================
   MAIN PAGE
========================================================= */

export default function ForClippersPage() {
  const [showJoin, setShowJoin] = useState(false);
  const [activeFilter, setActiveFilter] =
    useState<FilterType>("trending");

  const [selectedCampaign, setSelectedCampaign] =
    useState<Campaign | null>(null);

  const [clipsPerMonth, setClipsPerMonth] = useState(30);

  const filteredCampaigns = useMemo(() => {
    if (activeFilter === "highest") {
      return [...campaigns].sort((a, b) => b.reward - a.reward);
    }

    if (activeFilter === "new") {
      return campaigns.filter((item) => item.tag === "NEW");
    }

    if (activeFilter === "long") {
      return campaigns.filter((item) => item.tag === "LONG TERM");
    }

    return campaigns;
  }, [activeFilter]);

  const averageReward = 700;
  const baseEarning = clipsPerMonth * averageReward;

  const performanceBonus =
    clipsPerMonth >= 50
      ? 12000
      : clipsPerMonth >= 30
        ? 8500
        : clipsPerMonth >= 20
          ? 4500
          : 1800;

  const totalPotential = baseEarning + performanceBonus;

  return (
  <>
    <main className="overflow-hidden bg-[#0B0A1F] text-white">
        <Navbar />

      {/* =====================================================
          HERO
      ===================================================== */}

      <section  className="relative min-h-[850px] overflow-hidden px-6 pb-28 pt-40">

        {/* Background glow */}
        <div className="pointer-events-none absolute left-[-200px] top-[15%] h-[600px] w-[600px] rounded-full bg-purple-700/20 blur-[150px]" />

        <div className="pointer-events-none absolute right-[-200px] top-[5%] h-[600px] w-[600px] rounded-full bg-pink-500/10 blur-[150px]" />

        {/* Stars */}
        <div className="absolute inset-0 opacity-30">
          {Array.from({ length: 35 }).map((_, i) => (
            <span
              key={i}
              className="absolute h-1 w-1 rounded-full bg-white"
              style={{
                left: `${(i * 31) % 100}%`,
                top: `${(i * 47) % 100}%`,
                opacity: 0.3 + ((i * 17) % 7) / 10,
              }}
            />
          ))}
        </div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[1fr_0.9fr]">

          {/* LEFT */}
          <div>

            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-500/10 px-4 py-2 text-xs font-black tracking-[0.15em] text-purple-300">
              <Scissors size={14} />
              axonnn FOR CLIPPERS
            </div>

            <h1 className="max-w-4xl text-6xl font-black leading-[0.88] tracking-[-0.06em] md:text-8xl">

              Turn content

              <br />

              into

              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-300 bg-clip-text text-transparent">
                income.
              </span>

            </h1>

            <p className="mt-8 max-w-xl text-lg font-medium leading-8 text-white/55">
              Find high-value clipping campaigns, transform long-form content
              into short-form videos and build a recurring income stream with
              axonnn.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">

              <a
                href="#marketplace"
                className="group flex items-center gap-3 rounded-2xl bg-white px-6 py-4 text-sm font-black text-black transition hover:-translate-y-1 hover:shadow-[0_15px_50px_rgba(255,255,255,0.2)]"
              >
                Explore Marketplace

                <ArrowRight
                  size={17}
                  className="transition group-hover:translate-x-1"
                />
              </a>

              <a
                href="#earn-monthly"
                className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-6 py-4 text-sm font-black backdrop-blur-xl transition hover:bg-white/10"
              >
                See earning potential
              </a>

            </div>

            {/* mini stats */}
            <div className="mt-12 flex flex-wrap gap-8">

              <HeroStat value="₹700+" label="Avg / clip" />

              <HeroStat value="10K+" label="Clipping opportunities" />

              <HeroStat value="24/7" label="Marketplace" />

            </div>

          </div>

          {/* RIGHT — CLIP MOCKUP */}
          <div className="relative">

            {/* floating earnings */}
            <div className="absolute -left-8 top-10 z-20 animate-[bounce_4s_ease-in-out_infinite] rounded-2xl border border-emerald-300/30 bg-emerald-400/10 px-5 py-4 shadow-2xl backdrop-blur-xl">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400 text-black">
                  <Wallet size={18} />
                </div>

                <div>
                  <p className="text-[10px] font-bold text-white/40">
                    CLIP EARNED
                  </p>

                  <p className="text-xl font-black text-emerald-300">
                    +₹700
                  </p>
                </div>

              </div>

            </div>

            {/* phone */}
            <div className="relative mx-auto w-[310px] rounded-[45px] border-[8px] border-white/10 bg-black p-3 shadow-[0_40px_100px_rgba(0,0,0,0.5)] md:w-[350px]">

              <div className="relative aspect-[9/17] overflow-hidden rounded-[32px] bg-gradient-to-b from-purple-900 via-[#17102c] to-black">

                {/* video */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/40 via-pink-500/20 to-orange-400/20" />

                <div className="absolute left-5 right-5 top-7 flex justify-between">

                  <span className="rounded-full bg-black/30 px-3 py-1 text-[9px] font-black backdrop-blur">
                    axonnn CLIP
                  </span>

                  <span className="rounded-full bg-red-500 px-3 py-1 text-[9px] font-black">
                    LIVE
                  </span>

                </div>

                <div className="absolute inset-x-6 top-[38%]">

                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-black">
                    <Play fill="black" size={22} />
                  </div>

                  <p className="text-2xl font-black leading-tight">
                    The best
                    <br />
                    ideas deserve
                    <br />
                    attention.
                  </p>

                  <div className="mt-5 h-1 overflow-hidden rounded-full bg-white/20">
                    <div className="h-full w-[67%] rounded-full bg-white" />
                  </div>

                  <div className="mt-3 flex justify-between text-[9px] font-bold text-white/50">
                    <span>00:18</span>
                    <span>00:27</span>
                  </div>

                </div>

                <div className="absolute bottom-6 left-5 right-5 rounded-2xl border border-white/10 bg-black/40 p-3 backdrop-blur-xl">

                  <div className="flex items-center justify-between">

                    <div>
                      <p className="text-[9px] text-white/40">
                        PERFORMANCE
                      </p>

                      <p className="text-lg font-black">
                        82.4K views
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[9px] text-white/40">
                        EARNED
                      </p>

                      <p className="text-lg font-black text-emerald-300">
                        ₹700
                      </p>
                    </div>

                  </div>

                </div>

              </div>

            </div>

            {/* right floating card */}
            <div className="absolute -right-8 bottom-20 z-20 rounded-2xl border border-orange-300/20 bg-orange-400/10 px-5 py-4 backdrop-blur-xl">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-400 text-black">
                  <TrendingUp size={18} />
                </div>

                <div>
                  <p className="text-[10px] font-bold text-white/40">
                    VIRAL BONUS
                  </p>

                  <p className="text-xl font-black text-orange-300">
                    +₹5,000
                  </p>
                </div>

              </div>

            </div>

          </div>

        </div>
      </section>


      {/* =====================================================
          MARKETPLACE
      ===================================================== */}

      <section
        id="marketplace"
        className="relative bg-[#f7f7f8] px-6 py-28 text-black"
      >

        <div className="mx-auto max-w-7xl">

          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">

            {/* heading */}
            <div>

              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-2 text-xs font-black text-purple-700">
                <Sparkles size={14} />
                CLIP MARKETPLACE
              </div>

              <h2 className="text-5xl font-black leading-[0.9] tracking-[-0.05em] md:text-7xl">
                Don't wait
                <br />
                for work.
                <br />

                <span className="text-purple-600">
                  Find it.
                </span>
              </h2>

              <p className="mt-7 max-w-md text-base font-medium leading-7 text-black/50">
                Browse campaigns from creators and brands looking for editors
                who can turn long-form content into scroll-stopping clips.
              </p>

              <div className="mt-8 rounded-3xl bg-black p-5 text-white">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500">
                    <Filter size={18} />
                  </div>

                  <div>
                    <p className="text-xs font-black">
                      SMART MATCHING
                    </p>

                    <p className="mt-1 text-xs text-white/40">
                      axonnn finds campaigns that fit your style.
                    </p>
                  </div>

                </div>

              </div>

            </div>


            {/* marketplace */}
            <div>

              {/* filters */}
              <div className="mb-5 flex flex-wrap gap-2">

                <MarketFilter
                  active={activeFilter === "trending"}
                  onClick={() => setActiveFilter("trending")}
                  icon={<Flame size={14} />}
                  label="Trending"
                />

                <MarketFilter
                  active={activeFilter === "highest"}
                  onClick={() => setActiveFilter("highest")}
                  icon={<DollarSign size={14} />}
                  label="Highest Reward"
                />

                <MarketFilter
                  active={activeFilter === "new"}
                  onClick={() => setActiveFilter("new")}
                  icon={<Sparkles size={14} />}
                  label="New"
                />

                <MarketFilter
                  active={activeFilter === "long"}
                  onClick={() => setActiveFilter("long")}
                  icon={<Clock3 size={14} />}
                  label="Long-term"
                />

              </div>

              {/* campaign cards */}
              <div className="space-y-4">

                {filteredCampaigns.map((campaign) => (

                  <button
                    key={campaign.id}
                    onClick={() => setSelectedCampaign(campaign)}
                    className="group w-full rounded-[28px] border border-black/10 bg-white p-5 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                  >

                    <div className="flex flex-col gap-5 md:flex-row">

                      {/* visual */}
                      <div
                        className={`relative h-36 overflow-hidden rounded-2xl bg-gradient-to-br ${campaign.color} md:w-44`}
                      >

                        <div className="absolute inset-0 bg-black/10" />

                        <div className="absolute left-4 top-4 rounded-full bg-black/30 px-3 py-1 text-[9px] font-black text-white backdrop-blur">
                          {campaign.tag}
                        </div>

                        <div className="absolute bottom-4 left-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black">
                          <Play fill="black" size={15} />
                        </div>

                      </div>

                      {/* content */}
                      <div className="flex-1">

                        <div className="flex items-start justify-between gap-4">

                          <div>

                            <div className="flex items-center gap-2">

                              <h3 className="text-lg font-black">
                                {campaign.title}
                              </h3>

                              <BadgeCheck
                                size={16}
                                className="text-blue-500"
                                fill="currentColor"
                              />

                            </div>

                            <p className="mt-1 text-xs font-bold text-black/40">
                              {campaign.brand} · {campaign.category}
                            </p>

                          </div>

                          <div className="rounded-xl bg-emerald-50 px-3 py-2 text-right">
                            <p className="text-[9px] font-black text-emerald-600">
                              MATCH
                            </p>
                            <p className="text-lg font-black text-emerald-600">
                              {campaign.match}%
                            </p>
                          </div>

                        </div>

                        <div className="mt-5 grid grid-cols-3 gap-3">

                          <MarketplaceMetric
                            label="Videos"
                            value={`${campaign.videos}`}
                          />

                          <MarketplaceMetric
                            label="Per clip"
                            value={`₹${campaign.reward}`}
                          />

                          <MarketplaceMetric
                            label="Bonus"
                            value={`₹${campaign.bonus.toLocaleString()}`}
                          />

                        </div>

                        <div className="mt-4 flex items-center justify-between">

                          <span className="text-xs font-bold text-black/40">
                            Deadline: {campaign.deadline}
                          </span>

                          <span className="flex items-center gap-1 text-xs font-black text-purple-600 transition group-hover:gap-2">
                            View campaign
                            <ArrowUpRight size={14} />
                          </span>

                        </div>

                      </div>

                    </div>

                  </button>

                ))}

              </div>

            </div>

          </div>

        </div>
      </section>


      {/* =====================================================
          HOW IT WORKS
      ===================================================== */}

      <section className="bg-white px-6 py-28 text-black">

        <div className="mx-auto max-w-7xl">

          <div className="mx-auto max-w-3xl text-center">

            <p className="text-xs font-black tracking-[0.2em] text-purple-600">
              SIMPLE WORKFLOW
            </p>

            <h2 className="mt-4 text-5xl font-black tracking-[-0.05em] md:text-7xl">
              From raw footage
              <br />
              to <span className="text-purple-600">revenue.</span>
            </h2>

          </div>

          <div className="mt-16 grid gap-4 md:grid-cols-5">

            <WorkflowCard
              number="01"
              icon={<SearchIcon />}
              title="Find"
              text="Choose a campaign from the axonnn marketplace."
            />

            <WorkflowCard
              number="02"
              icon={<DownloadIcon />}
              title="Get Content"
              text="Access approved source videos from the campaign."
            />

            <WorkflowCard
              number="03"
              icon={<Scissors />}
              title="Create"
              text="Turn long-form footage into engaging short clips."
            />

            <WorkflowCard
              number="04"
              icon={<Upload />}
              title="Publish"
              text="Post your clips and submit them to axonnn."
            />

            <WorkflowCard
              number="05"
              icon={<Wallet />}
              title="Earn"
              text="Track performance and receive your rewards."
              highlight
            />

          </div>

        </div>
      </section>


      {/* =====================================================
          PERFORMANCE → MONEY
      ===================================================== */}

      <section className="bg-[#0B0A1F] px-6 py-28">

        <div className="mx-auto max-w-7xl">

          <div className="grid items-center gap-14 lg:grid-cols-2">

            <div>

              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-4 py-2 text-xs font-black text-emerald-300">
                <TrendingUp size={14} />
                PERFORMANCE → MONEY
              </div>

              <h2 className="text-5xl font-black leading-[0.9] tracking-[-0.05em] md:text-7xl">
                Your edits
                <br />
                perform.
                <br />

                <span className="text-emerald-300">
                  You earn.
                </span>
              </h2>

              <p className="mt-7 max-w-lg text-base font-medium leading-7 text-white/45">
                axonnn tracks the performance of your submitted clips and
                connects results to campaign rewards and bonuses.
              </p>

            </div>


            {/* performance card */}
            <div className="rounded-[35px] border border-white/10 bg-white/[0.04] p-5">

              <div className="rounded-[28px] bg-white p-6 text-black">

                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-xs font-black text-black/40">
                      CAMPAIGN PERFORMANCE
                    </p>

                    <h3 className="mt-1 text-2xl font-black">
                      Podcast Moments
                    </h3>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                    <BarChart3 size={20} />
                  </div>

                </div>

                <div className="mt-7 grid grid-cols-3 gap-3">

                  <PerformanceStat
                    label="Views"
                    value="82.4K"
                    growth="+42%"
                  />

                  <PerformanceStat
                    label="Engagement"
                    value="8.7%"
                    growth="+18%"
                  />

                  <PerformanceStat
                    label="Shares"
                    value="3.2K"
                    growth="+31%"
                  />

                </div>

                <div className="mt-5 rounded-2xl bg-emerald-50 p-5">

                  <div className="flex items-center justify-between">

                    <div>
                      <p className="text-xs font-black text-emerald-600">
                        CLIP REWARD
                      </p>

                      <p className="mt-1 text-3xl font-black">
                        ₹700
                      </p>
                    </div>

                    <div className="rounded-xl bg-emerald-500 px-3 py-2 text-xs font-black text-white">
                      APPROVED
                    </div>

                  </div>

                </div>

                <div className="mt-3 rounded-2xl bg-orange-50 p-5">

                  <div className="flex items-center justify-between">

                    <div>
                      <p className="text-xs font-black text-orange-600">
                        PERFORMANCE BONUS
                      </p>

                      <p className="mt-1 text-2xl font-black">
                        +₹5,000
                      </p>
                    </div>

                    <Flame className="text-orange-500" />

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          EARN MONTHLY
      ===================================================== */}

      <section
        id="earn-monthly"
        className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 px-6 py-28"
      >

        <div className="pointer-events-none absolute right-[-100px] top-[-100px] h-[400px] w-[400px] rounded-full bg-white/20 blur-[100px]" />

        <div className="relative mx-auto max-w-7xl">

          <div className="grid items-center gap-12 lg:grid-cols-2">

            {/* heading */}
            <div>

              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-black/20 px-4 py-2 text-xs font-black backdrop-blur">
                <Wallet size={14} />
                EARN MONTHLY
              </div>

              <h2 className="text-5xl font-black leading-[0.88] tracking-[-0.05em] md:text-7xl">
                Make clipping
                <br />
                a monthly
                <br />
                income stream.
              </h2>

              <p className="mt-7 max-w-lg text-base font-medium leading-7 text-white/70">
                The more quality clips you create and the better they perform,
                the more opportunities you can unlock.
              </p>

            </div>


            {/* calculator */}
            <div className="rounded-[35px] bg-black p-6 shadow-2xl md:p-8">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-white/40">
                    Monthly Calculator
                  </p>

                  <h3 className="mt-1 text-2xl font-black">
                    Your potential
                  </h3>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400 text-black">
                  <DollarSign />
                </div>

              </div>

              <div className="mt-8">

                <div className="flex items-end justify-between">

                  <div>
                    <p className="text-xs font-bold text-white/40">
                      CLIPS PER MONTH
                    </p>

                    <p className="mt-1 text-5xl font-black text-white">
                      {clipsPerMonth}
                    </p>
                  </div>

                  <p className="text-sm font-black text-purple-300">
                    ₹700 average / clip
                  </p>

                </div>

                <input
                  type="range"
                  min="10"
                  max="60"
                  step="5"
                  value={clipsPerMonth}
                  onChange={(e) =>
                    setClipsPerMonth(Number(e.target.value))
                  }
                  className="mt-7 w-full accent-purple-400"
                />

                <div className="mt-2 flex justify-between text-[10px] font-bold text-white/30">
                  <span>10</span>
                  <span>30</span>
                  <span>60</span>
                </div>

              </div>

              <div className="mt-8 space-y-3">

                <EarningRow
                  label="Clip earnings"
                  value={`₹${baseEarning.toLocaleString()}`}
                />

                <EarningRow
                  label="Performance bonuses"
                  value={`₹${performanceBonus.toLocaleString()}`}
                  green
                />

              </div>

              <div className="mt-5 border-t border-white/10 pt-5">

                <div className="flex items-end justify-between">

                  <div>
                    <p className="text-xs font-black text-white/40">
                      POTENTIAL MONTHLY EARNINGS
                    </p>

                    <p className="mt-1 text-4xl font-black text-emerald-300">
                      ₹{totalPotential.toLocaleString()}
                    </p>
                  </div>

                  <TrendingUp className="mb-2 text-emerald-300" />

                </div>

              </div>

              <p className="mt-5 text-[10px] leading-4 text-white/30">
                Example calculation for illustration only. Actual earnings
                depend on campaign terms, approved clips and performance.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          GROWTH
      ===================================================== */}

      <section className="bg-[#f7f7f8] px-6 py-28 text-black">

        <div className="mx-auto max-w-7xl">

          <div className="mx-auto max-w-3xl text-center">

            <p className="text-xs font-black tracking-[0.2em] text-purple-600">
              CLIPPER GROWTH
            </p>

            <h2 className="mt-4 text-5xl font-black tracking-[-0.05em] md:text-7xl">
              Better clips.
              <br />
              <span className="text-purple-600">
                Better opportunities.
              </span>
            </h2>

          </div>

          <div className="mt-16 grid gap-5 md:grid-cols-3">

            <GrowthCard
              icon={<Star />}
              number="01"
              title="Build your score"
              text="Your clip quality, consistency and campaign performance help build your axonnn Clipper Score."
              bg="bg-yellow-100"
              iconBg="bg-yellow-400"
            />

            <GrowthCard
              icon={<TrendingUp />}
              number="02"
              title="Unlock better campaigns"
              text="As your performance improves, axonnn can surface higher-value opportunities that match your skills."
              bg="bg-emerald-100"
              iconBg="bg-emerald-400"
            />

            <GrowthCard
              icon={<Zap />}
              number="03"
              title="Increase your income"
              text="Higher-value campaigns and performance bonuses can help you turn clipping into recurring income."
              bg="bg-purple-100"
              iconBg="bg-purple-500"
            />

          </div>

        </div>

      </section>


      {/* =====================================================
          SAFETY
      ===================================================== */}

      <section className="bg-white px-6 py-28 text-black">

        <div className="mx-auto max-w-6xl">

          <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">

            <div>

              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-xs font-black text-emerald-700">
                <ShieldCheck size={14} />
                BUILT FOR TRUST
              </div>

              <h2 className="text-5xl font-black leading-[0.9] tracking-[-0.05em] md:text-6xl">
                Know what
                <br />
                you're getting
                <br />
                <span className="text-emerald-500">
                  paid for.
                </span>
              </h2>

              <p className="mt-7 max-w-md text-base font-medium leading-7 text-black/50">
                axonnn keeps campaign requirements, submissions, performance and
                earnings visible throughout the clipping process.
              </p>

            </div>

            <div className="grid gap-4 sm:grid-cols-2">

              <SafetyItem
                icon={<Check />}
                title="Clear campaign rules"
                text="Know exactly what content and format the campaign requires."
              />

              <SafetyItem
                icon={<Wallet />}
                title="Transparent earnings"
                text="See clip rewards, bonuses and payment status in one place."
              />

              <SafetyItem
                icon={<BarChart3 />}
                title="Performance tracking"
                text="Understand how your clips are performing after publishing."
              />

              <SafetyItem
                icon={<ShieldCheck />}
                title="Submission history"
                text="Keep a clear record of campaigns, clips and approved work."
              />

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          FINAL CTA
      ===================================================== */}

      <section className="relative overflow-hidden bg-[#0B0A1F] px-6 py-32 text-center">

        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-600/20 blur-[120px]" />

        <div className="relative mx-auto max-w-4xl">

          <Scissors
            className="mx-auto text-purple-400"
            size={38}
          />

          <h2 className="mt-7 text-6xl font-black leading-[0.9] tracking-[-0.06em] md:text-8xl">
            Ready to turn
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-300 bg-clip-text text-transparent">
              clips into income?
            </span>
          </h2>

          <p className="mx-auto mt-7 max-w-xl text-base font-medium leading-7 text-white/40">
            Join axonnn and start discovering clipping opportunities built for
            your editing skills.
          </p>

          <a
            href="#join"
            onClick={(e) => {
              e.preventDefault();
              setShowJoin(true);
            }}
            className="mt-9 inline-flex items-center gap-3 rounded-2xl bg-white px-7 py-4 text-sm font-black text-black transition hover:-translate-y-1 hover:shadow-2xl"
          >
            Become an axonnn Clipper
            <ArrowRight size={17} />
          </a>

        </div>

      </section>


      {/* =====================================================
          CAMPAIGN MODAL
      ===================================================== */}

      {selectedCampaign && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-5 backdrop-blur-md"
          onClick={() => setSelectedCampaign(null)}
        >

          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[32px] bg-white p-6 text-black shadow-2xl"
          >

            <button
              onClick={() => setSelectedCampaign(null)}
              className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-black/5 text-xl font-black transition hover:bg-black/10"
            >
              ×
            </button>

            <div
              className={`h-44 rounded-3xl bg-gradient-to-br ${selectedCampaign.color} p-5`}
            >

              <div className="flex h-full items-end">

                <div>

                  <div className="mb-2 inline-flex rounded-full bg-black/30 px-3 py-1 text-[10px] font-black text-white">
                    {selectedCampaign.tag}
                  </div>

                  <h3 className="text-3xl font-black text-white">
                    {selectedCampaign.title}
                  </h3>

                </div>

              </div>

            </div>

            <div className="mt-6">

              <p className="text-xs font-black uppercase tracking-widest text-black/40">
                Campaign by
              </p>

              <h4 className="mt-1 text-xl font-black">
                {selectedCampaign.brand}
              </h4>

              <div className="mt-6 grid grid-cols-2 gap-3">

                <ModalStat
                  label="Reward / clip"
                  value={`₹${selectedCampaign.reward}`}
                />

                <ModalStat
                  label="Viral bonus"
                  value={`₹${selectedCampaign.bonus.toLocaleString()}`}
                />

                <ModalStat
                  label="Source videos"
                  value={`${selectedCampaign.videos}`}
                />

                <ModalStat
                  label="Your match"
                  value={`${selectedCampaign.match}%`}
                />

              </div>

              <div className="mt-6 rounded-2xl bg-purple-50 p-5">

                <div className="flex items-start gap-3">

                  <Sparkles
                    className="mt-1 text-purple-600"
                    size={18}
                  />

                  <div>

                    <p className="text-sm font-black">
                      Why this campaign?
                    </p>

                    <p className="mt-2 text-sm font-medium leading-6 text-black/50">
                      axonnn matched this campaign with your editing style,
                      category and previous performance.
                    </p>

                  </div>

                </div>

              </div>

              <button
                onClick={() => setSelectedCampaign(null)}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-black py-4 text-sm font-black text-white transition hover:bg-purple-600"
              >
                Start Clipping
                <ArrowRight size={16} />
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


/* =========================================================
   COMPONENTS
========================================================= */

function HeroStat({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div>
      <p className="text-2xl font-black">{value}</p>
      <p className="mt-1 text-xs font-bold text-white/35">{label}</p>
    </div>
  );
}


function MarketFilter({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black transition ${
        active
          ? "bg-black text-white"
          : "border border-black/10 bg-white hover:-translate-y-0.5"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}


function MarketplaceMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-black/[0.04] p-3">
      <p className="text-[9px] font-bold text-black/35">
        {label}
      </p>

      <p className="mt-1 text-sm font-black">
        {value}
      </p>
    </div>
  );
}


function WorkflowCard({
  number,
  icon,
  title,
  text,
  highlight = false,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  text: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`group rounded-[28px] border p-5 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${
        highlight
          ? "border-emerald-200 bg-emerald-50"
          : "border-black/10 bg-[#f7f7f8]"
      }`}
    >

      <div className="flex items-center justify-between">

        <span className="text-xs font-black text-black/25">
          {number}
        </span>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            highlight
              ? "bg-emerald-400 text-black"
              : "bg-black text-white"
          }`}
        >
          {icon}
        </div>

      </div>

      <h3 className="mt-8 text-xl font-black">
        {title}
      </h3>

      <p className="mt-3 text-xs font-medium leading-5 text-black/45">
        {text}
      </p>

    </div>
  );
}


function PerformanceStat({
  label,
  value,
  growth,
}: {
  label: string;
  value: string;
  growth: string;
}) {
  return (
    <div className="rounded-2xl bg-black/[0.04] p-4">

      <p className="text-[9px] font-bold text-black/35">
        {label}
      </p>

      <p className="mt-1 text-xl font-black">
        {value}
      </p>

      <p className="mt-1 text-[9px] font-black text-emerald-600">
        {growth}
      </p>

    </div>
  );
}


function EarningRow({
  label,
  value,
  green = false,
}: {
  label: string;
  value: string;
  green?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-4">

      <span className="text-sm font-bold text-white/50">
        {label}
      </span>

      <span
        className={`text-lg font-black ${
          green ? "text-emerald-300" : "text-white"
        }`}
      >
        {value}
      </span>

    </div>
  );
}


function GrowthCard({
  icon,
  number,
  title,
  text,
  bg,
  iconBg,
}: {
  icon: React.ReactNode;
  number: string;
  title: string;
  text: string;
  bg: string;
  iconBg: string;
}) {
  return (
    <div
      className={`rounded-[30px] p-7 ${bg} transition-all duration-300 hover:-translate-y-2 hover:shadow-xl`}
    >

      <div className="flex items-center justify-between">

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${iconBg} text-black`}
        >
          {icon}
        </div>

        <span className="text-sm font-black text-black/25">
          {number}
        </span>

      </div>

      <h3 className="mt-12 text-2xl font-black">
        {title}
      </h3>

      <p className="mt-3 text-sm font-medium leading-6 text-black/50">
        {text}
      </p>

    </div>
  );
}


function SafetyItem({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[25px] border border-black/10 bg-[#f7f7f8] p-6 transition hover:-translate-y-1 hover:shadow-lg">

      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400 text-black">
        {icon}
      </div>

      <h3 className="mt-6 text-lg font-black">
        {title}
      </h3>

      <p className="mt-2 text-sm font-medium leading-6 text-black/45">
        {text}
      </p>

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
    <div className="rounded-2xl bg-black/[0.04] p-4">

      <p className="text-[10px] font-bold text-black/35">
        {label}
      </p>

      <p className="mt-1 text-xl font-black">
        {value}
      </p>

    </div>
  );
}


/* =========================================================
   SMALL ICONS
========================================================= */

function SearchIcon() {
  return <Users size={18} />;
}

function DownloadIcon() {
  return <Play size={18} />;
}