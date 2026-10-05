import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

// Register once. Safe on the server: the plugins defer DOM access until used.
gsap.registerPlugin(ScrollTrigger, SplitText, Flip, useGSAP);

gsap.defaults({ ease: "power3.out", duration: 0.9 });

/** Shared matchMedia conditions. Keep in sync with the CSS breakpoint (1024px). */
export const MOTION_CONDITIONS = {
  motion: "(prefers-reduced-motion: no-preference)",
  reduce: "(prefers-reduced-motion: reduce)",
  desktop: "(min-width: 1024px)",
  compact: "(max-width: 1023.98px)",
} as const;

export type MotionConditions = Record<keyof typeof MOTION_CONDITIONS, boolean>;

export { Flip, gsap, ScrollTrigger, SplitText, useGSAP };
