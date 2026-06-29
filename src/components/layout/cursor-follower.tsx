"use client";

import { useEffect, useRef, useState } from "react";

function isTouchDevice() {
  if (typeof window === "undefined") return false;
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

export default function CursorFollower() {
  const dotRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const circlePos = useRef({ x: 0, y: 0 });
  const [hidden, setHidden] = useState(true);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    if (isTouchDevice()) return;

    setHidden(false);

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const interactive = target.closest(
        "a, button, [role='button'], input, textarea, select, [data-cursor-hover]"
      );
      setHovering(!!interactive);
    };

    const handleMouseLeave = () => {
      setHidden(true);
    };

    const handleMouseEnter = () => {
      setHidden(false);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseover", handleMouseOver, { passive: true });
    document.documentElement.addEventListener("mouseleave", handleMouseLeave);
    document.documentElement.addEventListener("mouseenter", handleMouseEnter);

    let rafId: number;

    function animate() {
      const lerp = 0.15;
      circlePos.current.x +=
        (mouse.current.x - circlePos.current.x) * lerp;
      circlePos.current.y +=
        (mouse.current.y - circlePos.current.y) * lerp;

      if (circleRef.current) {
        circleRef.current.style.transform = `translate(${circlePos.current.x}px, ${circlePos.current.y}px)`;
      }

      rafId = requestAnimationFrame(animate);
    }

    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseover", handleMouseOver);
      document.documentElement.removeEventListener("mouseleave", handleMouseLeave);
      document.documentElement.removeEventListener("mouseenter", handleMouseEnter);
      cancelAnimationFrame(rafId);
    };
  }, []);

  if (hidden && typeof window !== "undefined" && isTouchDevice()) return null;

  return (
    <>
      {/* Small dot */}
      <div
        ref={dotRef}
        className="pointer-events-none fixed top-0 left-0 z-[9999] hidden lg:block"
        style={{ willChange: "transform" }}
      >
        <div
          className={`-ml-1 -mt-1 h-2 w-2 rounded-full bg-white mix-blend-difference transition-opacity duration-300 ${
            hidden ? "opacity-0" : "opacity-100"
          }`}
        />
      </div>

      {/* Larger following circle */}
      <div
        ref={circleRef}
        className="pointer-events-none fixed top-0 left-0 z-[9999] hidden lg:block"
        style={{ willChange: "transform" }}
      >
        <div
          className={`rounded-full border border-white mix-blend-difference transition-all duration-300 ease-out ${
            hidden ? "opacity-0" : "opacity-100"
          } ${
            hovering
              ? "-ml-5 -mt-5 h-10 w-10"
              : "-ml-3 -mt-3 h-6 w-6"
          }`}
        />
      </div>
    </>
  );
}
