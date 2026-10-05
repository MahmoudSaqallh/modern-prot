import { gsap } from "./gsap";

/**
 * Types `text` into `el` character by character and returns the tween.
 *
 * `el` must be an element whose children React does not render (an empty
 * element with the text in a data attribute / sr-only sibling). Writing
 * textContent into a React-managed text node would break reconciliation.
 */
export function typeText(el: Element, text: string, { cps = 38, delay = 0 } = {}) {
  const state = { n: 0 };
  return gsap.to(state, {
    n: text.length,
    duration: Math.max(0.2, text.length / cps),
    delay,
    ease: "none",
    onUpdate: () => {
      el.textContent = text.slice(0, Math.round(state.n));
    },
  });
}

/**
 * Chapter "system state" line (e.g. `connecting /api … ok`). Without motion
 * the CSS shows `data-status` via ::before; with motion the text types in
 * when the chapter enters, like a process reporting progress.
 */
export function bootStatus(el: HTMLElement | null, trigger: Element) {
  if (!el) return () => {};
  const text = el.dataset.status ?? "";
  el.dataset.typing = "true";
  const tween = typeText(el, text, { cps: 46 }).pause();
  gsap.timeline({ scrollTrigger: { trigger, start: "top 70%", toggleActions: "play none none none", onEnter: () => tween.play() } });
  return () => {
    tween.kill();
    el.textContent = "";
    delete el.dataset.typing;
  };
}
