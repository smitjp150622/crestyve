import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const headingVariants = cva("font-display font-light tracking-tight text-dark", {
  variants: {
    size: {
      display: "text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.9]",
      h1: "text-4xl sm:text-5xl md:text-6xl leading-[0.95]",
      h2: "text-3xl sm:text-4xl md:text-5xl leading-[1]",
      h3: "text-2xl sm:text-3xl md:text-4xl leading-[1.1]",
      h4: "text-xl sm:text-2xl leading-[1.2]",
    },
  },
  defaultVariants: {
    size: "h2",
  },
});

const sizeToTag = {
  display: "h1",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
} as const;

interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {
  as?: React.ElementType;
  subtitle?: string;
  split?: boolean;
}

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, size = "h2", as, subtitle, split = false, children, ...props }, ref) => {
    const Tag = as ?? sizeToTag[size ?? "h2"];

    return (
      <div className="space-y-3">
        <Tag
          ref={ref}
          className={cn(headingVariants({ size }), className)}
          {...(split && { "data-split-text": "" })}
          {...props}
        >
          {children}
        </Tag>
        {subtitle && (
          <p className="font-body text-base md:text-lg text-muted max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
    );
  }
);

Heading.displayName = "Heading";

export { Heading, headingVariants };
export type { HeadingProps };
