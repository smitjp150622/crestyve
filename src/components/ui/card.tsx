"use client";

import * as React from "react";
import Image from "next/image";
import { ArrowRight, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  image: string;
  alt: string;
  category: string;
  name: string;
  price: number;
  href?: string;
  onWhatsAppClick?: () => void;
}

function formatINR(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, image, alt, category, name, price, href, onWhatsAppClick, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("group relative flex flex-col", className)}
        {...props}
      >
        {/* Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden bg-border/30">
          <Image
            src={image}
            alt={alt}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />

          {/* Hover Overlay */}
          <div
            className={cn(
              "absolute inset-0 flex flex-col items-center justify-center gap-3",
              "bg-dark/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            )}
          >
            <a
              href={href ?? "#"}
              className={cn(
                "inline-flex items-center gap-2 px-6 py-3",
                "bg-white text-dark font-ui text-xs font-medium uppercase tracking-widest",
                "transition-transform duration-300 hover:scale-105"
              )}
            >
              View Details
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
            {onWhatsAppClick && (
              <button
                onClick={onWhatsAppClick}
                className={cn(
                  "inline-flex items-center gap-2 px-6 py-3",
                  "bg-whatsapp text-white font-ui text-xs font-medium uppercase tracking-widest",
                  "transition-transform duration-300 hover:scale-105"
                )}
              >
                <MessageCircle className="h-3.5 w-3.5" />
                WhatsApp
              </button>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col gap-1 pt-4">
          <span className="font-ui text-[11px] font-medium uppercase tracking-[0.2em] text-muted">
            {category}
          </span>
          <h3 className="font-display text-xl font-light text-dark leading-snug">
            {name}
          </h3>
          <span className="font-ui text-sm font-medium text-dark/80">
            {formatINR(price)}
          </span>
        </div>
      </div>
    );
  }
);

Card.displayName = "Card";

export { Card };
export type { CardProps };
