"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const processSteps = [
  {
    title: "Conceptualization",
    description: "Every piece begins with an idea — a conversation, a story, an emotion that needs to be expressed through wearable art.",
  },
  {
    title: "Design & Sketch",
    description: "The concept takes shape through detailed sketches. Colors are chosen, compositions refined, and the garment's canvas is mapped.",
  },
  {
    title: "Hand Painting",
    description: "Using specialized textile paints and techniques, each stroke is applied with precision. This phase takes 40-80 hours per piece.",
  },
  {
    title: "Finishing & Quality",
    description: "Heat-setting, quality checks, and final touches ensure the art will endure as long as the garment itself.",
  },
];

export function MakingProcess() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  return (
    <section ref={containerRef} className="relative min-h-[300vh]">
      {/* Sticky Container */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Background Image */}
        <img
          src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1920&q=80&auto=format&fit=crop"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-dark/70" />

        {/* Content */}
        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto max-w-[1400px] px-6 md:px-12 lg:px-16 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
              {/* Left */}
              <div>
                <span className="font-manrope text-[11px] tracking-[0.3em] uppercase text-secondary font-medium">
                  Behind the Art
                </span>
                <h2 className="font-cormorant text-[36px] md:text-[52px] lg:text-[64px] font-light text-white mt-4 leading-[1.05]">
                  The Making
                  <br />
                  Process
                </h2>
              </div>

              {/* Right - Steps */}
              <div className="flex flex-col gap-0">
                {processSteps.map((step, index) => (
                  <ProcessStep
                    key={step.title}
                    step={step}
                    index={index}
                    progress={scrollYProgress}
                    total={processSteps.length}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll spacer */}
      <div className="h-[200vh]" />
    </section>
  );
}

function ProcessStep({
  step,
  index,
  progress,
  total,
}: {
  step: { title: string; description: string };
  index: number;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  total: number;
}) {
  const segmentSize = 1 / total;
  const start = index * segmentSize;
  const peak = start + segmentSize * 0.3;
  const end = start + segmentSize;

  const opacity = useTransform(
    progress,
    [start, peak, end - segmentSize * 0.1, end],
    [0.25, 1, 1, 0.25]
  );
  const x = useTransform(progress, [start, peak], [12, 0]);

  return (
    <motion.div
      style={{ opacity, x }}
      className="py-5 border-l-[2px] border-white/15 pl-7 relative"
    >
      <div className="absolute left-[-5px] top-7 w-[8px] h-[8px] rounded-full bg-secondary" />
      <h3 className="font-cormorant text-[22px] md:text-[26px] text-white mb-2 leading-tight">
        {step.title}
      </h3>
      <p className="font-inter text-[13px] md:text-[14px] text-white/50 leading-[1.7]">
        {step.description}
      </p>
    </motion.div>
  );
}
