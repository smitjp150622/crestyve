"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ANIMATION_CONFIG } from "@/constants";

const BRAND = "CRESTYVE";

export default function LoadingScreen() {
  const [show, setShow] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const visited = sessionStorage.getItem("crestyve-visited");
    if (visited) return;

    setShow(true);
    sessionStorage.setItem("crestyve-visited", "1");

    let start: number | null = null;
    const duration = 2400;

    function step(timestamp: number) {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const pct = Math.min(elapsed / duration, 1);
      setProgress(Math.round(pct * 100));

      if (pct < 1) {
        requestAnimationFrame(step);
      } else {
        setTimeout(() => setShow(false), 400);
      }
    }

    requestAnimationFrame(step);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-dark"
          exit={{ y: "-100%" }}
          transition={{
            duration: 0.8,
            ease: ANIMATION_CONFIG.ease.luxury,
          }}
        >
          {/* Letters */}
          <div className="flex font-display text-4xl font-semibold tracking-[0.3em] text-white sm:text-5xl md:text-6xl">
            {BRAND.split("").map((char, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.1,
                  ease: ANIMATION_CONFIG.ease.luxury,
                }}
              >
                {char}
              </motion.span>
            ))}
          </div>

          {/* Progress bar */}
          <div className="mt-10 h-px w-48 overflow-hidden bg-white/10">
            <motion.div
              className="h-full bg-secondary"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>

          {/* Counter */}
          <p className="mt-4 text-xs tracking-[0.2em] text-white/30 font-ui tabular-nums">
            {progress}%
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
