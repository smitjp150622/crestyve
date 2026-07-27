"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Loader2, ShoppingBag, Check } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/lib/cart/CartContext";

interface ProductCategory {
  id: string;
  name: string;
  slug: string;
}

interface ProductData {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  images: string[];
  video?: string;
  categoryId: string;
  category: ProductCategory | null;
  materials: string[];
  sizes: string[];
  available: boolean;
  featured: boolean;
  artistNotes?: string;
  beforeImage?: string;
  afterImage?: string;
  order: number;
  stock?: number | null;
}

interface RelatedProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  category: ProductCategory | null;
}

interface ProductClientProps {
  product: ProductData;
  relatedProducts: RelatedProduct[];
  whatsappNumber: string;
}

export default function ProductClient({
  product,
  relatedProducts,
  whatsappNumber,
}: ProductClientProps) {
  const [currentImage, setCurrentImage] = useState(0);
  const [showBefore, setShowBefore] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState(false);
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryPhone, setInquiryPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [inquiryError, setInquiryError] = useState<string | null>(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const { addItem } = useCart();

  const outOfStock = product.stock !== null && product.stock !== undefined && product.stock <= 0;

  function handleAddToCart() {
    if (product.sizes.length > 0 && !selectedSize) {
      setSizeError(true);
      return;
    }
    setSizeError(false);
    addItem(
      {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        image: product.images[0] ?? null,
        price: product.price,
        size: selectedSize,
        maxStock: product.stock ?? null,
      },
      1
    );
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  }

  const nextImage = () =>
    setCurrentImage((prev) => (prev + 1) % product.images.length);
  const prevImage = () =>
    setCurrentImage(
      (prev) => (prev - 1 + product.images.length) % product.images.length
    );

  const fallbackWhatsappLink = `https://wa.me/${whatsappNumber.replace(/[\s+]/g, "")}?text=${encodeURIComponent(
    `Hi, I'm interested in "${product.name}" (₹${product.price.toLocaleString("en-IN")}). Can you share more information?`
  )}`;

  function openInquiryForm() {
    if (product.sizes.length > 0 && !selectedSize) {
      setSizeError(true);
      return;
    }
    setSizeError(false);
    setInquiryError(null);
    setShowInquiryForm(true);
  }

  async function submitInquiry() {
    if (!inquiryName.trim() || !inquiryPhone.trim()) {
      setInquiryError("Please enter your name and phone number.");
      return;
    }
    setSubmitting(true);
    setInquiryError(null);
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: inquiryName.trim(),
          phone: inquiryPhone.trim(),
          productId: product.id,
          selectedSize: selectedSize ?? undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit");
      window.open(data.whatsappUrl, "_blank", "noopener,noreferrer");
      setShowInquiryForm(false);
    } catch {
      setInquiryError("Something went wrong. Please try WhatsApp directly.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="pt-20">
      {/* Breadcrumb */}
      <div className="mx-auto max-w-[1400px] px-6 md:px-12 py-6">
        <nav className="flex items-center gap-2 font-manrope text-xs text-muted">
          <Link href="/" className="hover:text-dark transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/collections" className="hover:text-dark transition-colors">
            Collections
          </Link>
          <span>/</span>
          <span className="text-dark">{product.name}</span>
        </nav>
      </div>

      {/* Product Section */}
      <section className="pb-24">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Gallery */}
            <div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative aspect-[3/4] overflow-hidden bg-dark/5 mb-4"
              >
                <img
                  src={product.images[currentImage]}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
                {/* Navigation */}
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                {/* Counter */}
                <div className="absolute bottom-4 right-4 font-manrope text-xs bg-white/80 backdrop-blur-sm px-3 py-1">
                  {currentImage + 1} / {product.images.length}
                </div>
              </motion.div>

              {/* Thumbnails */}
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImage(idx)}
                    className={`aspect-square overflow-hidden border-2 transition-all ${
                      currentImage === idx
                        ? "border-primary"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>

              {/* Before/After */}
              {product.beforeImage && product.afterImage && (
                <div className="mt-8">
                  <h4 className="font-manrope text-xs tracking-[0.2em] uppercase text-muted mb-4">
                    Before & After
                  </h4>
                  <div className="relative aspect-video overflow-hidden bg-dark/5">
                    <img
                      src={showBefore ? product.beforeImage : product.afterImage}
                      alt={showBefore ? "Before painting" : "After painting"}
                      className="h-full w-full object-cover transition-opacity duration-500"
                    />
                    <button
                      onClick={() => setShowBefore(!showBefore)}
                      className="absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-white/90 backdrop-blur-sm font-manrope text-xs font-medium"
                    >
                      {showBefore ? "Show After" : "Show Before"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="lg:sticky lg:top-32 lg:self-start">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <span className="font-manrope text-[10px] tracking-[0.3em] uppercase text-secondary">
                  {product.category?.name}
                </span>
                <h1 className="font-cormorant text-4xl md:text-5xl lg:text-6xl font-light text-dark mt-2 mb-4">
                  {product.name}
                </h1>
                <p className="font-cormorant text-2xl text-dark mb-8">
                  ₹{product.price.toLocaleString("en-IN")}
                </p>

                <div className="border-t border-border pt-8 mb-8">
                  <p className="font-inter text-base text-muted leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Materials */}
                {product.materials.length > 0 && (
                  <div className="mb-8">
                    <h4 className="font-manrope text-xs tracking-[0.2em] uppercase text-dark mb-3">
                      Materials
                    </h4>
                    <ul className="flex flex-wrap gap-2">
                      {product.materials.map((material) => (
                        <li
                          key={material}
                          className="px-4 py-2 border border-border font-inter text-sm text-muted"
                        >
                          {material}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Sizes */}
                {product.sizes.length > 0 && (
                  <div className="mb-8">
                    <h4 className="font-manrope text-xs tracking-[0.2em] uppercase text-dark mb-3">
                      Available Sizes
                    </h4>
                    <div className="flex gap-2">
                      {product.sizes.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => {
                            setSelectedSize(size);
                            setSizeError(false);
                          }}
                          className={`w-12 h-12 flex items-center justify-center border font-manrope text-sm transition-colors cursor-pointer ${
                            selectedSize === size
                              ? "bg-dark text-white border-dark"
                              : "border-border text-dark hover:bg-dark hover:text-white"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                    {sizeError && (
                      <p className="mt-2 font-inter text-xs text-red-600">
                        Please select a size to continue.
                      </p>
                    )}
                  </div>
                )}

                {/* Availability */}
                <div className="mb-10">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        product.available ? "bg-green-500" : "bg-red-500"
                      }`}
                    />
                    <span className="font-manrope text-xs text-muted">
                      {product.available ? "Available" : "Sold Out"}
                    </span>
                  </div>
                </div>

                {/* CTA */}
                {product.available && !outOfStock ? (
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      className="group w-full inline-flex items-center justify-center gap-3 bg-dark px-10 py-5 font-manrope text-sm font-medium tracking-wide text-white transition-all duration-300 hover:bg-dark/90"
                    >
                      {addedToCart ? (
                        <>
                          Added to Bag <Check className="h-4 w-4" />
                        </>
                      ) : (
                        <>
                          Add to Bag <ShoppingBag className="h-4 w-4" />
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={openInquiryForm}
                      className="group w-full inline-flex items-center justify-center gap-3 bg-primary px-10 py-5 font-manrope text-sm font-medium tracking-wide text-white transition-all duration-300 hover:bg-primary/90"
                    >
                      Buy via WhatsApp
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </button>
                  </div>
                ) : (
                  <a
                    href={fallbackWhatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group w-full inline-flex items-center justify-center gap-3 bg-dark/80 px-10 py-5 font-manrope text-sm font-medium tracking-wide text-white transition-all duration-300 hover:bg-dark"
                  >
                    Ask About This Piece
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </a>
                )}

                {/* Inquiry Form Modal */}
                {showInquiryForm && (
                  <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-sm p-6 rounded-lg">
                      <h3 className="font-cormorant text-2xl text-dark mb-1">
                        Buy via WhatsApp
                      </h3>
                      <p className="font-inter text-xs text-muted mb-6">
                        {product.name}
                        {selectedSize ? ` · Size ${selectedSize}` : ""}
                      </p>
                      <div className="space-y-4">
                        <div>
                          <label className="block font-manrope text-xs uppercase tracking-wide text-dark mb-1.5">
                            Your Name
                          </label>
                          <input
                            type="text"
                            value={inquiryName}
                            onChange={(e) => setInquiryName(e.target.value)}
                            className="w-full border border-border px-4 py-2.5 font-inter text-sm focus:outline-none focus:border-primary"
                          />
                        </div>
                        <div>
                          <label className="block font-manrope text-xs uppercase tracking-wide text-dark mb-1.5">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            value={inquiryPhone}
                            onChange={(e) => setInquiryPhone(e.target.value)}
                            className="w-full border border-border px-4 py-2.5 font-inter text-sm focus:outline-none focus:border-primary"
                          />
                        </div>
                        {inquiryError && (
                          <p className="font-inter text-xs text-red-600">{inquiryError}</p>
                        )}
                        <div className="flex gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => setShowInquiryForm(false)}
                            className="flex-1 border border-border px-4 py-3 font-manrope text-xs uppercase tracking-wide text-dark hover:bg-dark/5 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={submitInquiry}
                            disabled={submitting}
                            className="flex-1 inline-flex items-center justify-center gap-2 bg-primary px-4 py-3 font-manrope text-xs uppercase tracking-wide text-white hover:bg-primary/90 transition-colors disabled:opacity-60"
                          >
                            {submitting && <Loader2 className="h-3 w-3 animate-spin" />}
                            Continue
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Artist Notes */}
                {product.artistNotes && (
                  <div className="mt-10 p-6 bg-dark/[0.02] border border-border">
                    <h4 className="font-manrope text-xs tracking-[0.2em] uppercase text-secondary mb-3">
                      Artist&apos;s Notes
                    </h4>
                    <p className="font-inter text-sm text-muted leading-relaxed italic">
                      &ldquo;{product.artistNotes}&rdquo;
                    </p>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Section */}
      {product.video && (
        <section className="py-16 bg-dark">
          <div className="mx-auto max-w-[1200px] px-6 md:px-12">
            <h3 className="font-cormorant text-3xl md:text-4xl text-white text-center mb-8">
              Making of this Piece
            </h3>
            <div className="aspect-video overflow-hidden">
              <video
                controls
                className="w-full h-full object-cover"
                poster={product.images[0]}
              >
                <source src={product.video} type="video/mp4" />
              </video>
            </div>
          </div>
        </section>
      )}

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="py-24">
          <div className="mx-auto max-w-[1400px] px-6 md:px-12">
            <h3 className="font-cormorant text-3xl md:text-4xl text-dark mb-12">
              You May Also Like
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedProducts.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Link href={`/products/${item.slug}`} className="group block">
                    <div className="relative aspect-[3/4] overflow-hidden bg-dark/5 mb-4">
                      <img
                        src={item.images[0]}
                        alt={item.name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <span className="font-manrope text-[10px] tracking-[0.2em] uppercase text-muted">
                      {item.category?.name}
                    </span>
                    <h4 className="font-cormorant text-xl font-medium text-dark mt-1">
                      {item.name}
                    </h4>
                    <p className="font-manrope text-sm text-muted mt-1">
                      ₹{item.price.toLocaleString("en-IN")}
                    </p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
