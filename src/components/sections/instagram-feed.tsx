"use client";

import { motion } from "framer-motion";

const instagramPosts = [
  { id: 1, image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80&auto=format&fit=crop" },
  { id: 2, image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400&q=80&auto=format&fit=crop" },
  { id: 3, image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&q=80&auto=format&fit=crop" },
  { id: 4, image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&q=80&auto=format&fit=crop" },
  { id: 5, image: "https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=400&q=80&auto=format&fit=crop" },
  { id: 6, image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&q=80&auto=format&fit=crop" },
];

export function InstagramFeed() {
  return (
    <section className="py-24 md:py-32 bg-light">
      <div className="mx-auto max-w-[1400px] px-6 md:px-12 lg:px-16 mb-12">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-manrope text-[11px] tracking-[0.3em] uppercase text-secondary font-medium">
              Follow the Journey
            </span>
            <h2 className="font-cormorant text-[28px] md:text-[40px] font-light text-dark mt-3">
              @crestyve
            </h2>
          </div>
          <a
            href="https://instagram.com/crestyve"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 font-manrope text-[13px] font-medium text-dark border-b border-dark/20 pb-1 hover:border-dark transition-all duration-300"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            <span className="hidden md:inline">Follow on Instagram</span>
          </a>
        </div>
      </div>

      {/* Grid */}
      <div className="mx-auto max-w-[1400px] px-6 md:px-12 lg:px-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3">
          {instagramPosts.map((post, index) => (
            <motion.a
              key={post.id}
              href="https://instagram.com/crestyve"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              viewport={{ once: true }}
              className="group relative aspect-square overflow-hidden"
            >
              <img
                src={post.image}
                alt="Instagram post"
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-dark/0 group-hover:bg-dark/40 transition-all duration-300 flex items-center justify-center">
                <svg className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
