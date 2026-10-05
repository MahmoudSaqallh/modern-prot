"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/animations/gsap";
import { useFinePointer, useReducedMotion } from "./useReducedMotion";

const MAX_TILT = 4; // degrees

/**
 * Restrained 3D card interaction (mouse only, off with reduced motion):
 * the card tilts up to 4°, lifts slightly, and its `[data-depth]` layers
 * shift by different amounts for parallax, and --mx/--my track the pointer
 * so a light can follow it. Returns smoothly to neutral.
 *
 * Note: quickTo needs GSAP's own property names (rotationX/rotationY),
 * not the CSS aliases — using rotateX here triggers "not eligible for reset".
 */
export function useCardTilt<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const fine = useFinePointer();
  const reduced = useReducedMotion();

  useEffect(() => {
    const card = ref.current;
    if (!card || !fine || reduced) return;

    const rx = gsap.quickTo(card, "rotationX", { duration: 0.6, ease: "power3" });
    const ry = gsap.quickTo(card, "rotationY", { duration: 0.6, ease: "power3" });
    const lift = gsap.quickTo(card, "y", { duration: 0.5, ease: "power3" });
    const layers = Array.from(card.querySelectorAll<HTMLElement>("[data-depth]")).map((el) => ({
      depth: Number(el.dataset.depth) || 0,
      x: gsap.quickTo(el, "x", { duration: 0.7, ease: "power3" }),
      y: gsap.quickTo(el, "y", { duration: 0.7, ease: "power3" }),
    }));
    gsap.set(card, { transformPerspective: 1100 });

    const onEnter = () => lift(-4);
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      // Light follows the pointer (read by the card glow via CSS variables).
      card.style.setProperty("--mx", `${((px + 0.5) * 100).toFixed(1)}%`);
      card.style.setProperty("--my", `${((py + 0.5) * 100).toFixed(1)}%`);
      ry(px * MAX_TILT * 2);
      rx(-py * MAX_TILT * 2);
      layers.forEach((layer) => {
        layer.x(-px * layer.depth);
        layer.y(-py * layer.depth);
      });
    };
    const onLeave = () => {
      rx(0);
      ry(0);
      lift(0);
      layers.forEach((layer) => {
        layer.x(0);
        layer.y(0);
      });
    };

    card.addEventListener("pointerenter", onEnter);
    card.addEventListener("pointermove", onMove);
    card.addEventListener("pointerleave", onLeave);
    return () => {
      card.removeEventListener("pointerenter", onEnter);
      card.removeEventListener("pointermove", onMove);
      card.removeEventListener("pointerleave", onLeave);
      gsap.killTweensOf(card);
      gsap.set(card, { clearProps: "transform" });
      card.querySelectorAll("[data-depth]").forEach((el) => {
        gsap.killTweensOf(el);
        gsap.set(el, { clearProps: "transform" });
      });
    };
  }, [fine, reduced]);

  return ref;
}
