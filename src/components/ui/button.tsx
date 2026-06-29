"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2",
    "font-ui font-medium tracking-wide uppercase",
    "transition-all duration-300 ease-out",
    "disabled:pointer-events-none disabled:opacity-50",
    "cursor-pointer select-none",
  ],
  {
    variants: {
      variant: {
        primary: [
          "bg-primary text-white",
          "hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20",
          "active:scale-[0.98]",
        ],
        secondary: [
          "border border-secondary text-secondary bg-transparent",
          "hover:bg-secondary hover:text-dark",
          "active:scale-[0.98]",
        ],
        ghost: [
          "bg-transparent text-text",
          "hover:bg-dark/5",
          "active:scale-[0.98]",
        ],
        whatsapp: [
          "bg-whatsapp text-white",
          "hover:bg-whatsapp-dark hover:shadow-lg hover:shadow-whatsapp/20",
          "active:scale-[0.98]",
        ],
      },
      size: {
        sm: "h-9 px-4 text-xs",
        md: "h-11 px-6 text-sm",
        lg: "h-14 px-10 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  showArrow?: boolean;
  magnetic?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, showArrow = false, magnetic = false, children, ...props },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size }),
          magnetic && "magnetic-button",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
        {showArrow && (
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        )}
      </Comp>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
export type { ButtonProps };
