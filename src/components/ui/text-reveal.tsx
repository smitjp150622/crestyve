"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TextRevealProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  delay?: number;
}

const TextReveal = React.forwardRef<HTMLDivElement, TextRevealProps>(
  ({ className, as: Tag = "div", delay = 0, children, ...props }, ref) => {
    return (
      <Tag
        ref={ref}
        className={cn("overflow-hidden", className)}
        data-text-reveal=""
        data-reveal-delay={delay}
        {...props}
      >
        <div
          className={cn(
            "translate-y-full opacity-0",
            "[.is-revealed_&]:translate-y-0 [.is-revealed_&]:opacity-100",
            "transition-all duration-700 ease-out"
          )}
          style={{ transitionDelay: `${delay}ms` }}
        >
          {children}
        </div>
      </Tag>
    );
  }
);

TextReveal.displayName = "TextReveal";

export { TextReveal };
export type { TextRevealProps };
