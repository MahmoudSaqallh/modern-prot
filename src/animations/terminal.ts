import type { MotionConditions } from "./gsap";
import { gsap } from "./gsap";
import { maskLines } from "./reveal";

/**
 * Terminal entrance: the heading rises from its mask and the terminal swings
 * up out of depth, then hands its transform back to CSS (.terminal-3d) so
 * the resting tilt and hover straightening keep working.
 */
export function buildTerminal(root: HTMLElement, { motion }: MotionConditions) {
  if (!motion) return;
  const q = gsap.utils.selector(root);
  maskLines(q("[data-reveal='title']")[0] ?? null, { trigger: root });
  gsap.from(q("[data-terminal]"), {
    rotateX: 12,
    y: 50,
    autoAlpha: 0,
    transformPerspective: 1200,
    transformOrigin: "50% 0%",
    duration: 1.2,
    ease: "expo.out",
    clearProps: "transform",
    scrollTrigger: { trigger: root, start: "top 70%", toggleActions: "play none none none" },
  });
}
