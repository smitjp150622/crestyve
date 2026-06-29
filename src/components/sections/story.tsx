"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function Story() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const textOpacity = useTransform(scrollYProgress, [0.15, 0.35], [0, 1]);
  const textY = useTransform(scrollYProgress, [0.15, 0.35], [50, 0]);

  return (
    <section ref={sectionRef} className="relative py-28 md:py-40 overflow-hidden bg-light">
      <div className="mx-auto max-w-[1400px] px-6 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          {/* Image */}
          <motion.div style={{ y: imageY }} className="lg:col-span-5 relative">
            <div className="relative aspect-[3/4] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80&auto=format&fit=crop"
                alt="The Artist at work"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 w-24 h-24 border border-secondary/40" />
            <div className="absolute -top-4 -left-4 w-16 h-16 bg-secondary/10" />
          </motion.div>

          {/* Text */}
          <motion.div
            style={{ opacity: textOpacity, y: textY }}
            className="lg:col-span-7 lg:pl-8"
          >
            <span className="font-manrope text-[11px] tracking-[0.3em] uppercase text-secondary font-medium">
              The Art of Handmade
            </span>
            <h2 className="font-cormorant text-[36px] md:text-[52px] lg:text-[64px] font-light leading-[1.05] text-dark mt-5 mb-8">
              The Art of
              <br />
              Handmade &<br />
              Hand Painted
            </h2>
            <p className="font-inter text-[15px] md:text-base text-muted leading-[1.8] max-w-[480px] mb-10">
              Each piece is crafted with love, inspired by stories, emotions, and
              individuality. From sketch to final brushstroke, every garment
              carries a piece of the artist&apos;s soul.
            </p>
            <Link
              href="/about"
              className="group inline-flex items-center gap-3 font-manrope text-[13px] font-medium tracking-wide text-dark border-b border-dark/20 pb-1 hover:border-dark transition-all duration-300"
            >
              Explore Our Process
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
