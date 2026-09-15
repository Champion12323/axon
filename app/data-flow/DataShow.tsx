"use client";

import {
  ArrowDown,
  ArrowRight,
  BarChart3,
  Users,
  Megaphone,
  Sparkles,
} from "lucide-react";
import { FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";
import { useEffect, useState } from "react";

const platforms = [
  {
    name: "Instagram",
    icon: FaInstagram,
    gradient: "from-pink-500 via-purple-500 to-orange-400",
    data: ["Reels", "Followers", "Likes", "Reach", "Audience"],
  },
  {
    name: "YouTube",
    icon: FaYoutube,
    gradient: "from-red-500 to-red-700",
    data: ["Videos", "Subscribers", "Views", "Watch Time", "Audience"],
  },
  {
    name: "Facebook",
    icon: FaFacebook,
    gradient: "from-blue-500 to-blue-700",
    data: ["Posts", "Followers", "Reach", "Likes", "Engagement"],
  },
];

const outputs = [
  {
    title: "Creator Analytics",
    text: "Understand creator performance across platforms.",
    icon: BarChart3,
  },
  {
    title: "Creator Discovery",
    text: "Find the right creators for every campaign.",
    icon: Users,
  },
  {
    title: "Campaign Intelligence",
    text: "Turn creator data into better brand decisions.",
    icon: Megaphone,
  },
];

export default function DataFlow() {
  const [activePlatform, setActivePlatform] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActivePlatform((prev) => (prev + 1) % platforms.length);
    }, 2200);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden bg-[#09081B] px-6 py-28 rounded-tl-[60px] rounded-br-[60px]">
      {/* Background glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-600/10 blur-[150px]" />

      <div className="pointer-events-none absolute left-[-150px] top-[20%] h-[300px] w-[300px] rounded-full bg-violet-600/10 blur-[120px]" />

      <div className="pointer-events-none absolute right-[-150px] bottom-[10%] h-[350px] w-[350px] rounded-full bg-blue-600/10 blur-[130px]" />

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* ================= HEADER ================= */}

        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-500/10 px-4 py-2 text-sm text-purple-300">
            <Sparkles className="h-4 w-4" />
            Connected creator ecosystem
          </div>

          <h2 className="text-4xl font-black tracking-tight text-white sm:text-6xl">
            One creator.
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-violet-300 to-blue-400 bg-clip-text text-transparent font-[cursive]">
              Every platform.
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-white/45 sm:text-lg">
            Axon connects the creator's social presence across Instagram,
            YouTube and Facebook — bringing fragmented data into one intelligent
            ecosystem.
          </p>
        </div>

        {/* ================= SOCIAL PLATFORMS ================= */}

        <div className="mt-20 grid gap-5 md:grid-cols-3">
          {platforms.map((platform, index) => {
            const Icon = platform.icon;

            const active = index === activePlatform;

            return (
              <div
                key={platform.name}
                onClick={() => setActivePlatform(index)}
                className={`
                  group relative cursor-pointer overflow-hidden
                  rounded-[28px] border p-6
                  transition-all duration-500
                  ${
                    active
                      ? "border-purple-400/40 bg-white/[0.08] shadow-[0_20px_80px_rgba(124,58,237,0.15)]"
                      : "border-white/10 bg-white/[0.035] hover:border-white/20"
                  }
                `}
              >
                {/* platform glow */}

                <div
                  className={`
                    absolute -right-12 -top-12 h-40 w-40
                    rounded-full bg-gradient-to-br ${platform.gradient}
                    opacity-10 blur-3xl
                    transition-all duration-500
                    group-hover:opacity-25
                  `}
                />

                <div className="relative">
                  <div className="flex items-center justify-between">
                    <div
                      className={`
                        flex h-14 w-14 items-center justify-center
                        rounded-2xl bg-gradient-to-br ${platform.gradient}
                        shadow-lg
                      `}
                    >
                      <Icon className="h-7 w-7 text-white" />
                    </div>

                    {active && (
                      <div className="flex items-center gap-2 text-xs text-green-400">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
                        Connected
                      </div>
                    )}
                  </div>

                  <h3 className="mt-6 text-xl font-bold text-white">
                    {platform.name}
                  </h3>

                  <p className="mt-2 text-sm text-white/40">
                    Creator data source
                  </p>

                  {/* Data chips */}

                  <div className="mt-5 flex flex-wrap gap-2">
                    {platform.data.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/45"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ================= FLOW ARROW ================= */}

        <div className="relative flex justify-center py-12">
          <div className="absolute left-1/2 top-0 h-full w-px bg-gradient-to-b from-purple-500/0 via-purple-500/50 to-purple-500/0" />

          <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-purple-400/20 bg-[#11102A] shadow-lg shadow-purple-500/20">
            <ArrowDown className="h-6 w-6 animate-bounce text-purple-400" />
          </div>
        </div>

        {/* ================= AXON DATA LAYER ================= */}

        <div className="relative mx-auto max-w-4xl">
          {/* Glow */}

          <div className="absolute inset-0 rounded-[40px] bg-purple-600/20 blur-[80px]" />

          <div className="relative overflow-hidden rounded-[38px] border border-purple-400/25 bg-gradient-to-b from-purple-500/[0.10] to-white/[0.025] p-8 sm:p-12">
            {/* rings */}

            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-purple-400/5" />

            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-purple-400/10" />

            <div className="relative text-center">
              {/* Axon logo */}

              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[24px] bg-gradient-to-br from-purple-500 via-violet-600 to-blue-600 text-3xl font-black shadow-2xl shadow-purple-500/30">
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

              <h3 className="mt-6 text-3xl font-black text-white">Axon</h3>

              <p className="mt-2 text-white/40">Creator intelligence layer</p>

              {/* Processing steps */}

              <div className="mx-auto mt-8 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
                {["Collect", "Normalize", "Analyze", "Activate"].map(
                  (step, index) => (
                    <div
                      key={step}
                      className="rounded-xl border border-white/10 bg-white/[0.035] px-3 py-4"
                    >
                      <div className="mx-auto mb-2 flex h-7 w-7 items-center justify-center rounded-full bg-purple-500/10 text-xs text-purple-300">
                        {index + 1}
                      </div>

                      <span className="text-xs text-white/50">{step}</span>
                    </div>
                  ),
                )}
              </div>

              {/* Live data stream */}

              <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-5 text-left">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-xs uppercase tracking-[0.18em] text-white/30">
                    Axon data stream
                  </span>

                  <span className="flex items-center gap-2 text-xs text-green-400">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
                    Live sync
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {[
                    "Profile",
                    "Followers",
                    "Content",
                    "Views",
                    "Likes",
                    "Comments",
                    "Reach",
                    "Engagement",
                    "Audience",
                    "Insights",
                  ].map((item, index) => (
                    <span
                      key={item}
                      className={`
                        rounded-full border px-3 py-1.5 text-xs
                        transition-all duration-500
                        ${
                          index === activePlatform + 2
                            ? "border-purple-400/40 bg-purple-500/20 text-purple-200"
                            : "border-white/10 bg-white/[0.03] text-white/35"
                        }
                      `}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= OUTPUT ARROW ================= */}

        <div className="flex justify-center py-12">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-purple-400/20 bg-purple-500/10">
            <ArrowDown className="h-6 w-6 text-purple-400" />
          </div>
        </div>

        {/* ================= OUTPUTS ================= */}

        <div className="grid gap-5 md:grid-cols-3">
          {outputs.map((output) => {
            const Icon = output.icon;

            return (
              <div
                key={output.title}
                className="group rounded-[28px] border border-white/10 bg-white/[0.035] p-6 transition-all duration-300 hover:-translate-y-2 hover:border-purple-400/30 hover:bg-white/[0.06]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10">
                  <Icon className="h-6 w-6 text-purple-400" />
                </div>

                <h3 className="mt-6 text-lg font-bold text-white">
                  {output.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-white/40">
                  {output.text}
                </p>

                <div className="mt-5 flex items-center gap-2 text-sm text-purple-300 opacity-0 transition group-hover:opacity-100">
                  Explore
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            );
          })}
        </div>

        {/* ================= BOTTOM MESSAGE ================= */}

        <div className="mt-20 text-center">
          <p className="text-sm uppercase tracking-[0.25em] text-white/25">
            Connect → Understand → Grow
          </p>

          <h3 className="mt-4 text-2xl font-bold text-white sm:text-3xl">
            From social data
            <span className="text-purple-400 font-[cursive]"> to creator intelligence.</span>
          </h3>
        </div>
      </div>
    </section>
  );
}
