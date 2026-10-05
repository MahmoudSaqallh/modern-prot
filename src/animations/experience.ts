import type { MotionConditions } from "./gsap";
import { gsap, ScrollTrigger } from "./gsap";
import { maskLines, rise } from "./reveal";

/** A single line grows with scroll; each role is uncovered as the line reaches it. */
export function buildExperience(section: HTMLElement, { motion }: MotionConditions) {
  if (!motion) return;
  const q = gsap.utils.selector(section);
  const heading = q("[data-experience-heading]")[0] ?? section;
  maskLines(q("[data-reveal='title']")[0] ?? null, { trigger: heading });
  rise(q("[data-reveal='eyebrow'], [data-reveal='intro']"), { trigger: heading, delay: 0.15 });

  const timeline = q("[data-timeline]")[0];
  if (!timeline) return;
  gsap.fromTo(
    q("[data-timeline-fill]"),
    { scaleY: 0 },
    { scaleY: 1, ease: "none", scrollTrigger: { trigger: timeline, start: "top 60%", end: "bottom 60%", scrub: true } },
  );

  q<HTMLElement>("[data-entry]").forEach((entry) => {
    gsap.fromTo(
      entry.querySelector("[data-entry-body]"),
      { clipPath: "inset(0% 0% 100% 0%)", y: 24 },
      {
        clipPath: "inset(0% 0% 0% 0%)",
        y: 0,
        duration: 1.2,
        ease: "expo.out",
        clearProps: "clipPath",
        scrollTrigger: { trigger: entry, start: "top 62%", toggleActions: "play none none none" },
      },
    );
    // The node lights when the growing line reaches it.
    entry.dataset.lit = "false";
    ScrollTrigger.create({
      trigger: entry,
      start: "top 60%",
      onEnter: () => (entry.dataset.lit = "true"),
      onLeaveBack: () => (entry.dataset.lit = "false"),
    });
  });

  return () => {
    q<HTMLElement>("[data-entry]").forEach((entry) => delete entry.dataset.lit);
  };
}
