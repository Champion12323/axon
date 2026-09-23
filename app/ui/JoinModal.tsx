"use client";

import { useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  Play,
  Sparkles,
  Users,
  X,
  Zap,
} from "lucide-react";
import { FaInstagram } from "react-icons/fa";

type Role = "creator" | "clipper" | "business";

interface JoinModalProps {
  onClose: () => void;
}

const roleData = {
  creator: {
    name: "Creator",
    label: "Create. Collaborate. Grow.",
    description:
      "Discover campaigns, work with brands, track your growth and turn your audience into income.",
    icon: Users,
    gradient: "from-violet-500 to-fuchsia-500",
    bg: "bg-violet-50",
    border: "border-violet-300",
    text: "text-violet-600",
  },

  clipper: {
    name: "Clipper",
    label: "Clip. Post. Earn.",
    description:
      "Find high-value content, create short-form clips and build a monthly earning stream.",
    icon: Zap,
    gradient: "from-cyan-400 to-blue-500",
    bg: "bg-cyan-50",
    border: "border-cyan-300",
    text: "text-cyan-600",
  },

  business: {
    name: "Business",
    label: "Discover. Campaign. Scale.",
    description:
      "Find the right creators, launch campaigns and measure everything from one intelligent platform.",
    icon: BriefcaseBusiness,
    gradient: "from-orange-400 to-pink-500",
    bg: "bg-orange-50",
    border: "border-orange-300",
    text: "text-orange-600",
  },
};

export default function JoinModal({ onClose }: JoinModalProps) {
  const [role, setRole] = useState<Role>("creator");
  const [phone, setPhone] = useState("");

  const current = roleData[role];
  const RoleIcon = current.icon;
  const sendWhatsApp = () => {
    const cleanPhone = phone.replace(/\D/g, "");

    if (cleanPhone.length !== 10) {
      alert("Please enter a valid 10-digit number");
      return;
    }

    const whatsappNumber = `91${cleanPhone}`;

    const message = `Hi! 👋
          Here is the Axon app link:
          https://axonnn.com/download

          Join Axon and start growing 🚀`;

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    window.location.href = whatsappUrl;
  };
  return (
    <>
      {/* BACKDROP */}
      <div
        className="
          fixed
          inset-0
          z-[999]
          bg-black/40
          backdrop-blur-md
        "
        onClick={onClose}
      />

      {/* MODAL */}
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        <div
          onClick={(e) => e.stopPropagation()}
          className="
            relative
            flex
            w-full
            max-w-[1080px]
            min-h-[640px]
            overflow-hidden
            rounded-[32px]
            border
            border-gray-200
            bg-white
            shadow-[0_35px_100px_rgba(60,30,100,0.22)]
          "
        >
          {/* ================================================= */}
          {/* COLORFUL BACKGROUND BLOBS */}
          {/* ================================================= */}

          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div
              className="
                absolute
                -left-32
                -top-32
                h-[420px]
                w-[420px]
                rounded-full
                bg-purple-200/50
                blur-[80px]
              "
            />

            <div
              className="
                absolute
                -bottom-32
                left-[25%]
                h-[350px]
                w-[350px]
                rounded-full
                bg-pink-200/40
                blur-[90px]
              "
            />

            <div
              className="
                absolute
                -right-32
                top-[-80px]
                h-[380px]
                w-[380px]
                rounded-full
                bg-blue-200/40
                blur-[90px]
              "
            />
          </div>

          {/* ================================================= */}
          {/* CLOSE BUTTON */}
          {/* ================================================= */}

          <button
            onClick={onClose}
            aria-label="Close"
            className="
              absolute
              right-5
              top-5
              z-50
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-full
              border
              border-gray-200
              bg-white/80
              text-gray-500
              shadow-sm
              backdrop-blur
              transition-all
              hover:scale-105
              hover:bg-gray-100
              hover:text-gray-900
            "
          >
            <X size={20} />
          </button>

          {/* ================================================= */}
          {/* LEFT SIDE */}
          {/* ================================================= */}

          <div
            className="
              relative
              hidden
              w-[47%]
              overflow-hidden
              border-r
              border-gray-100
              bg-gradient-to-br
              from-[#faf7ff]
              via-white
              to-[#f4f0ff]
              md:block
            "
          >
            {/* Color circles */}

            <div
              className="
                absolute
                -right-24
                -top-24
                h-[300px]
                w-[300px]
                rounded-full
                bg-purple-200/60
                blur-[5px]
              "
            />

            <div
              className="
                absolute
                -bottom-24
                -left-24
                h-[300px]
                w-[300px]
                rounded-full
                bg-pink-200/50
              "
            />

            <div
              className="
                absolute
                right-[10%]
                top-[38%]
                h-24
                w-24
                rounded-full
                bg-blue-200/50
                blur-2xl
              "
            />

            {/* Orbital rings */}

            <div
              className="
                absolute
                left-1/2
                top-[58%]
                h-[410px]
                w-[410px]
                -translate-x-1/2
                -translate-y-1/2
                rounded-full
                border
                border-purple-200
              "
            />

            <div
              className="
                absolute
                left-1/2
                top-[58%]
                h-[310px]
                w-[310px]
                -translate-x-1/2
                -translate-y-1/2
                rounded-full
                border
                border-purple-100
              "
            />

            <div
              className="
                absolute
                left-1/2
                top-[58%]
                h-[220px]
                w-[220px]
                -translate-x-1/2
                -translate-y-1/2
                rounded-full
                border
                border-purple-100
              "
            />

            {/* LEFT CONTENT */}

            <div className="relative z-20 p-9">
              <img
                src="/axonnn-logo2.png"
                alt="axonnn"
                className="h-16 w-auto object-contain"
              />

              {/* India Global */}

              <div
                className="
                  mt-7
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-purple-200
                  bg-white/80
                  px-4
                  py-2
                  text-xs
                  font-semibold
                  text-purple-600
                  shadow-sm
                  backdrop-blur
                "
              >
                <Sparkles size={13} />
                India → Global
              </div>

              {/* Heading */}

              <h1
                className="
                  mt-8
                  max-w-[430px]
                  text-[45px]
                  font-black
                  leading-[1]
                  tracking-[-2.5px]
                  text-gray-900
                "
              >
                Your creator
                <br />
                <span
                  className="
                    bg-gradient-to-r
                    from-violet-600
                    via-fuchsia-500
                    to-blue-500
                    bg-clip-text
                    text-transparent
                  "
                >
                  journey starts here.
                </span>
              </h1>

              <p
                className="
                  mt-5
                  max-w-[390px]
                  text-[15px]
                  leading-6
                  text-gray-500
                "
              >
                One platform to discover, collaborate, create, measure and grow.
              </p>
            </div>

            {/* PHONE */}

            <img
              src="/axonnn-phone.png"
              alt="axonnn App"
              className="
                absolute
                bottom-[-205px]
                left-1/2
                z-20
                w-[275px]
                -translate-x-1/2
                rotate-[-7deg]
                drop-shadow-[0_30px_40px_rgba(75,40,120,0.25)]
              "
            />

            {/* Floating cards */}

            <div
              className="
                absolute
                bottom-[135px]
                left-8
                z-30
                rounded-2xl
                border
                border-white
                bg-white/90
                px-4
                py-3
                shadow-[0_12px_35px_rgba(70,40,100,0.12)]
                backdrop-blur
              "
            >
              <div className="flex items-center gap-2">
                <div
                  className="
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-xl
                    bg-gradient-to-br
                    from-pink-500
                    to-purple-600
                    text-white
                  "
                >
                  <FaInstagram size={15} />
                </div>

                <div>
                  <p className="text-[10px] text-gray-400">
                    Connected platform
                  </p>

                  <p className="text-xs font-bold text-gray-800">Instagram</p>
                </div>
              </div>
            </div>

            <div
              className="
                absolute
                bottom-[205px]
                right-8
                z-30
                rounded-2xl
                border
                border-white
                bg-white/90
                px-4
                py-3
                shadow-[0_12px_35px_rgba(70,40,100,0.12)]
                backdrop-blur
              "
            >
              <div className="flex items-center gap-2">
                <div
                  className="
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-xl
                    bg-emerald-50
                    text-emerald-500
                  "
                >
                  <Check size={15} />
                </div>

                <div>
                  <p className="text-[10px] text-gray-400">Growth</p>

                  <p className="text-xs font-bold text-gray-800">
                    Tracking active
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ================================================= */}
          {/* RIGHT SIDE */}
          {/* ================================================= */}

          <div className="relative flex w-full flex-col bg-white p-7 md:w-[53%] md:p-10">
            {/* HEADER */}

            <div className="pr-12">
              <div className="flex items-center gap-3">
                <div
                  className={`
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    bg-gradient-to-br
                    ${current.gradient}
                    text-white
                    shadow-lg
                  `}
                >
                  <RoleIcon size={18} />
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400">
                    Join axonnnnn
                  </p>

                  <p className="text-sm font-bold text-gray-700">
                    {current.label}
                  </p>
                </div>
              </div>

              {/* COLORFUL HEADING */}

              <h2
                className="
                  mt-7
                  text-[36px]
                  font-black
                  leading-[1]
                  tracking-[-1.8px]
                  text-gray-900
                "
              >
                Continue as{" "}
                <span
                  className={`
                    bg-gradient-to-r
                    ${current.gradient}
                    bg-clip-text
                    text-transparent
                  `}
                >
                  {current.name}
                </span>
              </h2>

              <p className="mt-4 max-w-[520px] text-sm leading-6 text-gray-500">
                {current.description}
              </p>
            </div>

            {/* ================================================= */}
            {/* ROLE SELECTOR */}
            {/* ================================================= */}

            <div className="mt-8">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-[1.5px] text-gray-400">
                  Choose your path
                </p>

                <span className="text-[11px] font-medium text-gray-300">
                  Step 01
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(roleData) as Array<Role>).map((item) => {
                  const data = roleData[item];
                  const Icon = data.icon;
                  const active = role === item;

                  return (
                    <button
                      key={item}
                      onClick={() => setRole(item)}
                      className={`
                        group
                        relative
                        overflow-hidden
                        rounded-2xl
                        border
                        p-3
                        text-left
                        transition-all
                        duration-300
                        ${
                          active
                            ? `${data.border} ${data.bg} shadow-sm`
                            : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                        }
                      `}
                    >
                      {active && (
                        <div
                          className={`
                            absolute
                            inset-x-0
                            top-0
                            h-[3px]
                            bg-gradient-to-r
                            ${data.gradient}
                          `}
                        />
                      )}

                      <div
                        className={`
                          flex
                          h-9
                          w-9
                          items-center
                          justify-center
                          rounded-xl
                          transition
                          ${
                            active
                              ? `bg-gradient-to-br ${data.gradient} text-white`
                              : "bg-gray-100 text-gray-400 group-hover:bg-gray-200"
                          }
                        `}
                      >
                        <Icon size={16} />
                      </div>

                      <p
                        className={`
                          mt-3
                          text-xs
                          font-bold
                          ${
                            active
                              ? data.text
                              : "text-gray-500 group-hover:text-gray-800"
                          }
                        `}
                      >
                        I'm a {data.name}
                      </p>

                      {active && (
                        <div className="absolute right-3 top-3">
                          <Check size={13} className={data.text} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ================================================= */}
            {/* WHATSAPP */}
            {/* ================================================= */}

            <div className="mt-7">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-[1.5px] text-gray-400">
                  Get the app
                </p>

                <span className="text-[11px] font-medium text-gray-300">
                  Step 02
                </span>
              </div>

              <div
                className="
                  flex
                  h-[58px]
                  overflow-hidden
                  rounded-2xl
                  border
                  border-gray-200
                  bg-gray-50
                  transition
                  focus-within:border-purple-400
                  focus-within:bg-white
                  focus-within:shadow-[0_0_0_4px_rgba(139,92,246,0.08)]
                "
              >
                <div
                  className="
                    flex
                    items-center
                    border-r
                    border-gray-200
                    px-4
                    text-sm
                    font-bold
                    text-gray-500
                  "
                >
                  +91
                </div>

                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your WhatsApp number"
                  className="
                    min-w-0
                    flex-1
                    bg-transparent
                    px-4
                    text-sm
                    text-gray-800
                    outline-none
                    placeholder:text-gray-400
                  "
                />

                <button
                  className="
                    m-1.5
                    flex
                    items-center
                    gap-2
                    rounded-xl
                    bg-gradient-to-r
                    from-violet-600
                    via-purple-600
                    to-fuchsia-500
                    px-5
                    text-xs
                    font-bold
                    text-white
                    shadow-[0_8px_25px_rgba(124,58,237,0.2)]
                    transition-all
                    hover:scale-[1.02]
                    hover:shadow-[0_10px_30px_rgba(124,58,237,0.3)]
                  "
                  onClick={sendWhatsApp}
                >
                  Send Link
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* ================================================= */}
            {/* OR */}
            {/* ================================================= */}

            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-gray-200" />

              <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-gray-300">
                or continue with
              </span>

              <div className="h-px flex-1 bg-gray-200" />
            </div>

            {/* ================================================= */}
            {/* APP BUTTONS */}
            {/* ================================================= */}

            <div className="grid grid-cols-2 gap-3">
              <button
                className="
                  group
                  flex
                  items-center
                  justify-between
                  rounded-2xl
                  border
                  border-gray-200
                  bg-white
                  px-4
                  py-4
                  text-left
                  shadow-sm
                  transition-all
                  hover:-translate-y-0.5
                  hover:border-gray-300
                  hover:shadow-md
                "
              >
                <div className="flex items-center gap-3">
                  <div
                    className="
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-xl
                      bg-black
                      text-white
                    "
                  >
                    <Play size={14} fill="currentColor" />
                  </div>

                  <div>
                    <p className="text-[9px] font-medium uppercase text-gray-400">
                      Get it on
                    </p>

                    <p className="text-sm font-bold text-gray-800">
                      Google Play
                    </p>
                  </div>
                </div>

                <ChevronRight
                  size={16}
                  className="text-gray-300 transition group-hover:translate-x-1 group-hover:text-gray-700"
                />
              </button>

              <button
                className="
                  group
                  flex
                  items-center
                  justify-between
                  rounded-2xl
                  border
                  border-gray-200
                  bg-white
                  px-4
                  py-4
                  text-left
                  shadow-sm
                  transition-all
                  hover:-translate-y-0.5
                  hover:border-gray-300
                  hover:shadow-md
                "
              >
                <div className="flex items-center gap-3">
                  <div
                    className="
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-xl
                      bg-black
                      text-lg
                      text-white
                    "
                  >
                    
                  </div>

                  <div>
                    <p className="text-[9px] font-medium uppercase text-gray-400">
                      Download on
                    </p>

                    <p className="text-sm font-bold text-gray-800">App Store</p>
                  </div>
                </div>

                <ChevronRight
                  size={16}
                  className="text-gray-300 transition group-hover:translate-x-1 group-hover:text-gray-700"
                />
              </button>
            </div>

            {/* ================================================= */}
            {/* FOOTER */}
            {/* ================================================= */}

            <div className="mt-auto pt-7">
              <div className="flex items-center justify-between border-t border-gray-100 pt-5">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <div className="h-6 w-6 rounded-full border-2 border-white bg-gradient-to-br from-violet-500 to-purple-600" />
                    <div className="h-6 w-6 rounded-full border-2 border-white bg-gradient-to-br from-pink-500 to-orange-400" />
                    <div className="h-6 w-6 rounded-full border-2 border-white bg-gradient-to-br from-cyan-400 to-blue-500" />
                  </div>

                  <p className="text-[10px] font-medium text-gray-400">
                    Built for the creator economy
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] font-medium text-gray-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  axonnn is live
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
