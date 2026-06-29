"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Testimonial {
  id: string;
  name: string;
  role?: string;
  content: string;
}

const defaultTestimonials: Testimonial[] = [
  {
    id: "1",
    content:
      "The jacket is not just clothing — it's a conversation starter, a piece of art I get to wear every day. The craftsmanship is beyond anything I've seen.",
    name: "Arjun Mehta",
    role: "Art Collector, Mumbai",
  },
  {
    id: "2",
    content:
      "I wanted something truly unique for my wedding. CRESTYVE created a hand-painted sherwani that left everyone speechless. It's a family heirloom now.",
    name: "Priya Sharma",
    role: "Fashion Entrepreneur, Delhi",
  },
  {
    id: "3",
    content:
      "Working with CRESTYVE was like commissioning a painting. The process was deeply personal, and the result is something I'll treasure forever.",
    name: "Rohan Patel",
    role: "Creative Director, Bangalore",
  },
];

interface TestimonialsProps {
  testimonials?: Testimonial[];
}

export function Testimonials({ testimonials: propTestimonials }: TestimonialsProps) {
  const testimonials = propTestimonials && propTestimonials.length > 0
    ? propTestimonials
    : defaultTestimonials;

  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((prev) => (prev + 1) % testimonials.length);
  const prev = () =>
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <section className="py-28 md:py-40 bg-light">
      <div className="mx-auto max-w-[900px] px-6 md:px-12 text-center">
        <span className="font-manrope text-[11px] tracking-[0.3em] uppercase text-secondary font-medium">
          What They Say
        </span>

        <div className="relative mt-14 min-h-[280px] md:min-h-[240px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 flex flex-col items-center justify-center"
            >
              <blockquote className="font-cormorant text-[22px] md:text-[30px] lg:text-[36px] font-light text-dark leading-[1.4] italic max-w-[750px]">
                &ldquo;{testimonials[current].content}&rdquo;
              </blockquote>
              <div className="mt-10">
                <p className="font-manrope text-[13px] font-semibold text-dark">
                  {testimonials[current].name}
                </p>
                {testimonials[current].role && (
                  <p className="font-inter text-[13px] text-muted mt-1">
                    {testimonials[current].role}
                  </p>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-8 mt-14">
          <button
            onClick={prev}
            className="w-11 h-11 flex items-center justify-center border border-border hover:border-dark transition-colors duration-300"
            aria-label="Previous"
          >
            <ChevronLeft className="h-4 w-4 text-dark" />
          </button>
          <span className="font-manrope text-[12px] tracking-wider text-muted tabular-nums">
            {String(current + 1).padStart(2, "0")} / {String(testimonials.length).padStart(2, "0")}
          </span>
          <button
            onClick={next}
            className="w-11 h-11 flex items-center justify-center border border-border hover:border-dark transition-colors duration-300"
            aria-label="Next"
          >
            <ChevronRight className="h-4 w-4 text-dark" />
          </button>
        </div>
      </div>
    </section>
  );
}
