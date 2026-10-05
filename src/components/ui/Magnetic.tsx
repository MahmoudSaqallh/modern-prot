"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "@/animations/gsap";
import { useFinePointer, useReducedMotion } from "@/hooks/useReducedMotion";

/** Pulls its child slightly toward the pointer. Mouse only, off with reduced motion. */
export function Magnetic({ children, strength = 0.3 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const fine = useFinePointer();
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || !fine || reduced) return;
    const x = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3" });
    const y = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3" });
    const onMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      x((event.clientX - (rect.left + rect.width / 2)) * strength);
      y((event.clientY - (rect.top + rect.height / 2)) * strength);
    };
    const onLeave = () => {
      x(0);
      y(0);
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      gsap.set(el, { x: 0, y: 0 });
    };
  }, [fine, reduced, strength]);

  return (
    <span ref={ref} className="inline-flex">
      {children}
    </span>
  );
}
