"use client";

import { ArrowDownRight, ArrowRight ,ArrowBigDown} from "lucide-react";

type HookLineProps = {
  line1: React.ReactNode;
  line2?: React.ReactNode;
  note?: React.ReactNode;
  variant?: "orange" | "purple" | "blue" | "green";
};

export default function HookLine({
  line1,
  line2,
  note,
  variant = "orange",
}: HookLineProps) {
  const colors = {
    orange: {
      marker: "bg-orange-400",
      underline: "bg-orange-400",
      note: "text-[#76506C]",
    },
    purple: {
      marker: "bg-purple-400",
      underline: "bg-purple-400",
      note: "text-purple-700",
    },
    blue: {
      marker: "bg-sky-400",
      underline: "bg-sky-400",
      note: "text-[#76506C]",
    },
    green: {
      marker: "bg-emerald-400",
      underline: "bg-emerald-400",
      note: "text-emerald-700",
    },
  };

  const color = colors[variant];

  return (
    <section className="relative overflow-hidden bg-white px-6 py-20 sm:py-28">

      <div className="mx-auto max-w-6xl">

        {/* Main handwritten line */}
        <div className="relative text-center">

          <h2
            className="
              relative z-10
              font-[var(--font-hand)]
              text-5xl
              font-bold
              leading-[1.05]
              tracking-tight
              text-[#111827]
              sm:text-6xl
              lg:text-7xl
            "
          >
            {line1}
          </h2>

          {/* marker behind text */}
          <div
            className={`
              absolute
              bottom-[5px]
              left-1/2
              -z-0
              h-5
              w-[260px]
              -translate-x-1/2
              rotate-[-1deg]
              rounded-full
              opacity-70
              ${color.marker}
              sm:w-[380px]
            `}
          />

        </div>


        {/* Second line */}
        {line2 && (
          <div className="mt-5 text-center">

            <h3
              className="
                font-[cursive]
                text-3xl
                font-bold
                leading-tight
                text-[#182033]
                sm:text-4xl
                lg:text-5xl
              "
            >
              {line2}
            </h3>

            {/* Hand drawn underline */}
            <div className="relative mx-auto mt-2 h-4 w-fit">

              <div
                className={`
                  h-[7px]
                  w-[180px]
                  rotate-[-2deg]
                  rounded-full
                  ${color.underline}
                  sm:w-[260px]
                `}
              />

            </div>

          </div>
        )}


        {/* Handwritten note */}
        {note && (
          <div
            className={`
              relative
              mx-auto
              mt-8
              flex
              w-fit
              max-w-[280px]
              rotate-[-4deg]
              items-start
              gap-2
              font-[cursive]
              text-xl
              font-bold
              leading-tight
              ${color.note}
              sm:absolute
              sm:ml-[65%]
              sm:-mt-3
            `}
          >

            <ArrowDownRight
              className="mt-1 h-10 w-10 shrink-0 rotate-[15deg]"
              strokeWidth={1.8}
            />
            
            <span>
              {note}
            </span>

          </div>
        )}

      </div>

    </section>
  );
}