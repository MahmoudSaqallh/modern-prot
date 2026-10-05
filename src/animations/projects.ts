import { Flip, gsap, ScrollTrigger } from "./gsap";

/** Capture card positions before React applies a new filter. */
export function captureCards(container: HTMLElement) {
  return Flip.getState(container.querySelectorAll("[data-card]"), { props: "opacity" });
}

/**
 * After the filter is applied: cards that stay glide to their new slots,
 * cards that leave fade and shrink slightly, new ones fade in.
 */
export function animateFilter(state: Flip.FlipState) {
  return Flip.from(state, {
    duration: 0.65,
    ease: "power3.inOut",
    scale: true,
    absolute: true,
    onEnter: (elements) =>
      gsap.fromTo(elements, { autoAlpha: 0, scale: 0.95 }, { autoAlpha: 1, scale: 1, duration: 0.5, delay: 0.2, ease: "power2.out" }),
    onLeave: (elements) => gsap.to(elements, { autoAlpha: 0, scale: 0.95, duration: 0.3, ease: "power2.in" }),
    onComplete: () => ScrollTrigger.refresh(),
  });
}

/**
 * Cards rise in as the grid scrolls into view, in reading order. Returns a
 * function that finishes every pending reveal at once (used when the visitor
 * filters before scrolling through the grid).
 */
export function revealCards(container: HTMLElement) {
  const cards = container.querySelectorAll("[data-card]");
  if (!cards.length) return () => {};
  const triggers = ScrollTrigger.batch(cards, {
    start: "top 88%",
    once: true,
    onEnter: (batch) =>
      gsap.fromTo(
        batch,
        { y: 40, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.9, stagger: 0.08, ease: "power3.out", clearProps: "transform" },
      ),
  });
  // Hide cards below the fold until their batch enters (only when motion is allowed).
  gsap.set(Array.from(cards).filter((c) => c.getBoundingClientRect().top > window.innerHeight), { autoAlpha: 0 });
  return () => {
    triggers.forEach((t) => t.kill());
    gsap.set(cards, { autoAlpha: 1, clearProps: "transform" });
  };
}
