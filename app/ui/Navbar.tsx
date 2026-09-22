"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  ChevronDown,
  CircleDollarSign,
  Command,
  Compass,
  Download,
  Menu,
  Search,
  Sparkles,
  Target,
  Users,
  WandSparkles,
  X,
  Zap,
} from "lucide-react";
import JoinModal from "./JoinModal";

type NavItem = {
  label: string;
  description: string;
  icon: React.ElementType;
  accent: string;
  items: {
    label: string;
    description: string;
    href?: string;
    icon: React.ElementType;
  }[];
};

const navItems: NavItem[] = [
  {
    label: "ForCreators",
    description: "Discover campaigns. Grow your influence.",
    icon: Users,
    accent: "from-violet-500 to-fuchsia-500",
    items: [
      {
        label: "Find Campaigns",
        description: "Discover campaigns that fit your audience.",
        href: "/for-creators#campaigns",
        icon: Target,
      },
      {
        label: "Account Analytics",
        description: "Understand your audience and growth.",
        href: "/for-creators#analytics",
        icon: BarChart3,
      },
    ],
  },
  {
    label: "ForClippers",
    description: "Turn content into recurring income.",
    icon: Zap,
    accent: "from-cyan-400 to-blue-500",
    items: [
      {
        label: "Clip Marketplace",
        description: "Find content worth clipping.",
        href: "/for-clippers#marketplace",
        icon: Compass,
      },
      {
        label: "Earn Monthly",
        description: "Build predictable clipping income.",
        href: "/for-clippers#earn-monthly",
        icon: CircleDollarSign,
      },
    ],
  },
  {
    label: "ForBusinesses",
    description: "Find creators. Run campaigns. Measure.",
    icon: BriefcaseBusiness,
    accent: "from-amber-400 to-orange-500",
    items: [
      {
        label: "Find Creators",
        description: "AI-powered creator discovery.",
        href: "/for-businesses#find-creators",
        icon: Search,
      },
      {
        label: "Campaign Management",
        description: "Manage your entire campaign.",
        href: "/for-businesses#campaign-management",
        icon: Command,
      },
      {
        label: "Campaign Analytics",
        description: "Measure campaign performance.",
        href: "/for-businesses#campaign-analytics",
        icon: BarChart3,
      },
    ],
  },
  {
    label: "Tools",
    description: "AI-powered tools for the creator economy.",
    icon: WandSparkles,
    accent: "from-pink-500 to-violet-500",
    items: [
    
      {
        label: "Creator Tools",
        description: "Tools built for creators.",
        href: "/tools#tools",
        icon: Sparkles,
      },
    ],
  },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showJoin, setShowJoin] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activePreview, setActivePreview] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const openJoinModal = () => {
    setShowJoin(true);
    setMobileOpen(false);
    setActiveDropdown(null);
  };

  const closeJoinModal = () => {
    setShowJoin(false);
  };

  const closeNavigation = () => {
    setActiveDropdown(null);
    setMobileOpen(false);
  };

  return (
    <>
      <header
        className={`
          fixed left-0 right-0 top-0 z-[100] px-3 pt-3
          sm:px-5 sm:pt-4
          transition-all duration-500
        `}
      >
        <nav
          className={`
            relative mx-auto max-w-7xl
            overflow-visible
            border
            transition-all duration-500
            ${
              scrolled
                ? `
                  rounded-[50px]
                  border-white/[0.14]
                  bg-[#080714]/30
                  shadow-[0_15px_60px_rgba(70,30,160,0.28)]
                  backdrop-blur-2xl
                  `
                : `
                  rounded-[50px]
                  border-white/[0.09]
                  bg-[#0B0A1F]/70
                  shadow-[0_10px_50px_rgba(80,40,180,0.18)]
                  backdrop-blur-xl
                `
            }
          `}
        >
          {/* COSMIC EDGE GLOW */}
          <div className="pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden">
            <div
              className="
                absolute -left-20 top-0
                h-px w-56
                bg-gradient-to-r
                from-transparent
                via-violet-400/70
                to-transparent
                animate-[navLight_5s_linear_infinite]
              "
            />

            <div
              className="
                absolute -right-20 bottom-0
                h-px w-56
                bg-gradient-to-r
                from-transparent
                via-fuchsia-400/50
                to-transparent
                animate-[navLightReverse_6s_linear_infinite]
              "
            />
          </div>

          {/* MAIN NAV */}
          <div
            className={`
              relative z-10 flex items-center justify-between
              px-4 transition-all duration-500
              sm:px-6
              ${scrolled ? "h-[62px]" : "h-[72px]"}
            `}
          >
            {/* LOGO */}
            <a
              href="/"
              onClick={closeNavigation}
              className="group relative flex shrink-0 items-center"
            >
              <div
                className="
                  absolute -inset-3
                  rounded-full
                  bg-violet-500/10
                  blur-xl
                  opacity-0
                  transition-opacity duration-500
                  group-hover:opacity-100
                "
              />

              <img
                src="/axonnn-logo2.png"
                alt="AXONNN"
                className={`
                  relative z-10 w-auto object-contain
                  transition-all duration-500
                  ${
                    scrolled
                      ? "h-11 sm:h-12"
                      : "h-12 sm:h-14"
                  }
                  drop-shadow-[0_0_14px_rgba(168,85,247,0.42)]
                  group-hover:scale-105
                `}
              />
            </a>

            {/* DESKTOP NAV */}
            <div className="hidden items-center lg:flex">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeDropdown === item.label;

                return (
                  <div
                    key={item.label}
                    className="relative"
                    onMouseEnter={() => {
                      setActiveDropdown(item.label);
                      setActivePreview(item.items[0]?.label ?? null);
                    }}
                    onMouseLeave={() => {
                      setActiveDropdown(null);
                      setActivePreview(null);
                    }}
                  >
                    <button
                      type="button"
                      className={`
                        group relative flex items-center gap-2
                        rounded-xl px-4 py-3
                        text-[13px] font-medium
                        transition-all duration-300
                        ${
                          isActive
                            ? "bg-white/[0.07] text-white"
                            : "text-white/65 hover:bg-white/[0.045] hover:text-white"
                        }
                      `}
                    >
                      {/* ACTIVE DOT */}
                      <span
                        className={`
                          absolute bottom-1 left-1/2
                          h-0.5 -translate-x-1/2
                          rounded-full
                          bg-gradient-to-r ${item.accent}
                          transition-all duration-300
                          ${
                            isActive
                              ? "w-5 opacity-100"
                              : "w-0 opacity-0"
                          }
                        `}
                      />

                      <Icon
                        size={15}
                        className={`
                          transition-all duration-300
                          ${
                            isActive
                              ? "text-violet-600"
                              : "text-white/40 group-hover:text-violet-600"
                          }
                        `}
                      />

                      <span>{item.label}</span>

                      <ChevronDown
                        size={14}
                        className={`
                          transition-transform duration-300
                          ${
                            isActive
                              ? "rotate-180 text-violet-300"
                              : "text-white/30"
                          }
                        `}
                      />
                    </button>

                    {/* MEGA DROPDOWN */}
                    <div
                      className={`
                        absolute left-1/2 top-full
                        w-[390px]
                        -translate-x-1/2
                        pt-3
                        transition-all duration-300
                        ${
                          isActive
                            ? "pointer-events-auto translate-y-0 opacity-100"
                            : "pointer-events-none -translate-y-2 opacity-0"
                        }
                      `}
                    >
                      <div
                        className="
                          relative overflow-hidden
                          rounded-[24px]
                          border border-white/[0.11]
                          bg-[#090817]/95
                          p-2
                          shadow-[0_30px_100px_rgba(0,0,0,0.6)]
                          backdrop-blur-2xl
                        "
                      >
                        {/* DROPDOWN GLOW */}
                        <div
                          className={`
                            pointer-events-none absolute
                            -right-16 -top-16
                            h-40 w-40 rounded-full
                            bg-gradient-to-br ${item.accent}
                            opacity-15 blur-3xl
                          `}
                        />

                        {/* HEADER */}
                        <div className="relative mb-1 px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span
                              className={`
                                flex h-7 w-7 items-center justify-center
                                rounded-lg
                                bg-gradient-to-br ${item.accent}
                                shadow-lg
                              `}
                            >
                              <Icon
                                size={14}
                                className="text-white"
                              />
                            </span>

                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/35">
                                Axonnn
                              </p>

                              <p className="text-sm font-medium text-white/90">
                                {item.description}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* ITEMS */}
                        <div className="relative space-y-1">
                          {item.items.map((subItem) => {
                            const SubIcon = subItem.icon;
                            const selected =
                              activePreview === subItem.label;

                            return (
                              <a
                                key={subItem.label}
                                href={subItem.href ?? "#"}
                                onMouseEnter={() =>
                                  setActivePreview(subItem.label)
                                }
                                className={`
                                  group/item relative
                                  flex items-center gap-3
                                  rounded-2xl
                                  px-3 py-3
                                  transition-all duration-200
                                  ${
                                    selected
                                      ? "bg-white/[0.07]"
                                      : "hover:bg-white/[0.045]"
                                  }
                                `}
                              >
                                <div
                                  className={`
                                    flex h-10 w-10 shrink-0
                                    items-center justify-center
                                    rounded-xl
                                    border border-white/[0.08]
                                    transition-all duration-300
                                    ${
                                      selected
                                        ? "border-violet-400/20 bg-violet-500/15"
                                        : "bg-white/[0.025]"
                                    }
                                  `}
                                >
                                  <SubIcon
                                    size={17}
                                    className={`
                                      transition-colors
                                      ${
                                        selected
                                          ? "text-violet-600"
                                          : "text-white/45"
                                      }
                                    `}
                                  />
                                </div>

                                <div className="min-w-0 flex-1">
                                  <p
                                    className={`
                                      text-sm font-medium
                                      ${
                                        selected
                                          ? "text-white"
                                          : "text-white/75"
                                      }
                                    `}
                                  >
                                    {subItem.label}
                                  </p>

                                  <p className="mt-0.5 truncate text-[11px] text-white/35">
                                    {subItem.description}
                                  </p>
                                </div>

                                <ArrowRight
                                  size={15}
                                  className={`
                                    transition-all duration-300
                                    ${
                                      selected
                                        ? "translate-x-0 text-violet-600 opacity-100"
                                        : "-translate-x-1 text-white/20 opacity-0"
                                    }
                                  `}
                                />
                              </a>
                            );
                          })}
                        </div>

                        {/* FOOTER */}
                        <div className="mt-2 flex items-center justify-between border-t border-white/[0.07] px-4 py-3">
                          <span className="text-[10px] uppercase tracking-[0.2em] text-white/25">
                            India → Global
                          </span>

                          <Sparkles
                            size={13}
                            className="text-violet-300/50"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* DESKTOP RIGHT */}
            <div className="hidden items-center gap-2 lg:flex">
              {/* DOWNLOAD */}
              <a
                href="#download"
                className="
                  group flex items-center gap-2
                  rounded-xl
                  border border-transparent
                  px-3.5 py-2.5
                  text-[13px] font-medium
                  text-white/55
                  transition-all duration-300
                  hover:border-white/[0.07]
                  hover:bg-white/[0.045]
                  hover:text-white
                "
              >
                <span className="relative">
                  <Download
                    size={16}
                    className="
                      text-white/40
                      transition-all duration-300
                      group-hover:-translate-y-0.5
                      group-hover:text-violet-600
                    "
                  />

                  <span
                    className="
                      absolute -right-1 -top-1
                      h-1.5 w-1.5 rounded-full
                      bg-violet-600
                      opacity-0
                      shadow-[0_0_8px_rgba(167,139,250,0.9)]
                      transition-opacity
                      group-hover:opacity-100
                    "
                  />
                </span>

                Download app
              </a>

              <div className="mx-1 h-6 w-px bg-white/[0.08]" />

              {/* JOIN */}
              <a
                href="#join"
                onClick={(e) => {
                  e.preventDefault();
                  openJoinModal();
                }}
                className="
                  group relative flex items-center gap-2
                  overflow-hidden
                  rounded-full
                  border border-violet-300/20
                  bg-gradient-to-r
                  from-violet-600
                  via-purple-600
                  to-fuchsia-500
                  px-5 py-2.5
                  text-[13px] font-semibold
                  text-white
                  shadow-[0_0_25px_rgba(139,92,246,0.3)]
                  transition-all duration-300
                  hover:-translate-y-0.5
                  hover:scale-[1.025]
                  hover:shadow-[0_0_40px_rgba(168,85,247,0.5)]
                "
              >
                {/* SHINE */}
                <span
                  className="
                    pointer-events-none absolute inset-0
                    -translate-x-full
                    bg-gradient-to-r
                    from-transparent
                    via-white/25
                    to-transparent
                    transition-transform duration-700
                    group-hover:translate-x-full
                  "
                />

                {/* PULSE */}
                <span
                  className="
                    absolute -inset-1
                    rounded-full
                    border border-violet-400/20
                    opacity-0
                    transition-opacity duration-300
                    group-hover:opacity-100
                  "
                />

                <span className="relative z-10">
                  Join Now
                </span>

                <ArrowRight
                  size={16}
                  className="
                    relative z-10
                    transition-transform duration-300
                    group-hover:translate-x-1
                  "
                />
              </a>
            </div>

            {/* MOBILE BUTTON */}
            <button
              type="button"
              onClick={() => {
                setMobileOpen((value) => !value);
                setActiveDropdown(null);
              }}
              aria-label="Toggle navigation"
              aria-expanded={mobileOpen}
              className="
                flex h-10 w-10
                items-center justify-center
                rounded-xl
                border border-white/[0.09]
                bg-white/[0.045]
                text-white
                transition-all duration-300
                hover:border-violet-400/20
                hover:bg-violet-500/10
                lg:hidden
              "
            >
              {mobileOpen ? (
                <X size={20} />
              ) : (
                <Menu size={20} />
              )}
            </button>
          </div>

          {/* MOBILE PANEL */}
          <div
            className={`
              relative z-20 overflow-hidden
              border-t border-white/[0.07]
              transition-all duration-500
              lg:hidden
              ${
                mobileOpen
                  ? "max-h-[80vh] opacity-100"
                  : "max-h-0 border-t-transparent opacity-0"
              }
            `}
          >
            <div className="max-h-[75vh] overflow-y-auto p-4">
              <div className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const expanded =
                    activeDropdown === item.label;

                  return (
                    <div key={item.label}>
                      <button
                        type="button"
                        onClick={() =>
                          setActiveDropdown(
                            expanded ? null : item.label
                          )
                        }
                        className={`
                          flex w-full items-center
                          justify-between
                          rounded-2xl
                          border
                          px-4 py-3.5
                          text-left
                          transition-all duration-300
                          ${
                            expanded
                              ? "border-violet-400/15 bg-violet-500/[0.08]"
                              : "border-transparent bg-white/[0.025]"
                          }
                        `}
                      >
                        <span className="flex items-center gap-3">
                          <span
                            className="
                              flex h-9 w-9
                              items-center justify-center
                              rounded-xl
                              bg-white/[0.05]
                            "
                          >
                            <Icon
                              size={17}
                              className="text-violet-600"
                            />
                          </span>

                          <span>
                            <span className="block text-sm font-medium text-white/85">
                              {item.label}
                            </span>

                            <span className="mt-0.5 block text-[10px] text-white/30">
                              {item.description}
                            </span>
                          </span>
                        </span>

                        <ChevronDown
                          size={16}
                          className={`
                            text-white/35
                            transition-transform duration-300
                            ${
                              expanded
                                ? "rotate-180 text-violet-300"
                                : ""
                            }
                          `}
                        />
                      </button>

                      <div
                        className={`
                          grid transition-all duration-300
                          ${
                            expanded
                              ? "grid-rows-[1fr] opacity-100"
                              : "grid-rows-[0fr] opacity-0"
                          }
                        `}
                      >
                        <div className="overflow-hidden">
                          <div className="ml-5 mt-1 space-y-1 border-l border-violet-400/15 pl-3">
                            {item.items.map((subItem) => {
                              const SubIcon = subItem.icon;

                              return (
                                <a
                                  key={subItem.label}
                                  href={subItem.href ?? "#"}
                                  onClick={() =>
                                    setMobileOpen(false)
                                  }
                                  className="
                                    group
                                    flex items-center gap-3
                                    rounded-xl
                                    px-3 py-3
                                    transition-all
                                    hover:bg-white/[0.05]
                                  "
                                >
                                  <SubIcon
                                    size={15}
                                    className="
                                      text-white/30
                                      transition-colors
                                      group-hover:text-violet-300
                                    "
                                  />

                                  <span className="flex-1">
                                    <span className="block text-xs font-medium text-white/70 group-hover:text-white">
                                      {subItem.label}
                                    </span>

                                    <span className="mt-0.5 block text-[10px] text-white/25">
                                      {subItem.description}
                                    </span>
                                  </span>

                                  <ArrowRight
                                    size={13}
                                    className="
                                      text-white/15
                                      transition-all
                                      group-hover:translate-x-1
                                      group-hover:text-violet-300
                                    "
                                  />
                                </a>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* MOBILE DOWNLOAD */}
              <a
                href="#download"
                onClick={() => setMobileOpen(false)}
                className="
                  mt-3 flex items-center gap-3
                  rounded-2xl
                  border border-white/[0.07]
                  bg-white/[0.025]
                  px-4 py-3.5
                  text-sm font-medium
                  text-white/65
                  transition-all
                  hover:bg-white/[0.05]
                  hover:text-white
                "
              >
                <Download size={17} className="text-violet-300" />
                Download app
              </a>

              {/* MOBILE JOIN */}
              <a
                href="#join"
                onClick={(e) => {
                  e.preventDefault();
                  openJoinModal();
                }}
                className="
                  group relative mt-3
                  flex items-center
                  justify-center gap-2
                  overflow-hidden
                  rounded-2xl
                  bg-gradient-to-r
                  from-violet-600
                  via-purple-600
                  to-fuchsia-500
                  px-5 py-3.5
                  text-sm font-semibold
                  text-white
                  shadow-[0_0_30px_rgba(139,92,246,0.3)]
                "
              >
                <span
                  className="
                    absolute inset-0
                    -translate-x-full
                    bg-gradient-to-r
                    from-transparent
                    via-white/20
                    to-transparent
                    transition-transform duration-700
                    group-hover:translate-x-full
                  "
                />

                <span className="relative">
                  Join axonnnnn
                </span>

                <ArrowRight
                  size={17}
                  className="relative"
                />
              </a>

              <div className="mt-5 flex items-center justify-center gap-2">
                <span className="h-1 w-1 rounded-full bg-violet-400" />
                <span className="text-[9px] uppercase tracking-[0.25em] text-white/20">
                  India → Global
                </span>
                <span className="h-1 w-1 rounded-full bg-fuchsia-400" />
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* JOIN MODAL — unchanged */}
      {showJoin && (
        <JoinModal onClose={closeJoinModal} />
      )}
    </>
  );
}