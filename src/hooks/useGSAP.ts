"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type AnimationPreset = "fadeIn" | "slideUp" | "reveal" | "parallax";

interface UseGSAPOptions {
  preset?: AnimationPreset;
  trigger?: string;
  start?: string;
  end?: string;
  scrub?: boolean | number;
  markers?: boolean;
  duration?: number;
  delay?: number;
  stagger?: number;
  y?: number;
  parallaxSpeed?: number;
  once?: boolean;
  onAnimate?: (tl: gsap.core.Timeline, el: HTMLElement) => void;
}

const PRESETS: Record<AnimationPreset, (el: HTMLElement, opts: UseGSAPOptions) => gsap.core.Tween | gsap.core.Timeline> = {
  fadeIn: (el, opts) =>
    gsap.fromTo(
      el,
      { opacity: 0 },
      {
        opacity: 1,
        duration: opts.duration ?? 1,
        delay: opts.delay ?? 0,
        ease: "power2.out",
        scrollTrigger: buildScrollTrigger(el, opts),
      }
    ),

  slideUp: (el, opts) =>
    gsap.fromTo(
      el,
      { opacity: 0, y: opts.y ?? 60 },
      {
        opacity: 1,
        y: 0,
        duration: opts.duration ?? 1,
        delay: opts.delay ?? 0,
        stagger: opts.stagger ?? 0,
        ease: "power3.out",
        scrollTrigger: buildScrollTrigger(el, opts),
      }
    ),

  reveal: (el, opts) => {
    const tl = gsap.timeline({
      scrollTrigger: buildScrollTrigger(el, opts),
    });
    tl.fromTo(
      el,
      { clipPath: "inset(0 0 100% 0)" },
      {
        clipPath: "inset(0 0 0% 0)",
        duration: opts.duration ?? 1.2,
        delay: opts.delay ?? 0,
        ease: "power4.inOut",
      }
    );
    return tl;
  },

  parallax: (el, opts) =>
    gsap.fromTo(
      el,
      { y: 0 },
      {
        y: -(opts.parallaxSpeed ?? 100),
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: opts.start ?? "top bottom",
          end: opts.end ?? "bottom top",
          scrub: opts.scrub ?? true,
          markers: opts.markers ?? false,
        },
      }
    ),
};

function buildScrollTrigger(
  el: HTMLElement,
  opts: UseGSAPOptions
): ScrollTrigger.Vars {
  return {
    trigger: opts.trigger ? document.querySelector(opts.trigger) as Element : el,
    start: opts.start ?? "top 85%",
    end: opts.end ?? "bottom 20%",
    toggleActions: opts.once !== false ? "play none none none" : "play reverse play reverse",
    markers: opts.markers ?? false,
  };
}

export function useGSAP<T extends HTMLElement = HTMLDivElement>(
  options: UseGSAPOptions = {}
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let ctx: gsap.Context;

    ctx = gsap.context(() => {
      if (options.onAnimate) {
        const tl = gsap.timeline({
          scrollTrigger: buildScrollTrigger(el, options),
        });
        options.onAnimate(tl, el);
      } else if (options.preset) {
        PRESETS[options.preset](el, options);
      }
    }, el);

    return () => ctx.revert();
  }, [options]);

  return ref;
}
