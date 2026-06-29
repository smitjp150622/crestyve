"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="font-cormorant text-8xl md:text-9xl font-light text-dark mb-4">
            404
          </h1>
          <p className="font-cormorant text-2xl md:text-3xl text-dark mb-2">
            Page Not Found
          </p>
          <p className="font-inter text-base text-muted mb-12 max-w-md mx-auto">
            The page you&apos;re looking for has been moved or doesn&apos;t exist.
            Let&apos;s get you back to something beautiful.
          </p>
          <Link
            href="/"
            className="group inline-flex items-center gap-3 bg-primary px-8 py-4 font-manrope text-sm font-medium tracking-wide text-white transition-all duration-300 hover:bg-primary/90"
          >
            Back to Home
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
