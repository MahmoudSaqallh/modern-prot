import { world } from "@/lib/world";
import { bootStatus } from "./code";
import type { MotionConditions } from "./gsap";
import { gsap } from "./gsap";
import { maskChars } from "./reveal";

/**
 * Closing sequence (the 3D background has already slowed: calm station):
 *  1. headline reveals            2. availability status appears
 *  3. links enter with stagger    4. the communication node activates
 *  5. its connection lines draw   6. the final system message types in
 * Then nothing loops: the page ends on a pause.
 */
export function buildContact(root: HTMLElement, { motion }: MotionConditions) {
  if (!motion) {
    world.contactIntro = 1;
    return;
  }
  const q = gsap.utils.selector(root);
  const title = maskChars(q("[data-contact-title]")[0] ?? null);
  const stopStatus = bootStatus(q<HTMLElement>("[data-status]")[0] ?? null, q("[data-contact-final]")[0] ?? root);

  const tl = gsap.timeline({ scrollTrigger: { trigger: root, start: "top 70%", once: true } });
  if (title) tl.from(title.chars, { yPercent: 115, duration: 1, stagger: 0.022, ease: "expo.out" }, 0);
  tl.from(q("[data-contact-copy]"), { y: 14, autoAlpha: 0, duration: 0.6, stagger: 0.08 }, 0.35)
    .from(q("[data-contact-status]"), { autoAlpha: 0, x: -10, duration: 0.5 }, 0.65)
    .from(q("[data-contact-row]"), { x: 32, autoAlpha: 0, duration: 0.6, stagger: 0.08, ease: "power3.out" }, 0.75)
    .fromTo(q("[data-row-base]"), { scaleX: 0 }, { scaleX: 1, transformOrigin: "0% 50%", duration: 0.5, stagger: 0.08, ease: "power2.inOut" }, 0.85)
    .fromTo(world, { contactIntro: 0 }, { contactIntro: 1, duration: 1.6, ease: "power1.inOut" }, 0.9)
    .from(q("[data-contact-final]"), { autoAlpha: 0, duration: 0.5 }, 2.1);

  return stopStatus;
}

/**
 * Fast GSAP hover motion for each contact row (pointer and keyboard focus):
 * the label shifts, the arrow moves diagonally (down for downloads), the icon
 * nudges and the divider draws in; everything eases back on leave.
 */
export function bindContactRows(root: HTMLElement) {
  const rows = Array.from(root.querySelectorAll<HTMLElement>("[data-contact-row]"));
  const cleanups = rows.map((row) => {
    const label = row.querySelector("[data-row-label]");
    const arrow = row.querySelector<HTMLElement>("[data-row-arrow]");
    const icon = row.querySelector("[data-row-icon]");
    const line = row.querySelector("[data-row-line]");
    const down = arrow?.dataset.direction === "down";
    const enter = () => {
      gsap.to(label, { x: 8, duration: 0.35, ease: "power3.out", overwrite: "auto" });
      gsap.to(arrow, { x: down ? 0 : 5, y: down ? 5 : -5, duration: 0.35, ease: "power3.out", overwrite: "auto" });
      gsap.to(icon, { x: 3, duration: 0.35, ease: "power3.out", overwrite: "auto" });
      gsap.to(line, { scaleX: 1, duration: 0.45, ease: "expo.out", overwrite: "auto" });
    };
    const leave = () => {
      gsap.to([label, arrow, icon], { x: 0, y: 0, duration: 0.4, ease: "power3.out", overwrite: "auto" });
      gsap.to(line, { scaleX: 0, duration: 0.35, ease: "power2.inOut", overwrite: "auto" });
    };
    row.addEventListener("pointerenter", enter);
    row.addEventListener("pointerleave", leave);
    row.addEventListener("focusin", enter);
    row.addEventListener("focusout", leave);
    return () => {
      row.removeEventListener("pointerenter", enter);
      row.removeEventListener("pointerleave", leave);
      row.removeEventListener("focusin", enter);
      row.removeEventListener("focusout", leave);
      gsap.killTweensOf([label, arrow, icon, line]);
    };
  });
  return () => cleanups.forEach((fn) => fn());
}
