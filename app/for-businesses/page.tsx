"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  DollarSign,
  Filter,
  Lightbulb,
  Play,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  X,
  Zap,
} from "lucide-react";
import { FaFacebook, FaInstagram, FaYoutube} from "react-icons/fa";
import Navbar from "../ui/Navbar";
import JoinModal from "../ui/JoinModal";

/* =========================================================
   TYPES
========================================================= */

type Creator = {
  id: number;
  name: string;
  handle: string;
  niche: string;
  location: string;
  followers: string;
  engagement: string;
  reach: string;
  match: number;
  price: number;
  color: string;
  initials: string;
};

type CampaignStage =
  | "Brief"
  | "Creators"
  | "Invited"
  | "Content"
  | "Approval"
  | "Published"
  | "Results";

/* =========================================================
   DATA
========================================================= */

const creators: Creator[] = [
  {
    id: 1,
    name: "Aarav Mehta",
    handle: "@aaravstyle",
    niche: "Fashion",
    location: "Delhi NCR",
    followers: "420K",
    engagement: "8.9%",
    reach: "310K",
    match: 96,
    price: 45000,
    color: "from-blue-500 to-cyan-400",
    initials: "AM",
  },
  {
    id: 2,
    name: "Riya Kapoor",
    handle: "@riyafit",
    niche: "Fitness",
    location: "Mumbai",
    followers: "285K",
    engagement: "10.4%",
    reach: "248K",
    match: 94,
    price: 32000,
    color: "from-lime-400 to-emerald-500",
    initials: "RK",
  },
  {
    id: 3,
    name: "Kabir Singh",
    handle: "@kabirtech",
    niche: "Technology",
    location: "Bengaluru",
    followers: "510K",
    engagement: "7.6%",
    reach: "420K",
    match: 91,
    price: 55000,
    color: "from-purple-500 to-violet-400",
    initials: "KS",
  },
  {
    id: 4,
    name: "Ananya Rao",
    handle: "@ananyalife",
    niche: "Lifestyle",
    location: "Gurugram",
    followers: "190K",
    engagement: "9.7%",
    reach: "170K",
    match: 89,
    price: 26000,
    color: "from-pink-500 to-rose-400",
    initials: "AR",
  },
];

/* =========================================================
   MAIN PAGE
========================================================= */

export default function ForBusinessesPage() {
  const [showJoin, setShowJoin] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [activeStage, setActiveStage] =
    useState<CampaignStage>("Content");

  const [selectedCreators, setSelectedCreators] = useState<number[]>([1, 2]);

  const [budget, setBudget] = useState(500000);

  const [discoveryNiche, setDiscoveryNiche] = useState("Fashion");

  const [platform, setPlatform] = useState<
    "All" | "Instagram" | "YouTube" | "Facebook"
  >("All");

  const estimatedResults = useMemo(() => {
    const multiplier = budget / 500000;

    return {
      reach: (12.8 * multiplier).toFixed(1),
      views: (8.4 * multiplier).toFixed(1),
      engagement: Math.round(24600 * multiplier).toLocaleString(),
      conversions: Math.round(1240 * multiplier).toLocaleString(),
    };
  }, [budget]);

  return (
    <>
    <main id="businesses" className="min-h-screen overflow-hidden bg-[#070611] text-white">
        <Navbar />
      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute left-[8%] top-[5%] h-[420px] w-[420px] rounded-full bg-purple-600/15 blur-[140px]" />
        <div className="absolute right-[5%] top-[18%] h-[420px] w-[420px] rounded-full bg-blue-500/15 blur-[150px]" />
        <div className="absolute left-[35%] top-[55%] h-[500px] w-[500px] rounded-full bg-lime-400/10 blur-[170px]" />

        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(#ffffff_1px,transparent_1px)] [background-size:38px_38px]" />
      </div>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-24 pt-32 lg:px-10 lg:pt-40">
        <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-400/10 px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-blue-300">
              <Sparkles size={14} />
              axonnn FOR BUSINESSES
            </div>

            <h1 className="max-w-4xl text-6xl font-black leading-[0.9] tracking-[-0.06em] sm:text-7xl lg:text-[88px]">
              Your next campaign
              <span className="block text-blue-400">starts with the</span>
              <span className="block text-lime-300">right creator.</span>
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-8 text-white/60 sm:text-xl">
              Discover creators who match your brand, manage campaigns from
              one workspace, and measure exactly what your creator marketing
              delivers.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <a
                href="#find-creators"
                className="group flex items-center gap-3 rounded-2xl bg-white px-6 py-4 font-black text-black transition hover:-translate-y-1"
              >
                Find Creators
                <ArrowRight
                  size={18}
                  className="transition group-hover:translate-x-1"
                />
              </a>

              <a
                href="#campaign"
                className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/5 px-6 py-4 font-bold text-white backdrop-blur-xl transition hover:bg-white/10"
              >
                Build a Campaign
              </a>
            </div>

            <div className="mt-12 grid max-w-xl grid-cols-3 gap-4">
              <HeroStat value="250K+" label="Creators" />
              <HeroStat value="4.8×" label="Avg ROI" />
              <HeroStat value="24/7" label="Campaigns" />
            </div>
          </div>

          {/* HERO DASHBOARD */}

          <div className="relative">
            <div className="absolute -inset-8 rounded-[50px] bg-blue-500/10 blur-3xl" />

            <div className="relative rounded-[34px] border border-white/10 bg-[#11101d]/90 p-5 shadow-2xl backdrop-blur-2xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-white/40">
                    Campaign overview
                  </p>
                  <h3 className="mt-1 text-xl font-black">
                    Summer Drop 2026
                  </h3>
                </div>

                <div className="rounded-xl bg-lime-300 px-3 py-2 text-xs font-black text-black">
                  LIVE
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <DashboardBox
                  icon={<Users size={18} />}
                  label="Creators"
                  value="24"
                  color="blue"
                />
                <DashboardBox
                  icon={<TrendingUp size={18} />}
                  label="Reach"
                  value="12.8M"
                  color="lime"
                />
                <DashboardBox
                  icon={<Play size={18} />}
                  label="Views"
                  value="8.4M"
                  color="purple"
                />
                <DashboardBox
                  icon={<DollarSign size={18} />}
                  label="ROI"
                  value="3.8×"
                  color="yellow"
                />
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm font-bold text-white/50">
                    Campaign progress
                  </span>
                  <span className="font-black text-blue-300">72%</span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-blue-500 to-lime-300" />
                </div>

                <div className="mt-4 flex justify-between text-xs text-white/40">
                  <span>Creators</span>
                  <span>Content</span>
                  <span>Approval</span>
                  <span>Results</span>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 p-5">
                <div className="flex gap-3">
                  <div className="rounded-xl bg-yellow-300 p-2 text-black">
                    <Lightbulb size={18} />
                  </div>

                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-yellow-300">
                      axonnn Intelligence
                    </p>

                    <p className="mt-2 text-sm leading-6 text-white/75">
                      Micro-creators are generating{" "}
                      <strong className="text-white">2.1× higher</strong>{" "}
                      engagement than your previous campaign.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <FloatingBadge
              className="left-[-25px] top-[18%]"
              title="Creator matched"
              value="96%"
              icon={<Target size={16} />}
            />

            <FloatingBadge
              className="bottom-[12%] right-[-25px]"
              title="Campaign ROI"
              value="+34%"
              icon={<TrendingUp size={16} />}
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          FIND CREATOR
      ===================================================== */}

      <section
        id="find-creators"
        className="relative z-10 bg-white py-28 text-black"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <SectionHeading
            eyebrow="01 — FIND CREATOR"
            title={
              <>
                Stop searching.
                <span className="block text-blue-600">Start matching.</span>
              </>
            }
            description="axonnn's creator discovery engine helps businesses find creators based on audience fit, niche, location, engagement, campaign goals and budget."
          />

          <div className="mt-16 grid gap-8 lg:grid-cols-[360px_1fr]">
            {/* SEARCH PANEL */}

            <div className="rounded-[30px] bg-[#090815] p-7 text-white shadow-xl">
              <div className="mb-8">
                <div className="mb-2 flex items-center gap-2 text-sm font-black uppercase tracking-wider text-blue-300">
                  <Sparkles size={16} />
                  AI Discovery
                </div>

                <h3 className="text-2xl font-black">
                  Find your perfect creators.
                </h3>
              </div>

              <div className="space-y-5">
                <SelectField
                  label="Campaign Goal"
                  value="Increase awareness"
                />

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-white/40">
                    Category
                  </label>

                  <select
                    value={discoveryNiche}
                    onChange={(e) => setDiscoveryNiche(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold outline-none"
                  >
                    <option className="bg-[#11101d]">Fashion</option>
                    <option className="bg-[#11101d]">Fitness</option>
                    <option className="bg-[#11101d]">Technology</option>
                    <option className="bg-[#11101d]">Lifestyle</option>
                  </select>
                </div>

                <SelectField label="Location" value="Delhi NCR" />

                <SelectField label="Audience" value="18–34 years" />

                <div>
                  <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-white/40">
                    Budget
                  </label>

                  <input
                    type="range"
                    min="25000"
                    max="1000000"
                    step="25000"
                    defaultValue="250000"
                    className="w-full accent-blue-500"
                  />

                  <div className="mt-2 flex justify-between text-xs text-white/40">
                    <span>₹25K</span>
                    <span>₹10L+</span>
                  </div>
                </div>

                <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 py-4 font-black transition hover:bg-blue-400">
                  <Search size={18} />
                  Find Creators
                </button>
              </div>
            </div>

            {/* CREATOR RESULTS */}

            <div>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-black/40">
                    AI matched creators
                  </p>

                  <h3 className="text-3xl font-black">
                    128 creators found
                  </h3>
                </div>

                <button className="flex items-center gap-2 rounded-xl border border-black/10 px-4 py-3 text-sm font-bold">
                  <Filter size={16} />
                  Filters
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {creators.map((creator) => (
                  <CreatorResult
                    key={creator.id}
                    creator={creator}
                    onClick={() => setSelectedCreator(creator)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CAMPAIGN MANAGEMENT
      ===================================================== */}

      <section
        id="campaign"
        className="relative z-10 bg-[#0d0b19] py-28"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <SectionHeading
            dark
            eyebrow="02 — CAMPAIGN MANAGEMENT"
            title={
              <>
                From brief
                <span className="text-orange-400"> to results.</span>
              </>
            }
            description="Run your entire creator campaign from one workspace — creators, deliverables, approvals, deadlines and payments."
          />

          <div className="mt-16 overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.03]">
            {/* PIPELINE */}

            <div className="overflow-x-auto border-b border-white/10 p-5">
              <div className="flex min-w-max gap-2">
                {(
                  [
                    "Brief",
                    "Creators",
                    "Invited",
                    "Content",
                    "Approval",
                    "Published",
                    "Results",
                  ] as CampaignStage[]
                ).map((stage, index) => (
                  <button
                    key={stage}
                    onClick={() => setActiveStage(stage)}
                    className={`group flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-black transition ${
                      activeStage === stage
                        ? "bg-orange-400 text-black"
                        : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <span className="text-xs opacity-50">
                      0{index + 1}
                    </span>
                    {stage}

                    {index < 6 && (
                      <ChevronRight size={14} className="opacity-30" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* CAMPAIGN BODY */}

            <div className="grid lg:grid-cols-[1fr_330px]">
              <div className="p-7 lg:p-10">
                <div className="flex flex-wrap items-start justify-between gap-5">
                  <div>
                    <div className="mb-3 inline-flex rounded-full bg-orange-400/10 px-3 py-1 text-xs font-black text-orange-300">
                      LIVE CAMPAIGN
                    </div>

                    <h3 className="text-3xl font-black">
                      Summer Drop 2026
                    </h3>

                    <p className="mt-2 text-sm text-white/40">
                      Fashion • India • Brand Awareness
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
                    <p className="text-xs font-bold text-white/40">
                      CAMPAIGN BUDGET
                    </p>
                    <p className="mt-1 text-2xl font-black">
                      ₹2,50,000
                    </p>
                  </div>
                </div>

                <div className="mt-10 grid gap-4 sm:grid-cols-4">
                  <CampaignMetric
                    value="38"
                    label="Invited"
                    icon={<Users size={17} />}
                  />
                  <CampaignMetric
                    value="24"
                    label="Accepted"
                    icon={<Check size={17} />}
                  />
                  <CampaignMetric
                    value="19"
                    label="Submitted"
                    icon={<Play size={17} />}
                  />
                  <CampaignMetric
                    value="11"
                    label="Completed"
                    icon={<TrendingUp size={17} />}
                  />
                </div>

                <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-5">
                  <div className="mb-5 flex items-center justify-between">
                    <span className="font-bold text-white/60">
                      Current stage
                    </span>

                    <span className="rounded-lg bg-orange-400/10 px-3 py-1 text-xs font-black text-orange-300">
                      {activeStage}
                    </span>
                  </div>

                  <CampaignStageContent stage={activeStage} />
                </div>
              </div>

              {/* RIGHT PANEL */}

              <div className="border-t border-white/10 bg-black/20 p-7 lg:border-l lg:border-t-0">
                <p className="text-xs font-black uppercase tracking-wider text-white/30">
                  Campaign controls
                </p>

                <div className="mt-5 space-y-3">
                  <ControlItem icon={<Users size={17} />} text="Manage creators" />
                  <ControlItem icon={<Target size={17} />} text="Set deliverables" />
                  <ControlItem icon={<Clock3 size={17} />} text="Track deadlines" />
                  <ControlItem icon={<Check size={17} />} text="Approve content" />
                  <ControlItem icon={<DollarSign size={17} />} text="Manage payments" />
                </div>

                <button className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 font-black text-black">
                  Open Campaign
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          ANALYTICS
      ===================================================== */}

      <section
        id="campaign-analytics"
        className="relative z-10 bg-[#f3f8ed] py-28 text-black"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <SectionHeading
            eyebrow="03 — CAMPAIGN ANALYTICS"
            title={
              <>
                Don't just run campaigns.
                <span className="block text-emerald-600">
                  Know what worked.
                </span>
              </>
            }
            description="Turn creator activity into business intelligence with reach, views, engagement, conversions, creator performance and ROI."
          />

          {/* PLATFORM SWITCHER */}

          <div className="mt-12 flex flex-wrap gap-2 rounded-2xl border border-black/10 bg-white p-2 shadow-sm">
            {(["All", "Instagram", "YouTube", "Facebook"] as const).map(
              (item) => (
                <button
                  key={item}
                  onClick={() => setPlatform(item)}
                  className={`rounded-xl px-5 py-3 text-sm font-black transition ${
                    platform === item
                      ? "bg-black text-white"
                      : "text-black/50 hover:bg-black/5 hover:text-black"
                  }`}
                >
                  {item}
                </button>
              ),
            )}
          </div>

          {/* ANALYTICS DASHBOARD */}

          <div className="mt-8 rounded-[34px] bg-white p-6 shadow-xl lg:p-9">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-black/35">
                  Campaign analytics
                </p>
                <h3 className="mt-2 text-3xl font-black">
                  Summer Drop Performance
                </h3>
              </div>

              <div className="rounded-xl bg-emerald-100 px-4 py-2 text-sm font-black text-emerald-700">
                {platform}
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <AnalyticsMetric
                title="Total Reach"
                value="12.8M"
                growth="+34%"
                icon={<Users size={20} />}
              />

              <AnalyticsMetric
                title="Total Views"
                value="8.4M"
                growth="+47%"
                icon={<Play size={20} />}
              />

              <AnalyticsMetric
                title="Engagement"
                value="7.9%"
                growth="+18%"
                icon={<TrendingUp size={20} />}
              />

              <AnalyticsMetric
                title="Conversions"
                value="24.6K"
                growth="+29%"
                icon={<Target size={20} />}
              />
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
              {/* CHART */}

              <div className="rounded-2xl bg-[#f5f5f7] p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-black/40">
                      Performance
                    </p>
                    <h4 className="mt-1 text-xl font-black">
                      Reach & engagement
                    </h4>
                  </div>

                  <BarChart3 size={22} />
                </div>

                <div className="mt-8 flex h-56 items-end gap-3">
                  {[35, 48, 42, 63, 55, 76, 68, 92, 78, 96, 87, 100].map(
                    (height, index) => (
                      <div
                        key={index}
                        className="group relative flex-1"
                      >
                        <div
                          style={{ height: `${height}%` }}
                          className="absolute bottom-0 w-full rounded-t-xl bg-gradient-to-t from-blue-500 to-emerald-300 transition group-hover:from-purple-500 group-hover:to-pink-400"
                        />

                        {index === 11 && (
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded-lg bg-black px-2 py-1 text-[10px] font-bold text-white">
                            12.8M
                          </div>
                        )}
                      </div>
                    ),
                  )}
                </div>

                <div className="mt-4 flex justify-between text-xs font-bold text-black/30">
                  <span>W1</span>
                  <span>W2</span>
                  <span>W3</span>
                  <span>W4</span>
                </div>
              </div>

              {/* TOP CREATORS */}

              <div className="rounded-2xl bg-[#0b0a15] p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-white/30">
                      Top performers
                    </p>
                    <h4 className="mt-1 text-xl font-black">
                      Creator ROI
                    </h4>
                  </div>

                  <TrendingUp className="text-lime-300" size={21} />
                </div>

                <div className="mt-6 space-y-4">
                  {[
                    ["@riyafit", "4.8×", "96%"],
                    ["@aaravstyle", "4.4×", "92%"],
                    ["@kabirtech", "3.9×", "88%"],
                    ["@ananyalife", "3.4×", "82%"],
                  ].map(([name, roi, score]) => (
                    <div
                      key={name}
                      className="flex items-center gap-3 rounded-xl bg-white/5 p-3"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-xs font-black">
                        {name[1]?.toUpperCase()}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-black">
                          {name}
                        </p>
                        <p className="text-xs text-white/35">
                          Match {score}
                        </p>
                      </div>

                      <p className="font-black text-lime-300">{roi}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          axonnn INTELLIGENCE
      ===================================================== */}

      <section className="relative z-10 bg-[#090815] py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="overflow-hidden rounded-[38px] border border-purple-400/20 bg-gradient-to-br from-purple-700/20 via-blue-700/10 to-lime-400/10 p-7 lg:p-12">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-yellow-300 px-4 py-2 text-xs font-black uppercase tracking-wider text-black">
                  <Sparkles size={14} />
                  axonnn INTELLIGENCE
                </div>

                <h2 className="text-5xl font-black leading-[0.95] tracking-tight lg:text-7xl">
                  Numbers are useful.
                  <span className="block text-lime-300">
                    Insights are powerful.
                  </span>
                </h2>

                <p className="mt-7 max-w-xl text-lg leading-8 text-white/55">
                  axonnn doesn't just show your campaign data. It helps you
                  understand which creators, content and audiences are
                  actually driving results.
                </p>
              </div>

              <div className="space-y-4">
                <InsightCard
                  color="lime"
                  title="What worked"
                  text="Micro-creators generated 2.1× higher engagement."
                />

                <InsightCard
                  color="blue"
                  title="Who performed"
                  text="Creator B delivered the highest ROI at 4.8×."
                />

                <InsightCard
                  color="yellow"
                  title="What to do next"
                  text="Move 20% more budget toward high-conversion creators."
                />

                <InsightCard
                  color="pink"
                  title="Content insight"
                  text="20–35 second videos generated the strongest completion rate."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CREATOR COMPARISON
      ===================================================== */}

      <section className="relative z-10 bg-white py-28 text-black">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <SectionHeading
            eyebrow="COMPARE"
            title={
              <>
                Choose creators using
                <span className="text-purple-600"> data.</span>
              </>
            }
            description="Compare creators side by side before spending your campaign budget."
          />

          <div className="mt-14 overflow-x-auto rounded-[30px] border border-black/10 bg-white shadow-xl">
            <table className="w-full min-w-[760px] border-collapse">
              <thead>
                <tr className="border-b border-black/10 bg-black/[0.02]">
                  <th className="p-5 text-left text-xs font-black uppercase tracking-wider text-black/40">
                    Creator
                  </th>

                  {creators.slice(0, 3).map((creator) => (
                    <th key={creator.id} className="p-5 text-left">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${creator.color} text-xs font-black text-white`}
                        >
                          {creator.initials}
                        </div>

                        <div>
                          <p className="font-black">{creator.name}</p>
                          <p className="text-xs text-black/40">
                            {creator.handle}
                          </p>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                <ComparisonRow
                  label="Followers"
                  values={["420K", "285K", "510K"]}
                />

                <ComparisonRow
                  label="Engagement"
                  values={["8.9%", "10.4%", "7.6%"]}
                  highlight
                />

                <ComparisonRow
                  label="Average Reach"
                  values={["310K", "248K", "420K"]}
                />

                <ComparisonRow
                  label="axonnn Match"
                  values={["96%", "94%", "91%"]}
                  highlight
                />

                <ComparisonRow
                  label="Campaign Price"
                  values={["₹45K", "₹32K", "₹55K"]}
                />

                <ComparisonRow
                  label="Estimated ROI"
                  values={["4.4×", "4.8×", "3.9×"]}
                  highlight
                />
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* =====================================================
          BUDGET CALCULATOR
      ===================================================== */}

      <section className="relative z-10 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="mb-5 inline-flex rounded-full bg-white/15 px-4 py-2 text-xs font-black uppercase tracking-wider backdrop-blur">
                PLAN YOUR CAMPAIGN
              </div>

              <h2 className="text-5xl font-black leading-none lg:text-7xl">
                See where your
                <span className="block text-lime-300">
                  budget can go.
                </span>
              </h2>

              <p className="mt-6 max-w-xl text-lg leading-8 text-white/70">
                Adjust your campaign budget and visualize potential reach,
                views, engagement and conversions.
              </p>

              <div className="mt-10 rounded-3xl bg-black/20 p-6 backdrop-blur-xl">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-sm font-bold text-white/50">
                      CAMPAIGN BUDGET
                    </p>

                    <p className="mt-2 text-5xl font-black">
                      ₹{budget.toLocaleString("en-IN")}
                    </p>
                  </div>

                  <DollarSign size={34} className="text-lime-300" />
                </div>

                <input
                  type="range"
                  min="100000"
                  max="1000000"
                  step="50000"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="mt-8 w-full accent-lime-300"
                />

                <div className="mt-3 flex justify-between text-xs font-bold text-white/40">
                  <span>₹1L</span>
                  <span>₹10L</span>
                </div>
              </div>
            </div>

            <div className="rounded-[35px] bg-white p-7 text-black shadow-2xl lg:p-9">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-black/35">
                    Potential campaign output
                  </p>

                  <h3 className="mt-1 text-2xl font-black">
                    Estimated impact
                  </h3>
                </div>

                <Zap className="text-purple-600" />
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <ResultBox
                  label="Potential Reach"
                  value={`${estimatedResults.reach}M`}
                />

                <ResultBox
                  label="Potential Views"
                  value={`${estimatedResults.views}M`}
                />

                <ResultBox
                  label="Engagements"
                  value={estimatedResults.engagement}
                />

                <ResultBox
                  label="Conversions"
                  value={estimatedResults.conversions}
                />
              </div>

              <div className="mt-5 rounded-2xl bg-purple-50 p-5">
                <p className="text-xs font-black uppercase tracking-wider text-purple-600">
                  axonnn recommendation
                </p>

                <p className="mt-2 text-sm font-bold leading-6 text-black/65">
                  Allocate your budget across a mix of high-reach creators and
                  high-engagement micro-creators to balance awareness and
                  performance.
                </p>
              </div>

              <p className="mt-5 text-xs leading-5 text-black/35">
                Illustrative estimates only. Actual campaign performance
                depends on creators, content, audience, campaign terms and
                platform performance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          COMPLETE WORKFLOW
      ===================================================== */}

      <section className="relative z-10 bg-[#f7f7f8] py-28 text-black">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <SectionHeading
            eyebrow="THE axonnn BUSINESS LOOP"
            title={
              <>
                One platform.
                <span className="block text-blue-600">
                  The complete campaign.
                </span>
              </>
            }
            description="Everything your marketing team needs to discover, execute and scale creator campaigns."
          />

          <div className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Workflow
              number="01"
              title="Discover"
              text="Find creators matched to your campaign."
              icon={<Search size={24} />}
              className="bg-blue-500 text-white"
            />

            <Workflow
              number="02"
              title="Manage"
              text="Run briefs, content, approvals and payments."
              icon={<Target size={24} />}
              className="bg-orange-400 text-black"
            />

            <Workflow
              number="03"
              title="Measure"
              text="Track reach, views, engagement and ROI."
              icon={<BarChart3 size={24} />}
              className="bg-lime-300 text-black"
            />

            <Workflow
              number="04"
              title="Scale"
              text="Find winning creators and repeat what works."
              icon={<TrendingUp size={24} />}
              className="bg-purple-600 text-white"
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          CREATOR NETWORK
      ===================================================== */}

      <section className="relative z-10 bg-[#080712] py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-pink-400/10 px-4 py-2 text-xs font-black uppercase tracking-wider text-pink-300">
                <Users size={14} />
                YOUR CREATOR NETWORK
              </div>

              <h2 className="text-5xl font-black leading-[0.95] lg:text-7xl">
                Found creators
                <span className="block text-pink-400">
                  who actually work?
                </span>
              </h2>

              <p className="mt-7 max-w-xl text-lg leading-8 text-white/50">
                Keep your best-performing creators inside axonnn and build a
                reliable network for future campaigns.
              </p>

              <button className="mt-8 flex items-center gap-3 rounded-2xl bg-white px-6 py-4 font-black text-black">
                Build Creator Network
                <ArrowRight size={18} />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <NetworkCard
                emoji="⭐"
                title="Top Performers"
                count="48 creators"
              />

              <NetworkCard
                emoji="🔥"
                title="High Engagement"
                count="72 creators"
              />

              <NetworkCard
                emoji="📍"
                title="Delhi Creators"
                count="126 creators"
              />

              <NetworkCard
                emoji="💎"
                title="Long-term Partners"
                count="31 creators"
              />
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FINAL CTA
      ===================================================== */}

      <section className="relative z-10 overflow-hidden bg-white px-6 py-32 text-center text-black">
        <div className="absolute left-1/2 top-1/2 h-[450px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/10 blur-[120px]" />

        <div className="relative mx-auto max-w-5xl">
          <p className="mb-5 text-sm font-black uppercase tracking-[0.3em] text-purple-600">
            READY TO GROW?
          </p>

          <h2 className="text-6xl font-black leading-[0.9] tracking-[-0.05em] sm:text-7xl lg:text-9xl">
            Your brand has
            <span className="block text-purple-600">
              a story.
            </span>
            Find the creators
            <span className="block text-blue-600">
              who can tell it.
            </span>
          </h2>

          <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-black/50">
            Find creators. Launch campaigns. Measure results. Scale what
            works with axonnn.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a href="#join" onClick={(e)=>{e.preventDefault ; setShowJoin(true)}} className="group flex items-center gap-3 rounded-2xl bg-black px-7 py-4 font-black text-white transition hover:-translate-y-1">
              Start Your First Campaign
              <ArrowRight
                size={18}
                className="transition group-hover:translate-x-1"
              />
            </a>

            <a href="#join" onClick={(e)=>{e.preventDefault(); setShowJoin(true)}} className="rounded-2xl border border-black/10 px-7 py-4 font-black transition hover:bg-black/5">
              Explore Creators
            </a>
          </div>
        </div>
      </section>

      {/* =====================================================
          CREATOR MODAL
      ===================================================== */}

      {selectedCreator && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-5 backdrop-blur-xl"
          onClick={() => setSelectedCreator(null)}
        >
          <div
            className="w-full max-w-lg rounded-[32px] border border-white/10 bg-[#11101d] p-7 text-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${selectedCreator.color} text-lg font-black`}
                >
                  {selectedCreator.initials}
                </div>

                <div>
                  <h3 className="text-2xl font-black">
                    {selectedCreator.name}
                  </h3>
                  <p className="text-sm text-white/40">
                    {selectedCreator.handle}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedCreator(null)}
                className="rounded-xl bg-white/5 p-2 text-white/50 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-7 grid grid-cols-2 gap-3">
              <ModalStat
                label="Followers"
                value={selectedCreator.followers}
              />
              <ModalStat
                label="Engagement"
                value={selectedCreator.engagement}
              />
              <ModalStat
                label="Avg Reach"
                value={selectedCreator.reach}
              />
              <ModalStat
                label="axonnn Match"
                value={`${selectedCreator.match}%`}
              />
            </div>

            <div className="mt-5 rounded-2xl bg-lime-300 p-5 text-black">
              <p className="text-xs font-black uppercase tracking-wider">
                Recommended campaign price
              </p>

              <p className="mt-1 text-3xl font-black">
                ₹{selectedCreator.price.toLocaleString("en-IN")}
              </p>

              <p className="mt-2 text-sm font-bold opacity-60">
                Based on the current campaign requirements.
              </p>
            </div>

            <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 py-4 font-black">
              Invite Creator
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      )}
    </main>
    {showJoin && (
      <JoinModal onClose={() => setShowJoin(false)} />
    )}
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
      <p className="mt-1 text-xs font-bold uppercase tracking-wider text-white/35">
        {label}
      </p>
    </div>
  );
}

function DashboardBox({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: "blue" | "lime" | "purple" | "yellow";
}) {
  const colors = {
    blue: "bg-blue-400/10 text-blue-300",
    lime: "bg-lime-300/10 text-lime-300",
    purple: "bg-purple-400/10 text-purple-300",
    yellow: "bg-yellow-300/10 text-yellow-300",
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className={`mb-3 inline-flex rounded-lg p-2 ${colors[color]}`}>
        {icon}
      </div>

      <p className="text-xs font-bold text-white/35">{label}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  );
}

function FloatingBadge({
  className,
  title,
  value,
  icon,
}: {
  className: string;
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      className={`absolute hidden items-center gap-3 rounded-2xl border border-white/10 bg-[#151422]/90 px-4 py-3 shadow-2xl backdrop-blur-xl sm:flex ${className}`}
    >
      <div className="rounded-xl bg-white/10 p-2">{icon}</div>

      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-white/35">
          {title}
        </p>

        <p className="font-black">{value}</p>
      </div>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  dark = false,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description: string;
  dark?: boolean;
}) {
  return (
    <div className="max-w-4xl">
      <p
        className={`text-xs font-black uppercase tracking-[0.25em] ${
          dark ? "text-blue-300" : "text-blue-600"
        }`}
      >
        {eyebrow}
      </p>

      <h2 className="mt-5 text-5xl font-black leading-[0.95] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
        {title}
      </h2>

      <p
        className={`mt-7 max-w-2xl text-lg leading-8 ${
          dark ? "text-white/50" : "text-black/50"
        }`}
      >
        {description}
      </p>
    </div>
  );
}

function SelectField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-white/40">
        {label}
      </label>

      <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold">
        {value}
        <ChevronDown size={16} className="text-white/30" />
      </div>
    </div>
  );
}

function CreatorResult({
  creator,
  onClick,
}: {
  creator: Creator;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group rounded-[25px] border border-black/10 bg-[#fafafa] p-5 text-left transition duration-300 hover:-translate-y-1 hover:border-blue-400 hover:shadow-xl"
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${creator.color} text-sm font-black text-white`}
        >
          {creator.initials}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className="font-black">{creator.name}</h4>
              <p className="text-xs text-black/40">
                {creator.handle} • {creator.location}
              </p>
            </div>

            <span className="rounded-lg bg-blue-100 px-2 py-1 text-[10px] font-black text-blue-700">
              {creator.match}% MATCH
            </span>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2">
            <SmallMetric label="Followers" value={creator.followers} />
            <SmallMetric label="Engagement" value={creator.engagement} />
            <SmallMetric label="Reach" value={creator.reach} />
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-black/5 pt-4">
        <span className="text-xs font-bold text-black/40">
          {creator.niche}
        </span>

        <span className="flex items-center gap-1 text-xs font-black text-blue-600">
          View Profile
          <ArrowRight size={14} className="transition group-hover:translate-x-1" />
        </span>
      </div>
    </button>
  );
}

function SmallMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-black/[0.03] p-2">
      <p className="text-[9px] font-bold uppercase tracking-wider text-black/30">
        {label}
      </p>
      <p className="mt-1 text-sm font-black">{value}</p>
    </div>
  );
}

function CampaignMetric({
  value,
  label,
  icon,
}: {
  value: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-3 text-orange-300">{icon}</div>
      <p className="text-2xl font-black">{value}</p>
      <p className="mt-1 text-xs font-bold text-white/35">{label}</p>
    </div>
  );
}

function CampaignStageContent({
  stage,
}: {
  stage: CampaignStage;
}) {
  const content: Record<CampaignStage, React.ReactNode> = {
    Brief: (
      <div className="grid gap-3 sm:grid-cols-3">
        <MiniDarkCard title="Goal" value="Brand Awareness" />
        <MiniDarkCard title="Category" value="Fashion" />
        <MiniDarkCard title="Budget" value="₹2.5L" />
      </div>
    ),

    Creators: (
      <div className="space-y-3">
        {["@aaravstyle", "@riyafit", "@ananyalife"].map((name) => (
          <ListItem key={name} text={`${name} matched to campaign`} />
        ))}
      </div>
    ),

    Invited: (
      <div className="grid gap-3 sm:grid-cols-3">
        <MiniDarkCard title="Invited" value="38" />
        <MiniDarkCard title="Accepted" value="24" />
        <MiniDarkCard title="Pending" value="14" />
      </div>
    ),

    Content: (
      <div className="space-y-3">
        <ListItem text="19 creators submitted content" />
        <ListItem text="14 pieces approved" />
        <ListItem text="3 pieces require revision" />
        <ListItem text="2 submissions pending" />
      </div>
    ),

    Approval: (
      <div className="space-y-3">
        <ListItem text="14 content pieces approved" />
        <ListItem text="3 awaiting revision" />
        <ListItem text="2 awaiting review" />
      </div>
    ),

    Published: (
      <div className="grid gap-3 sm:grid-cols-3">
        <MiniDarkCard title="Published" value="15" />
        <MiniDarkCard title="Reach" value="8.2M" />
        <MiniDarkCard title="Views" value="5.7M" />
      </div>
    ),

    Results: (
      <div className="grid gap-3 sm:grid-cols-3">
        <MiniDarkCard title="Reach" value="12.8M" />
        <MiniDarkCard title="Engagement" value="7.9%" />
        <MiniDarkCard title="ROI" value="3.8×" />
      </div>
    ),
  };

  return content[stage];
}

function MiniDarkCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-white/5 p-4">
      <p className="text-xs font-bold text-white/30">{title}</p>
      <p className="mt-2 text-xl font-black">{value}</p>
    </div>
  );
}

function ListItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
      <div className="rounded-lg bg-lime-300 p-1 text-black">
        <Check size={13} />
      </div>

      <span className="text-sm font-bold text-white/70">{text}</span>
    </div>
  );
}

function ControlItem({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-3">
      <div className="text-orange-300">{icon}</div>
      <span className="text-sm font-bold text-white/60">{text}</span>
    </div>
  );
}

function AnalyticsMetric({
  title,
  value,
  growth,
  icon,
}: {
  title: string;
  value: string;
  growth: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-black/5 bg-[#f5f5f7] p-5">
      <div className="flex items-center justify-between">
        <div className="rounded-xl bg-white p-2 shadow-sm">
          {icon}
        </div>

        <span className="text-xs font-black text-emerald-600">
          {growth}
        </span>
      </div>

      <p className="mt-5 text-xs font-bold text-black/40">{title}</p>
      <p className="mt-1 text-3xl font-black">{value}</p>
    </div>
  );
}

function InsightCard({
  color,
  title,
  text,
}: {
  color: "lime" | "blue" | "yellow" | "pink";
  title: string;
  text: string;
}) {
  const styles = {
    lime: "bg-lime-300 text-black",
    blue: "bg-blue-500 text-white",
    yellow: "bg-yellow-300 text-black",
    pink: "bg-pink-500 text-white",
  };

  return (
    <div className={`rounded-2xl p-5 ${styles[color]}`}>
      <p className="text-xs font-black uppercase tracking-wider opacity-60">
        {title}
      </p>

      <p className="mt-2 text-lg font-black leading-7">{text}</p>
    </div>
  );
}

function ComparisonRow({
  label,
  values,
  highlight = false,
}: {
  label: string;
  values: string[];
  highlight?: boolean;
}) {
  return (
    <tr className="border-b border-black/5 last:border-0">
      <td className="p-5 text-sm font-black text-black/45">{label}</td>

      {values.map((value, index) => (
        <td key={index} className="p-5">
          <span
            className={`text-lg font-black ${
              highlight ? "text-purple-600" : ""
            }`}
          >
            {value}
          </span>
        </td>
      ))}
    </tr>
  );
}

function ResultBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-[#f5f5f7] p-5">
      <p className="text-xs font-bold uppercase tracking-wider text-black/35">
        {label}
      </p>

      <p className="mt-2 text-3xl font-black">{value}</p>
    </div>
  );
}

function Workflow({
  number,
  title,
  text,
  icon,
  className,
}: {
  number: string;
  title: string;
  text: string;
  icon: React.ReactNode;
  className: string;
}) {
  return (
    <div
      className={`min-h-[260px] rounded-[30px] p-7 transition duration-300 hover:-translate-y-2 hover:shadow-2xl ${className}`}
    >
      <div className="flex items-start justify-between">
        <span className="text-sm font-black opacity-40">{number}</span>

        <div className="rounded-xl bg-white/20 p-3">{icon}</div>
      </div>

      <div className="mt-20">
        <h3 className="text-3xl font-black">{title}</h3>
        <p className="mt-3 max-w-xs font-bold leading-6 opacity-60">
          {text}
        </p>
      </div>
    </div>
  );
}

function NetworkCard({
  emoji,
  title,
  count,
}: {
  emoji: string;
  title: string;
  count: string;
}) {
  return (
    <div className="group rounded-[28px] border border-white/10 bg-white/[0.04] p-6 transition hover:-translate-y-1 hover:bg-white/[0.08]">
      <div className="text-4xl">{emoji}</div>

      <h3 className="mt-8 text-2xl font-black">{title}</h3>

      <div className="mt-3 flex items-center justify-between">
        <p className="text-sm font-bold text-white/35">{count}</p>

        <ArrowRight
          size={18}
          className="text-white/30 transition group-hover:translate-x-1 group-hover:text-white"
        />
      </div>
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
    <div className="rounded-2xl bg-white/5 p-4">
      <p className="text-xs font-bold text-white/30">{label}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  );
}