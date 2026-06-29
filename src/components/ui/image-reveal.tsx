"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ImageRevealProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: "left" | "right" | "up" | "down";
  delay?: number;
  overlayColor?: string;
}

const overlayDirectionClasses = {
  left: {
    initial: "inset-0",
    revealed: "[.is-revealed_&]:translate-x-full",
  },
  right: {
    initial: "inset-0",
    revealed: "[.is-revealed_&]:-translate-x-full",
  },
  up: {
    initial: "inset-0",
    revealed: "[.is-revealed_&]:translate-y-full",
  },
  down: {
    initial: "inset-0",
    revealed: "[.is-revealed_&]:-translate-y-full",
  },
} as const;

const ImageReveal = React.forwardRef<HTMLDivElement, ImageRevealProps>(
  (
    {
      className,
      direction = "left",
      delay = 0,
      overlayColor = "bg-dark",
      children,
      ...props
    },
    ref
  ) => {
    const dirClasses = overlayDirectionClasses[direction];

    return (
      <div
        ref={ref}
        className={cn("relative overflow-hidden", className)}
        data-image-reveal=""
        data-reveal-delay={delay}
        data-reveal-direction={direction}
        {...props}
      >
        {/* Content (image) — starts scaled down and reveals */}
        <div
          className={cn(
            "scale-[1.3] transition-transform duration-1000 ease-out",
            "[.is-revealed_&]:scale-100"
          )}
          style={{ transitionDelay: `${delay + 300}ms` }}
        >
          {children}
        </div>

        {/* Sliding overlay */}
        <div
          className={cn(
            "pointer-events-none absolute z-10",
            dirClasses.initial,
            dirClasses.revealed,
            overlayColor,
            "transition-transform duration-700 ease-[cubic-bezier(0.77,0,0.18,1)]"
          )}
          style={{ transitionDelay: `${delay}ms` }}
          aria-hidden
        />
      </div>
    );
  }
);

ImageReveal.displayName = "ImageReveal";

export { ImageReveal };
export type { ImageRevealProps };
