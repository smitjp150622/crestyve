"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import Link from "next/link";

interface HeroProps {
  title?: string;
  subtitle?: string;
  whatsappNumber?: string;
}

export function Hero({ title, subtitle, whatsappNumber = "918884942210" }: HeroProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const displayTitle = title || "Wear Your Story";
  const displaySubtitle = subtitle || "Handcrafted Fashion. Painted with Passion.";
  const titleLines = displayTitle.split(" ");

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1920&q=80&auto=format&fit=crop"
          alt=""
          className="h-full w-full object-cover scale-105"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center text-white">
        <AnimatePresence>
          {isLoaded && (
            <>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="font-manrope text-[11px] md:text-xs tracking-[0.3em] uppercase text-white/70 mb-8"
              >
                {displaySubtitle}
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="font-cormorant text-[56px] md:text-[100px] lg:text-[130px] font-light leading-[0.85] tracking-[-0.02em]"
              >
                {titleLines.map((word, i) => (
                  <span key={i}>
                    {word}
                    {i < titleLines.length - 1 && <br />}
                  </span>
                ))}
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1, ease: [0.16, 1, 0.3, 1] }}
                className="mt-14 flex flex-col sm:flex-row gap-4"
              >
                <Link
                  href="/collections"
                  className="group inline-flex items-center gap-3 bg-primary hover:bg-primary-hover px-8 py-4 font-manrope text-[13px] font-medium tracking-wide text-white transition-all duration-300"
                >
                  Explore Collection
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hi, I'm interested in CRESTYVE. Can you share more information?")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 border border-white/30 px-8 py-4 font-manrope text-[13px] font-medium tracking-wide text-white transition-all duration-300 hover:bg-white/10 hover:border-white/60"
                >
                  Contact on WhatsApp
                </a>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3"
      >
        <span className="font-manrope text-[10px] tracking-[0.25em] uppercase text-white/50">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="h-4 w-4 text-white/50" />
        </motion.div>
      </motion.div>
    </section>
  );
}
