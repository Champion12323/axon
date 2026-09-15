"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  BarChart3,
  Bot,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  Clapperboard,
  Globe2,
  Link2,
  MessageCircle,
  MousePointer2,
  Play,
  Rocket,
  Search,
  Send,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import { FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";
import Navbar from "./ui/Navbar";
import JoinModal from "./ui/JoinModal";

const services = [
  {
    id: "creators",
    label: "FOR CREATORS",
    title: "Turn your audience into opportunity.",
    description:
      "Discover campaigns, understand your audience, prove your value and build a sustainable creator income.",
    accent: "purple",
    icon: Users,
    features: [
      "AI Campaign Discovery",
      "Account Analytics",
      "Creator Score",
      "AI Growth Insights",
      "Campaign Earnings",
    ],
    href: ["/for-creators#creators"],
  },
  {
    id: "clippers",
    label: "FOR CLIPPERS",
    title: "Turn content into income.",
    description:
      "Find high-value content, create clips, track performance and build recurring monthly earnings.",
    accent: "orange",
    icon: Clapperboard,
    features: [
      "Clip Marketplace",
      "Content Discovery",
      "Performance Tracking",
      "Monthly Earnings",
      "Clipper Growth",
    ],
    href: ["/for-clippers#clippers"],
  },
  {
    id: "businesses",
    label: "FOR BUSINESSES",
    title: "Find the right creator. Run smarter campaigns.",
    description:
      "Discover creators using real data, manage campaigns and understand exactly what drives ROI.",
    accent: "cyan",
    icon: BriefcaseBusiness,
    features: [
      "AI Creator Discovery",
      "Creator Matching",
      "Campaign Management",
      "Campaign Analytics",
      "ROI Intelligence",
    ],
    href: ["/for-businesses#businesses"],
  },
];

const tools = [
  {
    icon: Send,
    name: "Auto DM",
    text: "Automate creator and customer conversations.",
    color: "purple",
  },
  {
    icon: Bot,
    name: "AI Replies",
    text: "Generate smart replies from your conversations.",
    color: "yellow",
  },
  {
    icon: Search,
    name: "Creator Discovery",
    text: "Find creators using audience and performance data.",
    color: "cyan",
  },
  {
    icon: Target,
    name: "Lead Generation",
    text: "Turn social engagement into qualified opportunities.",
    color: "orange",
  },
  {
    icon: BarChart3,
    name: "Analytics",
    text: "Understand Instagram, YouTube and Facebook together.",
    color: "lime",
  },
  {
    icon: Zap,
    name: "Automation",
    text: "Let Axon handle repetitive growth workflows.",
    color: "pink",
  },
];

const platforms = [
  { name: "Instagram", icon: FaInstagram },
  { name: "YouTube", icon: FaYoutube },
  { name: "Facebook", icon: FaFacebook },
];

const accentMap: Record<
  string,
  {
    bg: string;
    text: string;
    border: string;
    glow: string;
    soft: string;
  }
> = {
  purple: {
    bg: "bg-purple-500",
    text: "text-purple-500",
    border: "border-purple-400/40",
    glow: "shadow-purple-500/30",
    soft: "bg-purple-500/10",
  },
  orange: {
    bg: "bg-orange-500",
    text: "text-orange-500",
    border: "border-orange-400/40",
    glow: "shadow-orange-500/30",
    soft: "bg-orange-500/10",
  },
  cyan: {
    bg: "bg-cyan-400",
    text: "text-cyan-400",
    border: "border-cyan-400/40",
    glow: "shadow-cyan-400/30",
    soft: "bg-cyan-400/10",
  },
  yellow: {
    bg: "bg-yellow-400",
    text: "text-yellow-400",
    border: "border-yellow-400/40",
    glow: "shadow-yellow-400/30",
    soft: "bg-yellow-400/10",
  },
  lime: {
    bg: "bg-lime-400",
    text: "text-lime-400",
    border: "border-lime-400/40",
    glow: "shadow-lime-400/30",
    soft: "bg-lime-400/10",
  },
  pink: {
    bg: "bg-pink-500",
    text: "text-pink-500",
    border: "border-pink-400/40",
    glow: "shadow-pink-500/30",
    soft: "bg-pink-500/10",
  },
};

export default function Home() {
  const [activeService, setActiveService] = useState("creators");
  const [activeTool, setActiveTool] = useState(0);
  const [activePlatform, setActivePlatform] = useState("Instagram");
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [showJoin, setShowJoin] = useState(false);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMouse({
        x: event.clientX,
        y: event.clientY,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const currentService = useMemo(
    () => services.find((item) => item.id === activeService) ?? services[0],
    [activeService],
  );
const openJoinModal = () => {
    setShowJoin(true);
  };

  const closeJoinModal = () => {
    setShowJoin(false);
  };
  const currentAccent = accentMap[currentService.accent];

  return (
    <>
    <main className="min-h-screen overflow-hidden bg-white text-[#101015]">
      {/* =========================================================
          COSMIC HERO
      ========================================================== */}
      <section className="relative min-h-screen overflow-hidden bg-[#080612] text-white">
        {/* Stars */}
        <div className="absolute inset-0 opacity-80">
          {Array.from({ length: 90 }).map((_, i) => (
            <span
              key={i}
              className="absolute h-[2px] w-[2px] rounded-full bg-white"
              style={{
                left: `${(i * 37) % 100}%`,
                top: `${(i * 61) % 100}%`,
                opacity: 0.15 + ((i * 17) % 80) / 100,
              }}
            />
          ))}
        </div>

        {/* Cosmic gradients */}
        <div
          className="pointer-events-none absolute -left-40 top-20 h-[600px] w-[600px] rounded-full bg-purple-700/20 blur-[140px]"
          style={{
            transform: `translate(${mouse.x * 0.015}px, ${mouse.y * 0.01}px)`,
          }}
        />

        <div
          className="pointer-events-none absolute -right-40 top-40 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[140px]"
          style={{
            transform: `translate(${mouse.x * -0.01}px, ${mouse.y * -0.005}px)`,
          }}
        />

        {/* Navbar */}
        <nav className="relative z-30 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
          <Navbar />
        </nav>

        {/* Hero */}
        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-90px)] max-w-7xl flex-col items-center justify-center px-6 pb-24 text-center mt-26">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-purple-300">
            <Sparkles size={14} />
            The creator economy, connected
          </div>

          <h1 className="max-w-5xl text-5xl font-black leading-[0.92] tracking-[-0.05em] sm:text-7xl lg:text-[100px]">
            One universe.
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-white to-cyan-300 bg-clip-text text-transparent">
              Every growth layer.
            </span>
          </h1>

          <p className="mt-8 max-w-2xl text-base leading-7 text-white/55 sm:text-lg">
            Axon connects creators, clippers and businesses through campaigns,
            analytics, AI tools, automation and payments — all inside one
            intelligent ecosystem.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <a
              href="#ecosystem"
              className="group flex items-center justify-center gap-3 rounded-full bg-white px-7 py-4 text-sm font-black text-black transition hover:scale-105"
            >
              Explore Axon
              <ArrowDown
                size={17}
                className="transition group-hover:translate-y-1"
              />
            </a>

            <a
              href="#tools"
              className="flex items-center justify-center gap-3 rounded-full border border-white/15 bg-white/5 px-7 py-4 text-sm font-black text-white backdrop-blur-xl transition hover:bg-white/10"
            >
              Explore AI Tools
              <ArrowRight size={17} />
            </a>
          </div>

          {/* Orbit system */}
          <div className="relative mt-16 h-[310px] w-full max-w-3xl sm:h-[380px]">
            <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-purple-400/10 sm:h-80 sm:w-80" />
            <div className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-400/10 sm:h-56 sm:w-56" />

            {/* Core */}
            <div className="absolute left-1/2 top-1/2 z-10 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-gradient-to-br from-purple-600 to-indigo-700 shadow-[0_0_100px_rgba(139,92,246,0.45)] sm:h-36 sm:w-36">
              <div className="text-center">
                <div className="text-3xl font-black tracking-tight">AXON</div>
                <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.3em] text-white/60">
                  intelligence
                </div>
              </div>
            </div>

            {/* Nodes */}
            {[
              {
                name: "Creators",
                icon: Users,
                position: "left-[5%] top-[20%]",
                color: "bg-purple-500",
              },
              {
                name: "Businesses",
                icon: BriefcaseBusiness,
                position: "right-[5%] top-[20%]",
                color: "bg-cyan-400",
              },
              {
                name: "Clippers",
                icon: Clapperboard,
                position: "left-[12%] bottom-[5%]",
                color: "bg-orange-500",
              },
              {
                name: "AI Tools",
                icon: Bot,
                position: "right-[12%] bottom-[5%]",
                color: "bg-yellow-400",
              },
              {
                name: "Analytics",
                icon: BarChart3,
                position: "left-1/2 top-0 -translate-x-1/2",
                color: "bg-lime-400",
              },
            ].map((node) => {
              const Icon = node.icon;

              return (
                <div
                  key={node.name}
                  className={`absolute ${node.position} z-20`}
                  onMouseEnter={() => setHoveredNode(node.name)}
                  onMouseLeave={() => setHoveredNode(null)}
                >
                  <div
                    className={`group flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-xl transition duration-300 hover:scale-110 ${
                      hoveredNode === node.name
                        ? "border-white/30 bg-white/10"
                        : ""
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${node.color} text-black`}
                    >
                      <Icon size={15} />
                    </span>

                    <span className="text-xs font-bold">{node.name}</span>
                  </div>

                  {hoveredNode === node.name && (
                    <div className="absolute left-1/2 top-full mt-2 w-40 -translate-x-1/2 rounded-2xl border border-white/10 bg-black/70 p-3 text-left text-[11px] text-white/60 backdrop-blur-2xl">
                      <div className="font-bold text-white">{node.name}</div>
                      <div className="mt-1">
                        Connected to the Axon intelligence layer.
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================
          ECOSYSTEM
      ========================================================== */}
      <section id="ecosystem" className="bg-white px-6 py-28 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.3em] text-purple-600">
                The ecosystem
              </div>

              <h2 className="mt-5 text-5xl font-black leading-[0.95] tracking-[-0.04em] sm:text-6xl">
                Everything
                <br />
                connected.
              </h2>

              <p className="mt-6 max-w-md text-base leading-7 text-black/55">
                Axon brings the entire creator-business relationship into one
                intelligent network.
              </p>

              <div className="mt-8 flex items-center gap-3 text-sm font-black">
                <div className="h-2 w-2 rounded-full bg-purple-600" />
                Discover
                <ArrowRight size={15} />
                Create
                <ArrowRight size={15} />
                Measure
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  title: "Discover",
                  text: "Find creators, campaigns, opportunities and content.",
                  icon: Search,
                  color: "bg-purple-100 text-purple-600",
                },
                {
                  title: "Create",
                  text: "Publish campaigns, clips and content that performs.",
                  icon: Sparkles,
                  color: "bg-orange-100 text-orange-600",
                },
                {
                  title: "Measure",
                  text: "Understand audiences, content and campaign performance.",
                  icon: BarChart3,
                  color: "bg-lime-100 text-lime-700",
                },
                {
                  title: "Grow",
                  text: "Turn data into better decisions and stronger income.",
                  icon: TrendingUp,
                  color: "bg-cyan-100 text-cyan-700",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="group rounded-[28px] border border-black/5 bg-[#f7f7f5] p-7 transition duration-300 hover:-translate-y-2 hover:bg-black hover:text-white"
                  >
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.color}`}
                    >
                      <Icon size={21} />
                    </div>

                    <h3 className="mt-7 text-2xl font-black">{item.title}</h3>

                    <p className="mt-3 text-sm leading-6 text-black/50 transition group-hover:text-white/50">
                      {item.text}
                    </p>

                    <ArrowRight
                      className="mt-8 transition group-hover:translate-x-2"
                      size={18}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          SERVICE UNIVERSE
      ========================================================== */}
      <section className="bg-[#f4f4f1] px-6 py-28 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <div className="text-xs font-black uppercase tracking-[0.3em] text-black/40">
              Three sides. One network.
            </div>

            <h2 className="mt-5 text-5xl font-black leading-none tracking-[-0.04em] sm:text-7xl">
              Built for everyone
              <br />
              creating the future.
            </h2>
          </div>

          {/* Tabs */}
          <div className="mt-12 flex flex-wrap gap-3">
            {services.map((service) => {
              const active = service.id === activeService;
              const Icon = service.icon;
              const accent = accentMap[service.accent];

              return (
                <button
                  key={service.id}
                  onClick={() => setActiveService(service.id)}
                  className={`flex items-center gap-3 rounded-full border px-5 py-3 text-sm font-black transition ${
                    active
                      ? `${accent.bg} border-transparent text-black`
                      : "border-black/10 bg-white hover:border-black/20"
                  }`}
                >
                  <Icon size={16} />
                  {service.label.replace("FOR ", "")}
                </button>
              );
            })}
          </div>

          {/* Main service card */}
          <div
            id={currentService.id}
            className={`mt-8 overflow-hidden rounded-[40px] border ${currentAccent.border} bg-white shadow-2xl ${currentAccent.glow}`}
          >
            <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
              <div className="p-8 sm:p-12">
                <div
                  className={`inline-flex rounded-full px-4 py-2 text-[10px] font-black tracking-[0.25em] ${currentAccent.soft} ${currentAccent.text}`}
                >
                  {currentService.label}
                </div>

                <h3 className="mt-7 max-w-xl text-4xl font-black leading-none tracking-[-0.04em] sm:text-6xl">
                  {currentService.title}
                </h3>

                <p className="mt-6 max-w-lg text-base leading-7 text-black/55">
                  {currentService.description}
                </p>

                <a
                  href={currentService.href[0]}
                  className="mt-8 flex items-center gap-3 rounded-full bg-black px-6 py-3 text-sm font-black text-white transition hover:scale-105"
                >
                  Explore {currentService.label.replace("FOR ", "")}
                  <ArrowRight size={16} />
                </a>
              </div>

              <div className="relative min-h-[420px] overflow-hidden bg-[#0a0911] p-8 text-white">
                <div
                  className={`absolute right-[-100px] top-[-100px] h-[300px] w-[300px] rounded-full ${currentAccent.bg} opacity-20 blur-[100px]`}
                />

                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white/40">
                      AXON / {currentService.id.toUpperCase()}
                    </span>

                    <div className="flex items-center gap-2 text-xs font-bold text-green-400">
                      <span className="h-2 w-2 rounded-full bg-green-400" />
                      Connected
                    </div>
                  </div>

                  <div className="mt-12 grid gap-3 sm:grid-cols-2">
                    {currentService.features.map((feature, index) => (
                      <div
                        key={feature}
                        className="group rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl transition hover:bg-white/10"
                      >
                        <div
                          className={`mb-5 flex h-9 w-9 items-center justify-center rounded-xl ${currentAccent.bg} text-black`}
                        >
                          <Check size={16} />
                        </div>

                        <div className="font-bold">{feature}</div>

                        <div className="mt-2 text-xs leading-5 text-white/40">
                          Intelligent tools designed to improve growth.
                        </div>

                        <div className="mt-5 flex items-center gap-2 text-xs font-bold text-white/40">
                          0{index + 1}
                          <ArrowRight size={13} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          AI TOOLS
      ========================================================== */}
      <section
        id="tools"
        className="relative overflow-hidden bg-[#090810] px-6 py-28 text-white lg:px-10"
      >
        <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-purple-600/10 blur-[150px]" />

        <div className="relative mx-auto max-w-7xl">
          <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.3em] text-yellow-400">
                Axon tools
              </div>

              <h2 className="mt-5 text-5xl font-black leading-[0.95] tracking-[-0.04em] sm:text-7xl">
                Your social
                <br />
                <span className="text-white/30">growth engine.</span>
              </h2>

              <p className="mt-7 max-w-md text-base leading-7 text-white/45">
                Powerful tools built around the platforms where your audience
                already lives.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {platforms.map((platform) => {
                  const Icon = platform.icon;

                  return (
                    <button
                      key={platform.name}
                      onClick={() => setActivePlatform(platform.name)}
                      className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition ${
                        activePlatform === platform.name
                          ? "border-white/20 bg-white text-black"
                          : "border-white/10 bg-white/5 text-white/50 hover:text-white"
                      }`}
                    >
                      <Icon size={14} />
                      {platform.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {tools.map((tool, index) => {
                const Icon = tool.icon;
                const active = index === activeTool;
                const accent = accentMap[tool.color];

                return (
                  <button
                    key={tool.name}
                    onClick={() => setActiveTool(index)}
                    className={`group rounded-[28px] border p-6 text-left transition duration-300 ${
                      active
                        ? `border-white/20 bg-white/10 shadow-xl`
                        : "border-white/5 bg-white/[0.03] hover:bg-white/[0.07]"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-2xl ${accent.bg} text-black`}
                      >
                        <Icon size={19} />
                      </div>

                      <ArrowRight
                        size={17}
                        className="text-white/30 transition group-hover:translate-x-1 group-hover:text-white"
                      />
                    </div>

                    <h3 className="mt-7 text-xl font-black">{tool.name}</h3>

                    <p className="mt-2 text-sm leading-6 text-white/40">
                      {tool.text}
                    </p>

                    <div className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/25">
                      {activePlatform}
                      <span>•</span>
                      AI POWERED
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tool console */}
          <div className="mt-10 overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.04]">
            <div className="flex items-center gap-2 border-b border-white/10 px-6 py-4">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-400" />

              <span className="ml-4 text-xs font-bold text-white/30">
                axon://intelligence
              </span>
            </div>

            <div className="grid gap-8 p-8 lg:grid-cols-[1fr_0.8fr]">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-white/30">
                  Selected tool
                </div>

                <h3 className="mt-3 text-3xl font-black">
                  {tools[activeTool].name}
                </h3>

                <p className="mt-3 max-w-xl text-sm leading-6 text-white/45">
                  {tools[activeTool].text} Axon analyses your connected social
                  data and turns repetitive workflows into intelligent actions.
                </p>

                <button className="mt-7 flex items-center gap-3 rounded-full bg-white px-5 py-3 text-sm font-black text-black">
                  Try the tool
                  <ArrowRight size={15} />
                </button>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
                <div className="text-xs font-bold text-white/30">
                  LIVE SIGNAL
                </div>

                <div className="mt-5 flex items-end gap-3">
                  <div className="text-5xl font-black">2.4×</div>
                  <div className="pb-2 text-xs font-bold text-green-400">
                    faster growth
                  </div>
                </div>

                <div className="mt-6 h-20">
                  <div className="flex h-full items-end gap-1">
                    {[22, 35, 30, 47, 41, 62, 57, 73, 68, 91].map(
                      (height, index) => (
                        <div
                          key={index}
                          className="flex-1 rounded-t-md bg-purple-500/70"
                          style={{ height: `${height}%` }}
                        />
                      ),
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          INTELLIGENCE
      ========================================================== */}
      <section className="bg-[#f4f4f1] px-6 py-28 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <div className="text-xs font-black uppercase tracking-[0.3em] text-purple-600">
              Axon intelligence
            </div>

            <h2 className="mx-auto mt-5 max-w-4xl text-5xl font-black leading-[0.95] tracking-[-0.05em] sm:text-7xl">
              Data becomes
              <br />
              <span className="text-black/25">direction.</span>
            </h2>

            <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-black/50">
              Axon doesn't just show you numbers. It helps you understand what
              they mean and what you should do next.
            </p>
          </div>

          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {[
              {
                number: "01",
                title: "What worked?",
                text: "Identify the content, creators and campaigns driving results.",
                color: "bg-purple-500",
              },
              {
                number: "02",
                title: "Who performed?",
                text: "Compare creators and audiences using real performance signals.",
                color: "bg-cyan-400",
              },
              {
                number: "03",
                title: "What next?",
                text: "Turn analytics into actionable recommendations for growth.",
                color: "bg-yellow-400",
              },
            ].map((item) => (
              <div
                key={item.number}
                className="group rounded-[32px] bg-white p-8 transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.color} text-sm font-black text-black`}
                >
                  {item.number}
                </div>

                <h3 className="mt-8 text-3xl font-black">{item.title}</h3>

                <p className="mt-3 text-sm leading-6 text-black/45">
                  {item.text}
                </p>

                <div className="mt-10 flex h-2 gap-1">
                  <div className={`w-[70%] rounded-full ${item.color}`} />
                  <div className="w-[20%] rounded-full bg-black/5" />
                  <div className="flex-1 rounded-full bg-black/5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          ANALYTICS
      ========================================================== */}
      <section className="bg-white px-6 py-28 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr]">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.3em] text-lime-600">
                One view
              </div>

              <h2 className="mt-5 text-5xl font-black leading-none tracking-[-0.04em] sm:text-6xl">
                Your entire
                <br />
                social universe.
              </h2>

              <p className="mt-6 max-w-md text-base leading-7 text-black/50">
                Connect your social platforms and see the bigger picture instead
                of isolated metrics.
              </p>

              <div className="mt-8 space-y-3">
                {[
                  "Audience intelligence",
                  "Content performance",
                  "Campaign analytics",
                  "Growth trends",
                  "Creator ROI",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-sm font-bold"
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-lime-400">
                      <Check size={13} />
                    </div>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[36px] bg-[#101014] p-6 text-white sm:p-8">
              <div className="flex flex-wrap gap-2">
                {["All", "Instagram", "YouTube", "Facebook"].map((item) => (
                  <button
                    key={item}
                    onClick={() =>
                      setActivePlatform(item === "All" ? "Instagram" : item)
                    }
                    className={`rounded-full px-4 py-2 text-xs font-bold ${
                      (item === "All" && activePlatform === "Instagram") ||
                      item === activePlatform
                        ? "bg-white text-black"
                        : "bg-white/5 text-white/40"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div className="mt-10 grid gap-3 sm:grid-cols-2">
                {[
                  ["Followers", "284K", "+8.4%"],
                  ["Reach", "3.8M", "+21%"],
                  ["Engagement", "8.7%", "+12%"],
                  ["Views", "5.2M", "+34%"],
                ].map(([label, value, growth]) => (
                  <div
                    key={label}
                    className="rounded-3xl border border-white/10 bg-white/[0.04] p-6"
                  >
                    <div className="text-xs font-bold text-white/30">
                      {label}
                    </div>

                    <div className="mt-3 text-3xl font-black">{value}</div>

                    <div className="mt-2 text-xs font-bold text-lime-400">
                      {growth}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white/30">
                      PERFORMANCE
                    </div>
                    <div className="mt-1 text-sm font-bold">Content reach</div>
                  </div>

                  <TrendingUp className="text-lime-400" size={20} />
                </div>

                <div className="mt-8 flex h-32 items-end gap-2">
                  {[35, 48, 43, 65, 52, 78, 68, 90, 76, 100, 86, 95].map(
                    (height, index) => (
                      <div
                        key={index}
                        className="flex-1 rounded-t-lg bg-lime-400/80"
                        style={{ height: `${height}%` }}
                      />
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          INDIA → GLOBAL
      ========================================================== */}
      <section className="relative overflow-hidden bg-white px-6 py-32 lg:px-10">
        <div className="absolute inset-x-0 top-1/2 h-px bg-black/5" />

        <div className="relative mx-auto max-w-7xl">
          <div className="rounded-[48px] bg-[#eaffdf] px-8 py-16 sm:px-14 lg:px-20">
            <div className="grid items-center gap-14 lg:grid-cols-[1fr_auto_1fr]">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.3em] text-black/40">
                  Our vision
                </div>

                <div className="mt-6 text-7xl font-black tracking-[-0.07em] sm:text-8xl">
                  INDIA
                </div>

                <p className="mt-5 max-w-sm text-sm leading-6 text-black/55">
                  Build the infrastructure that helps India's creator economy
                  compete with the world.
                </p>
              </div>

              <div className="flex flex-col items-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-black text-white shadow-2xl">
                  <Rocket size={31} />
                </div>

                <div className="my-5 h-20 w-px bg-black/20" />

                <div className="text-xs font-black tracking-[0.3em] text-black/30">
                  AXON
                </div>

                <ArrowRight className="my-5 hidden lg:block" size={30} />

                <ArrowDown className="my-5 lg:hidden" size={30} />
              </div>

              <div className="text-right">
                <div className="text-7xl font-black tracking-[-0.07em] sm:text-8xl">
                  GLOBAL
                </div>

                <p className="ml-auto mt-5 max-w-sm text-sm leading-6 text-black/55">
                  A network where creators, businesses and digital communities
                  can grow without borders.
                </p>

                <div className="mt-6 flex justify-end">
                  <Globe2 size={30} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FLYWHEEL
      ========================================================== */}
      <section className="bg-[#090810] px-6 py-32 text-white lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <div className="text-xs font-black uppercase tracking-[0.3em] text-purple-400">
              The Axon flywheel
            </div>

            <h2 className="mx-auto mt-5 max-w-4xl text-5xl font-black leading-none tracking-[-0.05em] sm:text-7xl">
              Growth creates
              <br />
              <span className="text-white/25">more growth.</span>
            </h2>
          </div>

          <div className="relative mx-auto mt-20 h-[500px] max-w-4xl">
            <div className="absolute left-1/2 top-1/2 h-[370px] w-[370px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />

            <div className="absolute left-1/2 top-1/2 h-[220px] w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-purple-500/20" />

            <div className="absolute left-1/2 top-1/2 flex h-32 w-32 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-purple-600 shadow-[0_0_100px_rgba(139,92,246,0.4)]">
              <div className="text-center">
                <div className="text-2xl font-black">AXON</div>
                <div className="mt-1 text-[9px] font-bold tracking-[0.25em] text-white/50">
                  FLYWHEEL
                </div>
              </div>
            </div>

            {[
              ["Creator", "left-0 top-10", "bg-purple-500"],
              ["Content", "right-0 top-10", "bg-pink-500"],
              ["Audience", "right-0 bottom-10", "bg-cyan-400"],
              ["Business", "left-0 bottom-10", "bg-orange-500"],
              ["Data", "left-1/2 top-[-20px] -translate-x-1/2", "bg-lime-400"],
              [
                "Better campaigns",
                "left-1/2 bottom-[-20px] -translate-x-1/2",
                "bg-yellow-400",
              ],
            ].map(([label, position, color]) => (
              <div
                key={label}
                className={`absolute ${position} flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-xl`}
              >
                <span className={`h-3 w-3 rounded-full ${color as string}`} />
                <span className="text-sm font-black">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          FAQ
      ========================================================== */}
      <section className="bg-white px-6 py-28 lg:px-10">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <div className="text-xs font-black uppercase tracking-[0.3em] text-black/30">
              Inside Axon
            </div>

            <h2 className="mt-5 text-5xl font-black tracking-[-0.05em] sm:text-6xl">
              Questions?
            </h2>
          </div>

          <div className="mt-12 space-y-3">
            {[
              [
                "What is Axon?",
                "Axon is an intelligent creator-economy platform connecting creators, clippers and businesses through discovery, campaigns, analytics, AI tools and payments.",
              ],
              [
                "Which platforms can connect to Axon?",
                "Axon is designed around major social platforms such as Instagram, YouTube and Facebook, with platform-specific data powering a unified intelligence layer.",
              ],
              [
                "What can businesses do?",
                "Businesses can discover creators, manage campaigns, monitor content and analyze performance and ROI.",
              ],
              [
                "What can creators do?",
                "Creators can discover campaigns, understand their audience, track performance, improve their profile and grow their earnings.",
              ],
            ].map(([question, answer], index) => {
              const open = openFaq === index;

              return (
                <div
                  key={question}
                  className="overflow-hidden rounded-3xl border border-black/5 bg-[#f7f7f5]"
                >
                  <button
                    onClick={() => setOpenFaq(open ? null : index)}
                    className="flex w-full items-center justify-between px-6 py-5 text-left"
                  >
                    <span className="font-black">{question}</span>

                    <ChevronDown
                      size={18}
                      className={`transition ${open ? "rotate-180" : ""}`}
                    />
                  </button>

                  {open && (
                    <div className="px-6 pb-6 text-sm leading-6 text-black/50">
                      {answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================
          INTERACTIVE COSMIC FOOTER
      ========================================================== */}
      <footer
        id="join"
        className="relative overflow-hidden bg-[#080612] px-6 pb-8 pt-24 text-white lg:px-10"
      >
        {/* Footer stars */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 50 }).map((_, i) => (
            <span
              key={i}
              className="absolute h-[2px] w-[2px] rounded-full bg-white/60"
              style={{
                left: `${(i * 47) % 100}%`,
                top: `${(i * 29) % 100}%`,
              }}
            />
          ))}
        </div>

        <div className="relative mx-auto max-w-7xl">
          {/* Giant CTA */}
          <div className="border-b border-white/10 pb-20">
            <div className="grid items-end gap-10 lg:grid-cols-[1fr_auto]">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.3em] text-purple-400">
                  The next chapter
                </div>

                <h2 className="mt-6 max-w-5xl text-6xl font-black leading-[0.85] tracking-[-0.06em] sm:text-8xl lg:text-[110px]">
                  You want to
                  <br />
                  grow with
                  <br />
                  <span className="text-white/25">Axon?</span>
                </h2>
              </div>

              <a
                 onClick={(e) => {
                  e.preventDefault();
                  openJoinModal();
                }}
                className="group relative flex h-36 w-36 shrink-0 items-center justify-center rounded-full bg-white text-center text-black transition duration-500 hover:scale-110 hover:rotate-6 sm:h-44 sm:w-44"
              >
                <div>
                  <div className="text-sm font-black">
                      JOIN AXON
                  </div>
                  <ArrowRight
                    className="mx-auto mt-2 transition group-hover:translate-x-2"
                    size={20}
                  />
                </div>

                <div className="absolute inset-[-10px] rounded-full border border-white/10 transition group-hover:inset-[-18px]" />
              </a>
            </div>
          </div>

          {/* Footer navigation */}
          <div className="grid gap-12 py-14 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 font-black">
                  <img
                    src="/axon.png"
                    alt="AXON"
                    className="
                    rounded-full
                    h-30
                    w-auto
                    object-contain
                    drop-shadow-[0_0_12px_rgba(168,85,247,0.45)]
                 "
                  />
                </div>

                <div className="text-xl font-black">axon</div>
              </div>

              <p className="mt-6 max-w-xs text-sm leading-6 text-white/35">
                The intelligent infrastructure for India's creator economy.
              </p>

              <div className="mt-6 flex gap-2">
                {["I", "Y", "L"].map((item) => (
                  <button
                    key={item}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs font-black transition hover:bg-white hover:text-black"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs font-black uppercase tracking-[0.2em] text-white/30">
                Company
              </div>

              <div className="mt-5 space-y-3 text-sm font-bold text-white/55">
                <a href="#" className="block transition hover:text-white">
                  About Us
                </a>
                <a href="#" className="block transition hover:text-white">
                  Careers
                </a>
                <a href="#" className="block transition hover:text-white">
                  Contact Us
                </a>
              </div>
            </div>

            <div>
              <div className="text-xs font-black uppercase tracking-[0.2em] text-white/30">
                Product
              </div>

              <div className="mt-5 space-y-3 text-sm font-bold text-white/55">
                <a
                  href="/for-creators#creators"
                  className="block transition hover:text-white"
                >
                  For Creators
                </a>
                <a
                  href="for-clippers#clippers"
                  className="block transition hover:text-white"
                >
                  For Clippers
                </a>
                <a
                  href="/for-businesses#businesses"
                  className="block transition hover:text-white"
                >
                  For Businesses
                </a>
                <a href="#tools" className="block transition hover:text-white">
                  Tools
                </a>
              </div>
            </div>

            <div>
              <div className="text-xs font-black uppercase tracking-[0.2em] text-white/30">
                Help
              </div>

              <div className="mt-5 space-y-3 text-sm font-bold text-white/55">
                <a
                  href="mailto:sv5828365@gmail.com"
                  className="block transition hover:text-white"
                >
                  sv5828365@gmail.com
                </a>
                <a href="#" className="block transition hover:text-white">
                  Instagram
                </a>
                <a href="#" className="block transition hover:text-white">
                  Facebook
                </a>
                <a href="#" className="block transition hover:text-white">
                  LinkedIn
                </a>
              </div>
            </div>
          </div>

          {/* Bottom cosmic strip */}
          <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.03] p-7">
            <div className="absolute right-10 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-purple-600/10 blur-3xl" />

            <div className="relative flex flex-col items-center justify-between gap-6 sm:flex-row">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/25">
                  Built from India
                </div>

                <div className="mt-2 text-3xl font-black tracking-[-0.04em]">
                  India <span className="text-purple-400">→</span> Global
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs font-bold text-white/30">
                <Link2 size={14} />
                One connected creator universe
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-3 py-7 text-[11px] font-bold text-white/20 sm:flex-row">
            <span>© {new Date().getFullYear()} Axon. All rights reserved.</span>
            <span>Creators • Clippers • Businesses • Intelligence</span>
          </div>
        </div>
      </footer>
    </main>
    {showJoin && (<JoinModal onClose={closeJoinModal} />)}
    </>
  );
}
