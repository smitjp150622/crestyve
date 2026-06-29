"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  category: { name: string } | null;
}

interface CollectionsPreviewProps {
  products: Product[];
  whatsappNumber?: string;
}

export function CollectionsPreview({
  products,
  whatsappNumber = "918884942210",
}: CollectionsPreviewProps) {
  return (
    <section className="py-28 md:py-40 bg-light">
      {/* Header */}
      <div className="mx-auto max-w-[1400px] px-6 md:px-12 lg:px-16 mb-16 md:mb-20">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <span className="font-manrope text-[11px] tracking-[0.3em] uppercase text-secondary font-medium">
              Featured Works
            </span>
            <h2 className="font-cormorant text-[36px] md:text-[52px] lg:text-[64px] font-light leading-[1.05] text-dark mt-4">
              Featured
              <br />
              Collections
            </h2>
          </div>
          <Link
            href="/collections"
            className="group inline-flex items-center gap-2 font-manrope text-[13px] font-medium tracking-wide text-dark border-b border-dark/20 pb-1 hover:border-dark transition-all duration-300"
          >
            View All
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* Grid */}
      <div className="mx-auto max-w-[1400px] px-6 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {products.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true, margin: "-50px" }}
              className="group"
            >
              <Link href={`/collections/${item.slug}`} className="block">
                <div className="relative aspect-[3/4] overflow-hidden bg-dark/5 mb-5">
                  <img
                    src={item.images[0] || "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80&auto=format&fit=crop"}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    loading="lazy"
                  />
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-dark/0 group-hover:bg-dark/40 transition-all duration-500 flex items-end">
                    <div className="p-5 w-full translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
                      <span
                        className="inline-flex items-center gap-2 bg-white px-5 py-2.5 font-manrope text-[11px] font-medium tracking-wide text-dark cursor-pointer hover:bg-light transition-colors"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          window.open(
                            `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hi, I'm interested in "${item.name}". Can you share more?`)}`,
                            "_blank"
                          );
                        }}
                      >
                        Enquire Now
                        <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </div>
                <span className="font-manrope text-[10px] tracking-[0.2em] uppercase text-muted">
                  {item.category?.name || "Uncategorized"}
                </span>
                <h3 className="font-cormorant text-[20px] md:text-[22px] font-medium text-dark mt-1.5 leading-tight">
                  {item.name}
                </h3>
                <p className="font-manrope text-[13px] text-muted mt-1.5">
                  From ₹{item.price.toLocaleString("en-IN")}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
