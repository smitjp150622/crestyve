import * as React from "react";
import { cn } from "@/lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, as: Comp = "div", ...props }, ref) => {
    return (
      <Comp
        ref={ref}
        className={cn("mx-auto w-full max-w-[1400px] px-6 md:px-10 lg:px-16", className)}
        {...props}
      />
    );
  }
);

Container.displayName = "Container";

export { Container };
export type { ContainerProps };
