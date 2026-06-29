"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const lookbookImages = [
  { id: 1, src: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=1600&q=80&auto=format&fit=crop", title: "Autumn Collection 2024" },
  { id: 2, src: "https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=1600&q=80&auto=format&fit=crop", title: "Street Art Series" },
  { id: 3, src: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1600&q=80&auto=format&fit=crop", title: "Heritage Line" },
  { id: 4, src: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1600&q=80&auto=format&fit=crop", title: "Abstract Expressionism" },
  { id: 5, src: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1600&q=80&auto=format&fit=crop", title: "Midnight Collection" },
  { id: 6, src: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1600&q=80&auto=format&fit=crop", title: "Commissioned Works" },
];

export default function LookbookPage() {
  return (
    <main className="pt-20">
      {/* Header */}
      <section className="pt-16 pb-12 md:pt-24 md:pb-16">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="font-manrope text-[11px] tracking-[0.3em] uppercase text-secondary font-medium">
              Visual Storytelling
            </span>
            <h1 className="font-cormorant text-[42px] md:text-[64px] lg:text-[80px] font-light text-dark mt-3 leading-[1]">
              Lookbook
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Images */}
      <section className="pb-20 md:pb-28">
        <div className="space-y-6 md:space-y-8">
          {lookbookImages.map((image, index) => (
            <LookbookImage key={image.id} image={image} index={index} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center border-t border-border">
        <div className="mx-auto max-w-[700px] px-6">
          <p className="font-cormorant text-[26px] md:text-[34px] font-light text-dark italic leading-[1.3]">
            &ldquo;Each piece is one of one. Just like you.&rdquo;
          </p>
          <a
            href="https://wa.me/918884942210?text=Hi%2C%20I%20saw%20the%20lookbook%20and%20I%27m%20interested.%20Can%20you%20share%20more%3F"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-primary hover:bg-primary-hover px-10 py-[18px] font-manrope text-[13px] font-medium tracking-wide text-white transition-all duration-300 mt-10"
          >
            Enquire Now
            <span>→</span>
          </a>
        </div>
      </section>
    </main>
  );
}

function LookbookImage({
  image,
  index,
}: {
  image: { id: number; src: string; title: string };
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [-30, 30]);

  return (
    <div
      ref={ref}
      className={`mx-auto px-6 md:px-12 lg:px-16 ${
        index % 2 === 0 ? "max-w-[1400px]" : "max-w-[1000px]"
      }`}
    >
      <div className="relative overflow-hidden">
        <motion.img
          style={{ y }}
          src={image.src}
          alt={image.title}
          className="w-full object-cover aspect-[16/9]"
          loading="lazy"
        />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 bg-gradient-to-t from-dark/50 to-transparent">
          <h3 className="font-cormorant text-[20px] md:text-[26px] text-white">
            {image.title}
          </h3>
        </div>
      </div>
    </div>
  );
}
