"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowRight } from "lucide-react";
import Link from "next/link";

interface ProductItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  category: { id: string; name: string; slug: string } | null;
  featured: boolean;
  available: boolean;
}

interface CollectionsClientProps {
  products: ProductItem[];
  categories: string[];
}

export default function CollectionsClient({ products, categories }: CollectionsClientProps) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const filteredProducts = products
    .filter((p) => activeCategory === "All" || p.category?.name === activeCategory)
    .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      return 0;
    });

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
              Wearable Art. Timeless Stories.
            </span>
            <h1 className="font-cormorant text-[42px] md:text-[64px] lg:text-[80px] font-light text-dark mt-3 leading-[1]">
              Our Collections
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="border-y border-border sticky top-20 z-30 bg-light/95 backdrop-blur-sm">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12 lg:px-16 py-5">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 font-manrope text-[11px] tracking-wide transition-all duration-300 ${
                    activeCategory === cat
                      ? "bg-dark text-white"
                      : "text-muted hover:text-dark border border-border hover:border-dark/30"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search & Sort */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-border bg-transparent font-inter text-[13px] focus:outline-none focus:border-dark transition-colors w-40 md:w-48"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-border bg-transparent font-inter text-[13px] focus:outline-none focus:border-dark appearance-none cursor-pointer pr-8"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12 lg:px-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory + sortBy}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12"
            >
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link href={`/products/${product.slug}`} className="group block">
                    <div className="relative aspect-[3/4] overflow-hidden bg-dark/[0.03] mb-4">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        loading="lazy"
                      />
                      {product.featured && (
                        <span className="absolute top-3 left-3 px-2.5 py-1 bg-secondary text-white font-manrope text-[9px] tracking-wider uppercase font-medium">
                          Featured
                        </span>
                      )}
                      <div className="absolute inset-0 bg-dark/0 group-hover:bg-dark/30 transition-all duration-500 flex items-end justify-center pb-6">
                        <span className="translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400 ease-out inline-flex items-center gap-2 bg-white px-5 py-2.5 font-manrope text-[11px] font-medium text-dark">
                          View Details
                          <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                    <span className="font-manrope text-[10px] tracking-[0.2em] uppercase text-muted">
                      {product.category?.name}
                    </span>
                    <h3 className="font-cormorant text-[19px] font-medium text-dark mt-1.5 leading-tight">
                      {product.name}
                    </h3>
                    <p className="font-manrope text-[13px] text-muted mt-1.5">
                      ₹{product.price.toLocaleString("en-IN")}
                    </p>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {filteredProducts.length === 0 && (
            <div className="text-center py-20">
              <p className="font-cormorant text-[24px] text-muted">
                No pieces found matching your criteria.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
