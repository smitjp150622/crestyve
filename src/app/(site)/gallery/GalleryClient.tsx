"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface GalleryItem {
  id: string;
  title?: string;
  src: string;
  category?: string;
}

interface GalleryClientProps {
  images: GalleryItem[];
}

export default function GalleryClient({ images }: GalleryClientProps) {
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

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
              Visual Stories
            </span>
            <h1 className="font-cormorant text-[42px] md:text-[64px] lg:text-[80px] font-light text-dark mt-3 leading-[1]">
              Gallery
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Masonry Grid */}
      <section className="pb-20 md:pb-28">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12 lg:px-16">
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
            {images.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: (index % 3) * 0.08 }}
                viewport={{ once: true, margin: "-50px" }}
                className="break-inside-avoid mb-4"
              >
                <button
                  onClick={() => setSelectedImage(image)}
                  className="group relative w-full overflow-hidden block cursor-zoom-in"
                >
                  <img
                    src={image.src}
                    alt={image.title || "Gallery image"}
                    className={`w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03] ${
                      index % 3 === 0 ? "aspect-[3/4]" : index % 3 === 1 ? "aspect-square" : "aspect-[4/5]"
                    }`}
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-dark/0 group-hover:bg-dark/30 transition-all duration-400 flex items-end p-5">
                    <div className="translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400">
                      <h3 className="font-cormorant text-[18px] text-white leading-tight">
                        {image.title}
                      </h3>
                      <span className="font-manrope text-[10px] tracking-wider uppercase text-white/60">
                        {image.category}
                      </span>
                    </div>
                  </div>
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-dark/95 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => setSelectedImage(null)}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </button>
            <motion.img
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.3 }}
              src={selectedImage.src}
              alt={selectedImage.title || "Gallery image"}
              className="max-h-[80vh] max-w-[90vw] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
              <h3 className="font-cormorant text-[22px] text-white">
                {selectedImage.title}
              </h3>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
