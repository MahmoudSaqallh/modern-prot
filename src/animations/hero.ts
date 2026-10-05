import { appReady, world } from "@/lib/world";
import { gsap } from "./gsap";
import { maskChars } from "./reveal";

let introPlayed = false;

/** Longest we wait for the loader before revealing anyway. */
const FAILSAFE_S = 3;

/**
 * Intro: the camera pushes in while the core assembles and the technology
 * lanes draw and activate node by node (world.intro drives the 3D layer).
 * The title rises character by character and the copy settles in.
 * Must be called inside a gsap context (useGSAPScene) for cleanup.
 */
export function buildHeroIntro(root: HTMLElement) {
  const q = gsap.utils.selector(root);
  const title = maskChars(q("[data-hero-title]")[0] ?? null);
  const role = maskChars(q("[data-hero-role]")[0] ?? null);

  const tl = gsap.timeline({
    paused: true,
    onComplete: () => {
      introPlayed = true;
    },
  });

  tl.fromTo(world, { intro: 0 }, { intro: 1, duration: 3, ease: "power1.inOut" }, 0);
  if (title) tl.from(title.chars, { yPercent: 115, duration: 1.1, stagger: 0.028, ease: "expo.out" }, 0.4);
  if (role) tl.from(role.words, { yPercent: 115, duration: 0.9, stagger: 0.05, ease: "expo.out" }, 0.8);
  // After the core forms, the nodes activate and the portrait is revealed (world.intro ≈ 0.4–0.68).
  tl.from(q("[data-hero-fade]"), { y: 18, autoAlpha: 0, duration: 0.9, stagger: 0.1 }, 1.45);
  tl.from(q("[data-hero-lane]"), { x: -12, autoAlpha: 0, duration: 0.7, stagger: 0.12 }, 1.9);

  if (introPlayed) {
    // Rebuilt after a breakpoint change: don't replay the intro.
    tl.progress(1);
    return;
  }

  const play = () => {
    if (appReady.get()) tl.play();
  };
  const unsubscribe = appReady.subscribe(play);
  const failsafe = gsap.delayedCall(FAILSAFE_S, () => tl.play());
  play();

  return () => {
    unsubscribe();
    failsafe.kill();
  };
}

/** Hero copy drifts up and fades as the page scrolls into the next section. */
export function buildHeroExit(root: HTMLElement) {
  const content = root.querySelector("[data-hero-content]");
  if (!content) return;
  gsap.to(content, {
    yPercent: -10,
    autoAlpha: 0,
    ease: "none",
    scrollTrigger: { trigger: root, start: "top top", end: "bottom 20%", scrub: true },
  });
}
