"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface MagneticButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  strength?: number;
}

const MagneticButton = React.forwardRef<HTMLDivElement, MagneticButtonProps>(
  ({ className, strength = 0.3, children, ...props }, ref) => {
    const innerRef = React.useRef<HTMLDivElement>(null);
    const combinedRef = useCombinedRefs(ref, innerRef);

    const handleMouseMove = React.useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        const el = innerRef.current;
        if (!el) return;

        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      },
      [strength]
    );

    const handleMouseLeave = React.useCallback(() => {
      const el = innerRef.current;
      if (!el) return;
      el.style.transform = "translate(0px, 0px)";
    }, []);

    return (
      <div
        ref={combinedRef}
        className={cn("inline-block transition-transform duration-300 ease-out", className)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {children}
      </div>
    );
  }
);

MagneticButton.displayName = "MagneticButton";

function useCombinedRefs<T>(
  ...refs: (React.Ref<T> | React.MutableRefObject<T | null>)[]
) {
  const targetRef = React.useRef<T>(null);

  React.useEffect(() => {
    refs.forEach((ref) => {
      if (!ref) return;
      if (typeof ref === "function") {
        ref(targetRef.current);
      } else {
        (ref as React.MutableRefObject<T | null>).current = targetRef.current;
      }
    });
  }, [refs]);

  return targetRef;
}

export { MagneticButton };
export type { MagneticButtonProps };
