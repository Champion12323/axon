"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  Bot,
  Check,
  ChevronRight,
  CircleDollarSign,
  MessageCircle,
  Play,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  WandSparkles,
  Zap,
} from "lucide-react";
 import {FaInstagram} from "react-icons/fa";
 import Navbar from "../ui/Navbar";
 import JoinModal from "../ui/JoinModal";


type Tool = {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  iconBg: string;
  category: string;
  featured?: boolean;
};

const tools: Tool[] = [
  {
    id: "auto-dm",
    name: "Auto DM",
    description:
      "Turn comments, keywords and interactions into automated conversations.",
    icon: MessageCircle,
    gradient: "from-violet-500 via-fuchsia-500 to-pink-500",
    iconBg: "bg-violet-50 text-violet-600",
    category: "Automation",
    featured: true,
  },
  {
    id: "ai-replies",
    name: "AI Replies",
    description:
      "Let axonnn understand incoming messages and suggest intelligent replies.",
    icon: Bot,
    gradient: "from-cyan-400 via-blue-500 to-indigo-600",
    iconBg: "bg-blue-50 text-blue-600",
    category: "AI",
  },
  {
    id: "lead-gen",
    name: "Lead Generator",
    description:
      "Convert comments and DMs into qualified leads automatically.",
    icon: Target,
    gradient: "from-orange-400 via-pink-500 to-rose-500",
    iconBg: "bg-orange-50 text-orange-600",
    category: "Growth",
  },
  {
    id: "content-ai",
    name: "Content Intelligence",
    description:
      "Discover what content your audience is most likely to engage with.",
    icon: Sparkles,
    gradient: "from-emerald-400 via-teal-500 to-cyan-500",
    iconBg: "bg-emerald-50 text-emerald-600",
    category: "Content",
  },
  {
    id: "analytics",
    name: "Creator Analytics",
    description:
      "Understand your reach, engagement, audience and content performance.",
    icon: TrendingUp,
    gradient: "from-blue-500 via-indigo-500 to-purple-600",
    iconBg: "bg-indigo-50 text-indigo-600",
    category: "Analytics",
  },
  {
    id: "rate-card",
    name: "Rate Calculator",
    description:
      "Estimate what you should charge for brand collaborations.",
    icon: CircleDollarSign,
    gradient: "from-yellow-400 via-orange-500 to-red-500",
    iconBg: "bg-orange-50 text-orange-600",
    category: "Money",
  },
];

const categories = [
  "All",
  "Automation",
  "AI",
  "Growth",
  "Content",
  "Analytics",
  "Money",
];

export default function CreatorToolsPage() {
  const [showJoin, setShowJoin] = useState(false);
  const [activeTool, setActiveTool] = useState("auto-dm");
  const [activeCategory, setActiveCategory] = useState("All");
  const [platform, setPlatform] = useState("Instagram");
  const filteredTools = useMemo(() => {
    if (activeCategory === "All") return tools;

    return tools.filter((tool) => tool.category === activeCategory);
  }, [activeCategory]);

  const selectedTool =
    tools.find((tool) => tool.id === activeTool) || tools[0];

  return (
    <>
    <main className="min-h-screen overflow-hidden bg-white text-zinc-950">
        <Navbar/>
      {/* =========================================================
          HERO
      ========================================================= */}

      <section className="relative px-6 pb-20 pt-36 md:pt-44">
        {/* background blobs */}

        <div className="pointer-events-none absolute left-[-180px] top-20 h-[420px] w-[420px] rounded-full bg-purple-200/30 blur-[110px]" />

        <div className="pointer-events-none absolute right-[-150px] top-32 h-[420px] w-[420px] rounded-full bg-pink-200/30 blur-[110px]" />

        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium shadow-sm">
              <Sparkles className="h-4 w-4 text-violet-500" />
              <span>axonnn Creator Tools</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Built for creators
            </div>

            <h1 className="text-5xl font-black tracking-[-0.055em] md:text-7xl lg:text-[88px]">
              Everything you need
              <br />
              to{" "}
              <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-400 bg-clip-text text-transparent">
                grow online.
              </span>
            </h1>

            <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-zinc-500 md:text-xl">
              Automate conversations, understand your audience, create better
              content and turn your attention into income — all from one
              intelligent workspace.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="#tools"
                className="group flex items-center gap-2 rounded-full bg-zinc-950 px-7 py-4 text-sm font-bold text-white transition hover:-translate-y-1 hover:shadow-xl"
              >
                Explore Creator Tools
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </a>

              <a
                href="#auto-dm"
                className="rounded-full border border-zinc-200 bg-white px-7 py-4 text-sm font-bold transition hover:border-zinc-400 hover:bg-zinc-50"
              >
                See Auto-DM
              </a>
            </div>
          </div>

          {/* Floating mini stats */}

          <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-3 md:grid-cols-4">
            {[
              ["6+", "Creator tools"],
              ["3", "Platforms"],
              ["24/7", "Automation"],
              ["AI", "Powered"],
            ].map(([value, label]) => (
              <div
                key={label}
                className="rounded-2xl border border-zinc-100 bg-white p-5 text-center shadow-[0_15px_50px_rgba(0,0,0,0.05)]"
              >
                <div className="text-2xl font-black">{value}</div>
                <div className="mt-1 text-xs font-medium text-zinc-400">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          TOOL COMMAND CENTER
      ========================================================= */}

      <section
        id="tools"
        className="relative border-y border-zinc-100 bg-[#fafafa] px-6 py-20 md:py-28"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-violet-600">
                Creator Command Center
              </p>

              <h2 className="text-4xl font-black tracking-tight md:text-6xl">
                Your tools.
                <br />
                <span className="text-zinc-400">One workspace.</span>
              </h2>
            </div>

            <p className="max-w-md text-sm leading-6 text-zinc-500">
              Pick a tool and see how axonnn can automate the repetitive work
              behind your social presence.
            </p>
          </div>

          {/* Categories */}

          <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => {
              const active = category === activeCategory;

              return (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                    active
                      ? "bg-zinc-950 text-white"
                      : "border border-zinc-200 bg-white text-zinc-500 hover:text-zinc-950"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>

          <div className="grid gap-6 lg:grid-cols-[330px_1fr]">
            {/* Tool list */}

            <div className="space-y-3">
              {filteredTools.map((tool) => {
                const Icon = tool.icon;
                const active = tool.id === activeTool;

                return (
                  <button
                    key={tool.id}
                    onClick={() => setActiveTool(tool.id)}
                    className={`group flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
                      active
                        ? "border-zinc-900 bg-zinc-950 text-white shadow-xl"
                        : "border-zinc-200 bg-white hover:-translate-y-0.5 hover:border-zinc-300"
                    }`}
                  >
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                        active
                          ? "bg-white/10 text-white"
                          : tool.iconBg
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="font-bold">{tool.name}</div>
                      <div
                        className={`mt-1 text-xs ${
                          active ? "text-zinc-400" : "text-zinc-400"
                        }`}
                      >
                        {tool.category}
                      </div>
                    </div>

                    <ChevronRight
                      className={`h-4 w-4 transition ${
                        active
                          ? "translate-x-1 text-white"
                          : "text-zinc-300 group-hover:translate-x-1"
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Preview */}

            <div className="relative min-h-[620px] overflow-hidden rounded-[30px] border border-zinc-200 bg-white shadow-[0_30px_100px_rgba(0,0,0,0.08)]">
              {/* colorful background */}

              <div className="absolute right-[-100px] top-[-100px] h-[300px] w-[300px] rounded-full bg-violet-300/30 blur-[90px]" />

              <div className="absolute bottom-[-100px] left-[-100px] h-[300px] w-[300px] rounded-full bg-pink-300/20 blur-[90px]" />

              <div className="relative p-6 md:p-10">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="mb-3 inline-flex rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-500">
                      {selectedTool.category}
                    </div>

                    <h3 className="text-3xl font-black md:text-4xl">
                      {selectedTool.name}
                    </h3>

                    <p className="mt-3 max-w-lg text-sm leading-6 text-zinc-500">
                      {selectedTool.description}
                    </p>
                  </div>

                  <div
                    className={`hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg md:flex ${selectedTool.gradient}`}
                  >
                    <selectedTool.icon className="h-6 w-6" />
                  </div>
                </div>

                {/* Dynamic previews */}

                {activeTool === "auto-dm" && <AutoDMPreview />}

                {activeTool === "ai-replies" && <AIRepliesPreview />}

                {activeTool === "lead-gen" && <LeadPreview />}

                {activeTool === "content-ai" && <ContentPreview />}

                {activeTool === "analytics" && (
                  <AnalyticsPreview
                    platform={platform}
                    setPlatform={setPlatform}
                  />
                )}

                {activeTool === "rate-card" && <RatePreview />}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          AUTO DM FEATURE
      ========================================================= */}

      <section id="auto-dm" className="relative px-6 py-24 md:py-32">
        <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-violet-50 px-4 py-2 text-sm font-bold text-violet-600">
              <Zap className="h-4 w-4" />
              Featured Tool
            </div>

            <h2 className="text-5xl font-black tracking-tight md:text-7xl">
              Turn comments
              <br />
              into{" "}
              <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
                conversations.
              </span>
            </h2>

            <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-500">
              Auto-DM lets creators automatically start conversations when
              people comment, reply to stories or use specific keywords.
            </p>

            <div className="mt-8 space-y-4">
              {[
                "Keyword-based triggers",
                "Comment → DM automation",
                "Story reply automation",
                "Personalized messages",
                "Lead capture",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-100">
                    <Check className="h-3.5 w-3.5 text-violet-600" />
                  </div>

                  <span className="font-medium text-zinc-700">{item}</span>
                </div>
              ))}
            </div>

            <button className="group mt-9 flex items-center gap-2 rounded-full bg-zinc-950 px-6 py-3.5 text-sm font-bold text-white transition hover:-translate-y-1">
              Start with Auto-DM
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </button>
          </div>

          {/* Auto DM UI */}

          <div className="relative">
            <div className="absolute inset-0 rounded-[40px] bg-gradient-to-br from-violet-200 via-pink-100 to-orange-100 blur-3xl" />

            <div className="relative overflow-hidden rounded-[32px] border border-zinc-200 bg-white p-5 shadow-[0_40px_100px_rgba(80,50,150,0.15)]">
              <div className="mb-5 flex items-center justify-between border-b border-zinc-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white">
                    <MessageCircle className="h-5 w-5" />
                  </div>

                  <div>
                    <div className="text-sm font-bold">Auto-DM Flow</div>
                    <div className="text-xs text-zinc-400">
                      Instagram automation
                    </div>
                  </div>
                </div>

                <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">
                  Active
                </div>
              </div>

              <div className="space-y-4">
                <FlowCard
                  number="01"
                  title="Someone comments"
                  value='"LINK"'
                  color="bg-violet-100 text-violet-600"
                />

                <div className="mx-auto h-7 w-px bg-zinc-200" />

                <FlowCard
                  number="02"
                  title="axonnn detects keyword"
                  value="LINK"
                  color="bg-fuchsia-100 text-fuchsia-600"
                />

                <div className="mx-auto h-7 w-px bg-zinc-200" />

                <FlowCard
                  number="03"
                  title="Personalized DM sent"
                  value="Guide sent ✓"
                  color="bg-emerald-100 text-emerald-600"
                />
              </div>

              <div className="mt-5 rounded-2xl bg-zinc-950 p-5 text-white">
                <div className="mb-3 text-xs font-bold text-zinc-400">
                  MESSAGE
                </div>

                <p className="text-sm leading-6">
                  Hey! 👋 Thanks for commenting. Here's the guide you asked
                  for:
                </p>

                <div className="mt-3 rounded-xl bg-white/10 px-4 py-3 text-xs text-violet-200">
                  axonnn.app/guide
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          PLATFORM SECTION
      ========================================================= */}

      <section className="bg-zinc-950 px-6 py-24 text-white md:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-violet-400">
              One creator workspace
            </p>

            <h2 className="text-4xl font-black tracking-tight md:text-6xl">
              Your content lives
              <br />
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-orange-300 bg-clip-text text-transparent">
                everywhere.
              </span>
              <br />
              axonnn brings it together.
            </h2>

            <p className="mt-6 text-zinc-400">
              Connect your social platforms and let axonnn turn your data into
              useful decisions.
            </p>
          </div>

          <div className="mt-14 flex justify-center">
            <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-1">
              {["Instagram", "YouTube", "Facebook"].map((item) => (
                <button
                  key={item}
                  onClick={() => setPlatform(item)}
                  className={`rounded-full px-5 py-2.5 text-sm font-bold transition ${
                    platform === item
                      ? "bg-white text-zinc-950"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="mx-auto mt-10 grid max-w-5xl gap-4 md:grid-cols-3">
            {[
              ["Reach", "2.8M", "+24.8%"],
              ["Engagement", "6.42%", "+1.8%"],
              ["Audience", "184K", "+12.4%"],
            ].map(([label, value, change]) => (
              <div
                key={label}
                className="rounded-3xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl"
              >
                <div className="text-sm text-zinc-500">{label}</div>

                <div className="mt-4 text-4xl font-black">{value}</div>

                <div className="mt-2 text-sm font-semibold text-emerald-400">
                  {change}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          CTA
      ========================================================= */}

      <section className="relative overflow-hidden px-6 py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-orange-50" />

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mx-auto mb-7 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-950 text-white shadow-xl">
            <WandSparkles className="h-7 w-7" />
          </div>

          <h2 className="text-5xl font-black tracking-tight md:text-7xl">
            Stop doing everything
            <br />
            <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-400 bg-clip-text text-transparent">
              manually.
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-zinc-500">
            Let Axonnn handle the repetitive work while you focus on creating,
            growing and earning.
          </p>

          <a
            href="#join"
            onClick={(e) => {setShowJoin(true); e.preventDefault();}}
            className="group mt-9 inline-flex items-center gap-2 rounded-full bg-zinc-950 px-8 py-4 text-sm font-bold text-white shadow-xl transition hover:-translate-y-1"
          >
            Join axonnn
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </a>
        </div>
      </section>
    </main>
    {showJoin && (<JoinModal onClose={() => setShowJoin(false)} />)}
    </>
  );
}

/* =============================================================
   AUTO DM PREVIEW
============================================================= */

function AutoDMPreview() {
  return (
    <div className="mt-8 rounded-3xl bg-zinc-50 p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <div className="text-sm font-bold">Automation Flow</div>
          <div className="text-xs text-zinc-400">
            Trigger → Action → Result
          </div>
        </div>

        <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">
          Running
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {[
          ["Trigger", 'Comment "LINK"'],
          ["Action", "Send DM"],
          ["Result", "Lead captured"],
        ].map(([title, value], index) => (
          <div key={title} className="relative">
            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                0{index + 1} · {title}
              </div>

              <div className="mt-3 font-bold">{value}</div>
            </div>

            {index < 2 && (
              <div className="absolute -right-2 top-1/2 z-10 hidden h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-zinc-950 text-white md:flex">
                <ChevronRight className="h-3 w-3" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* =============================================================
   AI REPLIES
============================================================= */

function AIRepliesPreview() {
  return (
    <div className="mt-8 space-y-3">
      <ChatBubble
        side="left"
        text="How much does the hoodie cost?"
      />

      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-md bg-gradient-to-r from-blue-500 to-violet-500 p-4 text-sm text-white shadow-lg">
          The hoodie is ₹1,499 👕 Want me to send you the purchase link?
          <div className="mt-2 text-[10px] text-white/60">
            Generated by axonnn AI
          </div>
        </div>
      </div>

      <ChatBubble
        side="left"
        text="Do you ship to Delhi?"
      />

      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-md bg-zinc-950 p-4 text-sm text-white">
          Yes! We ship across India 🇮🇳
        </div>
      </div>
    </div>
  );
}

/* =============================================================
   LEAD GENERATOR
============================================================= */

function LeadPreview() {
  return (
    <div className="mt-8">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ["Comments", "4,820"],
          ["DMs sent", "2,140"],
          ["Leads", "482"],
          ["Sales", "₹1.42L"],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4"
          >
            <div className="text-xs text-zinc-400">{label}</div>
            <div className="mt-2 text-xl font-black">{value}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-3xl bg-gradient-to-br from-orange-50 to-pink-50 p-6">
        <div className="text-xs font-bold uppercase tracking-widest text-orange-500">
          Conversion funnel
        </div>

        <div className="mt-6 space-y-3">
          {[
            ["Comments", "4,820", "100%"],
            ["DM conversations", "2,140", "44%"],
            ["Qualified leads", "482", "10%"],
            ["Customers", "96", "2%"],
          ].map(([label, value, percentage], index) => (
            <div key={label}>
              <div className="mb-2 flex justify-between text-xs">
                <span className="font-semibold">{label}</span>
                <span className="text-zinc-400">
                  {value} · {percentage}
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-white">
                <div
                  className={`h-full rounded-full bg-gradient-to-r from-orange-400 to-pink-500`}
                  style={{ width: `${100 - index * 20}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* =============================================================
   CONTENT INTELLIGENCE
============================================================= */

function ContentPreview() {
  return (
    <div className="mt-8 rounded-3xl bg-zinc-950 p-6 text-white">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
          <Sparkles className="h-5 w-5" />
        </div>

        <div>
          <div className="font-bold">axonnn recommends</div>
          <div className="text-xs text-zinc-500">
            Based on your recent performance
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {[
          "5 mistakes beginners make",
          "The truth about protein",
          "30-day transformation",
        ].map((idea, index) => (
          <div
            key={idea}
            className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4"
          >
            <div className="text-sm font-black text-emerald-400">
              0{index + 1}
            </div>

            <div className="flex-1 text-sm font-semibold">{idea}</div>

            <div className="text-xs font-bold text-emerald-400">
              +{32 - index * 7}% potential
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =============================================================
   ANALYTICS
============================================================= */

function AnalyticsPreview({
  platform,
  setPlatform,
}: {
  platform: string;
  setPlatform: (value: string) => void;
}) {
  return (
    <div className="mt-8">
      <div className="flex flex-wrap gap-2">
        {["Instagram", "YouTube", "Facebook"].map((item) => (
          <button
            key={item}
            onClick={() => setPlatform(item)}
            className={`rounded-full px-4 py-2 text-xs font-bold transition ${
              platform === item
                ? "bg-zinc-950 text-white"
                : "border border-zinc-200 bg-white text-zinc-400"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {[
          ["Reach", "2.8M"],
          ["Engagement", "6.42%"],
          ["Followers", "184K"],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5"
          >
            <div className="text-xs text-zinc-400">{label}</div>

            <div className="mt-2 text-2xl font-black">{value}</div>

            <div className="mt-2 text-xs font-bold text-emerald-500">
              ↑ 24.8%
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex h-36 items-end gap-2 rounded-3xl border border-zinc-200 bg-zinc-50 p-5">
        {[35, 48, 42, 67, 58, 80, 72, 92, 75, 100, 85, 96].map(
          (height, index) => (
            <div
              key={index}
              className="flex-1 rounded-t-md bg-gradient-to-t from-indigo-500 to-violet-400"
              style={{ height: `${height}%` }}
            />
          )
        )}
      </div>
    </div>
  );
}

/* =============================================================
   RATE CARD
============================================================= */

function RatePreview() {
  return (
    <div className="mt-8 rounded-3xl bg-gradient-to-br from-orange-50 via-white to-pink-50 p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Creator profile
          </div>

          <div className="mt-4 space-y-3">
            <RateRow label="Followers" value="120K" />
            <RateRow label="Avg. views" value="80K" />
            <RateRow label="Engagement" value="4.7%" />
            <RateRow label="Audience India" value="82%" />
          </div>
        </div>

        <div className="rounded-2xl bg-zinc-950 p-5 text-white">
          <div className="text-xs font-bold text-zinc-500">
            RECOMMENDED RATE
          </div>

          <div className="mt-4 text-4xl font-black">₹15K–₹25K</div>

          <div className="mt-2 text-sm text-zinc-400">
            Sponsored Reel
          </div>

          <div className="mt-6 rounded-xl bg-white/10 p-4 text-xs text-zinc-300">
            Based on audience size, engagement, niche and average performance.
          </div>
        </div>
      </div>
    </div>
  );
}

/* =============================================================
   SMALL COMPONENTS
============================================================= */

function FlowCard({
  number,
  title,
  value,
  color,
}: {
  number: string;
  title: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-black ${color}`}
      >
        {number}
      </div>

      <div className="flex-1">
        <div className="text-xs text-zinc-400">{title}</div>
        <div className="mt-1 text-sm font-bold">{value}</div>
      </div>
    </div>
  );
}

function ChatBubble({
  text,
  side,
}: {
  text: string;
  side: "left" | "right";
}) {
  return (
    <div className={side === "right" ? "flex justify-end" : ""}>
      <div className="max-w-[80%] rounded-2xl rounded-bl-md border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700">
        {text}
      </div>
    </div>
  );
}

function RateRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3">
      <span className="text-xs text-zinc-400">{label}</span>
      <span className="text-sm font-bold">{value}</span>
    </div>
  );
}