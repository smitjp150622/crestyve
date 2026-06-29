"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";

const timeline = [
  { year: "2018", title: "The Beginning", description: "Started painting as a form of self-expression on personal clothing." },
  { year: "2020", title: "First Commission", description: "Received the first paid commission, turning passion into purpose." },
  { year: "2022", title: "CRESTYVE Born", description: "Established CRESTYVE as a brand and showcased at 8 fashion exhibitions." },
  { year: "2023", title: "Growing Recognition", description: "Featured in multiple publications and crossed 500+ happy customers." },
  { year: "2024", title: "Studio Launch", description: "Opened the dedicated CRESTYVE studio and expanded the team." },
];

const stats = [
  { value: "6+", label: "Years of Journey" },
  { value: "500+", label: "Happy Customers" },
  { value: "20+", label: "Exhibitions" },
  { value: "15+", label: "Awards Won" },
];

interface AboutClientProps {
  whatsappNumber: string;
}

export default function AboutClient({ whatsappNumber }: AboutClientProps) {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  const whatsappLink = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent("Hi, I'd love to discuss a custom piece. Can we connect?")}`;

  return (
    <main className="pt-20">
      {/* Hero */}
      <section ref={heroRef} className="relative h-[60vh] md:h-[70vh] overflow-hidden">
        <motion.div style={{ scale: heroScale }} className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&q=80&auto=format&fit=crop"
            alt="The Artist"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark/70 via-dark/20 to-transparent" />
        </motion.div>
        <div className="relative z-10 flex h-full flex-col items-center justify-end pb-16 md:pb-20 px-6 text-center text-white">
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-manrope text-[11px] tracking-[0.3em] uppercase text-secondary font-medium mb-5"
          >
            The Story Behind the Art
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="font-cormorant text-[40px] md:text-[60px] lg:text-[76px] font-light leading-[1.05]"
          >
            The Artist.
            <br />
            The Story.
            <br />
            The Vision.
          </motion.h1>
        </div>
      </section>

      {/* Intro */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-[800px] px-6 md:px-12 text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="font-inter text-[16px] md:text-[18px] text-muted leading-[1.9]"
          >
            CRESTYVE is more than a brand — it&apos;s a movement to make fashion
            personal, artistic, and meaningful. Founded on the belief that what
            you wear should tell your story, each piece is a collaboration
            between artist and wearer, resulting in wearable art that is truly
            one of one.
          </motion.p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 md:py-28 bg-dark text-white">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12 lg:px-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-20">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
            >
              <span className="font-manrope text-[11px] tracking-[0.3em] uppercase text-secondary font-medium">
                Our Mission
              </span>
              <h2 className="font-cormorant text-[28px] md:text-[34px] font-light mt-4 mb-5 leading-[1.2]">
                To transform everyday garments into personal masterpieces
              </h2>
              <p className="font-inter text-[14px] text-white/50 leading-[1.8]">
                We believe fashion should be a canvas for self-expression. Every
                piece we create is a testament to the power of art meeting
                craftsmanship.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              viewport={{ once: true }}
            >
              <span className="font-manrope text-[11px] tracking-[0.3em] uppercase text-secondary font-medium">
                Our Vision
              </span>
              <h2 className="font-cormorant text-[28px] md:text-[34px] font-light mt-4 mb-5 leading-[1.2]">
                A world where every piece of clothing carries a story
              </h2>
              <p className="font-inter text-[14px] text-white/50 leading-[1.8]">
                We envision a future where mass-produced fashion gives way to
                meaningful, personal art. Where quality triumphs over quantity.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12 lg:px-16">
          <div className="text-center mb-16">
            <span className="font-manrope text-[11px] tracking-[0.3em] uppercase text-secondary font-medium">
              The Path
            </span>
            <h2 className="font-cormorant text-[36px] md:text-[48px] font-light text-dark mt-4">
              My Journey
            </h2>
          </div>

          <div className="relative max-w-[700px] mx-auto">
            {/* Line */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-border md:-translate-x-px" />

            {timeline.map((event, index) => (
              <motion.div
                key={event.year}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.08 }}
                viewport={{ once: true }}
                className="relative pl-14 md:pl-0 mb-14 last:mb-0"
              >
                {/* Dot */}
                <div className="absolute left-[20px] md:left-1/2 w-3 h-3 bg-primary rounded-full -translate-x-1/2 mt-1.5 z-10 ring-4 ring-light" />

                <div className={`md:w-[45%] ${index % 2 === 0 ? "md:ml-auto md:pl-10" : "md:mr-auto md:pr-10 md:text-right"}`}>
                  <span className="font-cormorant text-[28px] text-primary font-light leading-none">
                    {event.year}
                  </span>
                  <h3 className="font-cormorant text-[20px] text-dark mt-1 mb-1.5">
                    {event.title}
                  </h3>
                  <p className="font-inter text-[13px] text-muted leading-[1.7]">
                    {event.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-border">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12 lg:px-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="font-cormorant text-[40px] md:text-[48px] font-light text-dark leading-none">
                  {stat.value}
                </div>
                <p className="font-manrope text-[11px] text-muted mt-2.5">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32 text-center">
        <div className="mx-auto max-w-[700px] px-6">
          <h2 className="font-cormorant text-[30px] md:text-[42px] font-light text-dark mb-8 leading-[1.2]">
            Ready to wear your story?
          </h2>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 bg-primary hover:bg-primary-hover px-10 py-[18px] font-manrope text-[13px] font-medium tracking-wide text-white transition-all duration-300"
          >
            Let&apos;s Connect
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </div>
      </section>
    </main>
  );
}
