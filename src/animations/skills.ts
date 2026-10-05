import type { MotionConditions } from "./gsap";
import { gsap } from "./gsap";
import { maskLines, rise } from "./reveal";

/**
 * Skills system entrance: per cluster the category bus draws downward, the
 * branches extend, and technology nodes arrive from depth one by one.
 */
export function buildSkills(section: HTMLElement, { motion }: MotionConditions) {
  if (!motion) return;
  const q = gsap.utils.selector(section);
  const header = q("[data-skills-header]")[0] ?? section;
  maskLines(q("[data-reveal='title']")[0] ?? null, { trigger: header });
  rise(q("[data-reveal='eyebrow'], [data-reveal='intro']"), { trigger: header, delay: 0.1 });

  q<HTMLElement>("[data-cluster]").forEach((cluster, i) => {
    const sel = gsap.utils.selector(cluster);
    gsap
      .timeline({ scrollTrigger: { trigger: cluster, start: "top 82%", toggleActions: "play none none none" }, delay: i * 0.1 })
      .from(sel("[data-cluster-head]"), { y: 16, autoAlpha: 0, duration: 0.6, ease: "power3.out" })
      .from(sel("[data-bus]"), { scaleY: 0, transformOrigin: "50% 0%", duration: 0.9, ease: "power2.inOut" }, 0.15)
      .from(sel("[data-branch]"), { scaleX: 0, transformOrigin: "0% 50%", duration: 0.35, stagger: 0.06, ease: "power2.out" }, 0.45)
      .from(
        sel("[data-skill-node]"),
        { z: -90, x: -10, autoAlpha: 0, transformPerspective: 900, duration: 0.8, stagger: 0.06, ease: "expo.out", clearProps: "transform" },
        0.5,
      );
  });
}
