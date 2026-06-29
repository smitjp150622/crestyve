"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const posts = [
  {
    id: "1",
    title: "The Philosophy Behind Hand-Painted Fashion",
    slug: "philosophy-behind-hand-painted-fashion",
    excerpt: "Why we believe every garment should carry a story and how hand-painting transforms fabric into narrative.",
    coverImage: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=900&q=80&auto=format&fit=crop",
    publishedAt: "2024-12-15",
  },
  {
    id: "2",
    title: "Behind the Brush: A Day in the Studio",
    slug: "behind-the-brush",
    excerpt: "A glimpse into the daily creative process, from morning sketches to evening varnishing.",
    coverImage: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=900&q=80&auto=format&fit=crop",
    publishedAt: "2024-11-28",
  },
  {
    id: "3",
    title: "From Canvas to Closet: Art You Can Wear",
    slug: "from-canvas-to-closet",
    excerpt: "Exploring the intersection of fine art and fashion, and why wearable art is the future.",
    coverImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=900&q=80&auto=format&fit=crop",
    publishedAt: "2024-10-20",
  },
  {
    id: "4",
    title: "Exhibition Recap: Art Basel Ahmedabad 2024",
    slug: "art-basel-ahmedabad-2024",
    excerpt: "Highlights from our showcase where fashion met fine art in a celebration of creativity.",
    coverImage: "https://images.unsplash.com/photo-1572953109213-3be62398eb95?w=900&q=80&auto=format&fit=crop",
    publishedAt: "2024-09-10",
  },
];

export default function JournalPage() {
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
              Stories & Insights
            </span>
            <h1 className="font-cormorant text-[42px] md:text-[64px] lg:text-[80px] font-light text-dark mt-3 leading-[1]">
              Journal
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="pb-12 md:pb-16">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12 lg:px-16">
          <Link
            href={`/journal/${posts[0].slug}`}
            className="group grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-dark/[0.03]">
              <img
                src={posts[0].coverImage}
                alt={posts[0].title}
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-manrope text-[10px] tracking-[0.2em] uppercase text-muted mb-4">
                {new Date(posts[0].publishedAt).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              <h2 className="font-cormorant text-[28px] md:text-[36px] lg:text-[42px] font-light text-dark mb-4 leading-[1.15] group-hover:text-primary transition-colors duration-300">
                {posts[0].title}
              </h2>
              <p className="font-inter text-[14px] text-muted leading-[1.8] mb-6 max-w-[440px]">
                {posts[0].excerpt}
              </p>
              <span className="inline-flex items-center gap-2 font-manrope text-[13px] font-medium text-dark group-hover:gap-3 transition-all duration-300">
                Read More
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="pb-20 md:pb-28">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12 lg:px-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {posts.slice(1).map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                viewport={{ once: true }}
              >
                <Link href={`/journal/${post.slug}`} className="group block">
                  <div className="relative aspect-[16/10] overflow-hidden bg-dark/[0.03] mb-5">
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                      loading="lazy"
                    />
                  </div>
                  <span className="font-manrope text-[10px] tracking-[0.2em] uppercase text-muted">
                    {new Date(post.publishedAt).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  <h3 className="font-cormorant text-[21px] font-medium text-dark mt-2 mb-2 leading-[1.3] group-hover:text-primary transition-colors duration-300">
                    {post.title}
                  </h3>
                  <p className="font-inter text-[13px] text-muted leading-[1.7]">
                    {post.excerpt}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
