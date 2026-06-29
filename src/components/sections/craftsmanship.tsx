"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Inspiration",
    description: "Every piece begins with a story — a moment, an emotion, a vision that demands expression.",
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80&auto=format&fit=crop",
  },
  {
    number: "02",
    title: "Sketch",
    description: "The vision takes form on paper. Each line is deliberate, each curve intentional.",
    image: "https://images.unsplash.com/photo-1572953109213-3be62398eb95?w=800&q=80&auto=format&fit=crop",
  },
  {
    number: "03",
    title: "Painting",
    description: "Hours of meticulous hand-painting transform fabric into canvas. No two pieces are alike.",
    image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&q=80&auto=format&fit=crop",
  },
  {
    number: "04",
    title: "Finishing",
    description: "The final piece emerges — a wearable masterwork, ready to tell its story.",
    image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&q=80&auto=format&fit=crop",
  },
];

export function Craftsmanship() {
  return (
    <section className="relative bg-dark text-white py-28 md:py-40">
      {/* Header */}
      <div className="mx-auto max-w-[1400px] px-6 md:px-12 lg:px-16 mb-20 md:mb-28">
        <span className="font-manrope text-[11px] tracking-[0.3em] uppercase text-secondary font-medium">
          The Making Process
        </span>
        <h2 className="font-cormorant text-[40px] md:text-[60px] lg:text-[80px] font-light leading-[1] text-white mt-4">
          Craftsmanship
        </h2>
      </div>

      {/* Steps */}
      <div className="space-y-0">
        {steps.map((step, index) => (
          <CraftStep key={step.number} step={step} index={index} />
        ))}
      </div>
    </section>
  );
}

function CraftStep({
  step,
  index,
}: {
  step: (typeof steps)[number];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.6], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 0.6], [60, 0]);

  return (
    <motion.div
      ref={ref}
      style={{ opacity, y }}
      className="py-16 md:py-24 border-t border-white/10 first:border-t-0"
    >
      <div className="mx-auto max-w-[1400px] px-6 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Image */}
          <div className={`lg:col-span-5 ${index % 2 === 1 ? "lg:order-2" : ""}`}>
            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src={step.image}
                alt={step.title}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          </div>

          {/* Content */}
          <div className={`lg:col-span-7 ${index % 2 === 1 ? "lg:order-1 lg:pr-12" : "lg:pl-12"}`}>
            <span className="font-cormorant text-[72px] md:text-[96px] font-light text-white/[0.07] leading-none block">
              {step.number}
            </span>
            <h3 className="font-cormorant text-[32px] md:text-[40px] font-light text-white -mt-6 mb-5">
              {step.title}
            </h3>
            <p className="font-inter text-[15px] text-white/60 leading-[1.8] max-w-[420px]">
              {step.description}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
