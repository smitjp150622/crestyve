"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseInViewOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}

export function useInView<T extends HTMLElement = HTMLDivElement>(
  options: UseInViewOptions = {}
) {
  const { threshold = 0.1, rootMargin = "0px", once = true } = options;
  const ref = useRef<T>(null);
  const [isInView, setIsInView] = useState(false);
  const triggered = useRef(false);

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const entry = entries[0];
      if (!entry) return;

      if (entry.isIntersecting) {
        setIsInView(true);
        if (once) triggered.current = true;
      } else if (!once) {
        setIsInView(false);
      }
    },
    [once]
  );

  useEffect(() => {
    const el = ref.current;
    if (!el || (once && triggered.current)) return;

    const observer = new IntersectionObserver(handleIntersect, {
      threshold,
      rootMargin,
    });

    observer.observe(el);

    return () => observer.disconnect();
  }, [threshold, rootMargin, once, handleIntersect]);

  return { ref, isInView } as const;
}
