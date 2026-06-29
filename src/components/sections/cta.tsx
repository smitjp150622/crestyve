"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface CTAProps {
  whatsappNumber?: string;
}

export function CTA({ whatsappNumber = "918884942210" }: CTAProps) {
  return (
    <section className="relative py-32 md:py-44 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1920&q=80&auto=format&fit=crop"
          alt=""
          className="h-full w-full object-cover"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-dark/80" />
      </div>

      <div className="relative mx-auto max-w-[900px] px-6 md:px-12 text-center">
        <motion.span
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="font-manrope text-[11px] tracking-[0.3em] uppercase text-secondary font-medium"
        >
          Start Your Journey
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          viewport={{ once: true }}
          className="font-cormorant text-[34px] md:text-[52px] lg:text-[64px] font-light text-white leading-[1.1] mt-6 mb-5"
        >
          Let&apos;s create something
          <br />
          beautiful together.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="font-inter text-[15px] text-white/50 max-w-[440px] mx-auto mb-12"
        >
          Each piece is one of one. Just like you.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <a
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hi, I'd love to create something beautiful together. Can we discuss?")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center justify-center gap-3 bg-primary hover:bg-primary-hover px-10 py-[18px] font-manrope text-[13px] font-medium tracking-wide text-white transition-all duration-300"
          >
            Contact on WhatsApp
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </a>
          <a
            href="https://instagram.com/crestyve"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-3 border border-white/20 px-10 py-[18px] font-manrope text-[13px] font-medium tracking-wide text-white transition-all duration-300 hover:bg-white/5 hover:border-white/40"
          >
            Follow on Instagram
          </a>
        </motion.div>
      </div>
    </section>
  );
}
