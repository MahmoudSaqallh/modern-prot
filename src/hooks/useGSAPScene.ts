"use client";

import { useRef, type DependencyList } from "react";
import { gsap, MOTION_CONDITIONS, useGSAP, type MotionConditions } from "@/animations/gsap";

type Setup<T extends HTMLElement> = (conditions: MotionConditions, scope: T) => void | (() => void);

/**
 * Scoped GSAP setup for a component. Everything created inside `setup` —
 * tweens, timelines, ScrollTriggers, SplitText — lives in a matchMedia context,
 * so it is rebuilt when a condition flips (resize, reduced-motion toggle) and
 * reverted when the component unmounts. No ScrollTrigger outlives its owner.
 */
export function useGSAPScene<T extends HTMLElement = HTMLElement>(
  setup: Setup<T>,
  dependencies: DependencyList = [],
) {
  const scope = useRef<T>(null);

  useGSAP(
    () => {
      const el = scope.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_CONDITIONS, (context) => setup(context.conditions as MotionConditions, el));
      return () => mm.revert();
    },
    { scope, dependencies: [...dependencies], revertOnUpdate: true },
  );

  return scope;
}
