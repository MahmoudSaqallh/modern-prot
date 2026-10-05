import { bootStatus } from "./code";
import type { MotionConditions } from "./gsap";
import { gsap } from "./gsap";
import { maskLines, rise, slideWords } from "./reveal";

export type Entrance = "mask" | "clip" | "slide";

/**
 * Shared behaviour for the sticky 3D chapters (frontend, backend, database,
 * flutter): a distinct entrance per chapter, a typed status line, list items
 * that cascade in, and an exit where the copy tilts back while the camera
 * travels on.
 */
export function buildChapter(section: HTMLElement, { motion, desktop }: MotionConditions, entrance: Entrance) {
  if (!motion) return;
  const q = gsap.utils.selector(section);
  const content = q("[data-chapter-content]")[0] ?? section;
  const title = q("[data-reveal='title']")[0] ?? null;

  if (entrance === "mask") maskLines(title, { trigger: content });
  else if (entrance === "slide") slideWords(title, { trigger: content });
  else if (title) {
    gsap.fromTo(
      title,
      { clipPath: "inset(0% 0% 100% 0%)", y: 30 },
      {
        clipPath: "inset(0% 0% 0% 0%)",
        y: 0,
        duration: 1.3,
        ease: "expo.out",
        clearProps: "clipPath",
        scrollTrigger: { trigger: content, start: "top 72%", once: true },
      },
    );
  }

  rise(q("[data-reveal='eyebrow'], [data-reveal='intro']"), { trigger: content, delay: 0.12 });
  const stopStatus = bootStatus(q<HTMLElement>("[data-status]")[0] ?? null, content);

  const items = q("[data-cascade]");
  if (items.length) {
    gsap.from(items, {
      x: entrance === "slide" ? 30 : -18,
      autoAlpha: 0,
      duration: 0.8,
      stagger: 0.06,
      ease: "power3.out",
      scrollTrigger: { trigger: items[0], start: "top 88%", once: true },
    });
  }

  if (desktop) {
    gsap.to(content, {
      y: -70,
      rotateX: 9,
      autoAlpha: 0,
      transformPerspective: 900,
      transformOrigin: "50% 100%",
      ease: "none",
      scrollTrigger: { trigger: section, start: "bottom bottom", end: "bottom 35%", scrub: true },
    });
  }

  return stopStatus;
}
