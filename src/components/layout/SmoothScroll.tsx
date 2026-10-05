"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/animations/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { scrollToSection, setLenis } from "@/lib/scroll";

/**
 * Smooth wheel scrolling driven by the GSAP ticker so Lenis and ScrollTrigger
 * share one clock. Disabled with reduced motion; touch keeps native scrolling.
 */
export function SmoothScroll() {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const lenis = new Lenis({ autoRaf: false, lerp: 0.1, smoothWheel: true });
    setLenis(lenis);
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
      setLenis(null);
    };
  }, [reduced]);

  useEffect(() => {
    let cancelled = false;
    const hash = decodeURIComponent(window.location.hash.slice(1));

    // Deep links: pins add height after the browser's initial jump, so
    // re-target the section once layout has settled.
    const onRefresh = () => {
      ScrollTrigger.removeEventListener("refresh", onRefresh);
      if (!cancelled && hash) requestAnimationFrame(() => scrollToSection(hash, { immediate: true }));
    };
    if (hash) ScrollTrigger.addEventListener("refresh", onRefresh);

    // Web fonts change line wrapping, so re-measure every trigger once they land.
    document.fonts?.ready.then(() => {
      if (!cancelled) ScrollTrigger.refresh();
    });

    return () => {
      cancelled = true;
      ScrollTrigger.removeEventListener("refresh", onRefresh);
    };
  }, []);

  return null;
}
