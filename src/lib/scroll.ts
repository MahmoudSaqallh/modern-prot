import type Lenis from "lenis";

let lenis: Lenis | null = null;

export function setLenis(instance: Lenis | null) {
  lenis = instance;
}

export function getLenis() {
  return lenis;
}

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Scroll to a section by id and move keyboard focus to it, so keyboard and
 * screen-reader users land where sighted users do.
 */
export function scrollToSection(id: string, { immediate = false } = {}) {
  const el = document.getElementById(id);
  if (!el) return;
  const instant = immediate || prefersReducedMotion();

  if (lenis && !instant) {
    lenis.scrollTo(el, { duration: 1.3, easing: (t) => 1 - Math.pow(1 - t, 4) });
  } else {
    el.scrollIntoView({ behavior: instant ? "auto" : "smooth", block: "start" });
  }

  if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
  el.focus({ preventScroll: true });
  if (window.location.hash !== `#${id}`) {
    window.history.replaceState(null, "", id === "home" ? window.location.pathname : `#${id}`);
  }
}
