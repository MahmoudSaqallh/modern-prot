import { gsap, SplitText } from "./gsap";

interface RevealOptions {
  trigger: Element;
  start?: string;
  delay?: number;
}

/**
 * Lines rise out of a mask. Re-splits when fonts load or the width changes;
 * SplitText reverts and rebuilds the returned tween so nothing duplicates.
 */
export function maskLines(target: Element | null, { trigger, start = "top 72%", delay = 0 }: RevealOptions) {
  if (!target) return;
  SplitText.create(target, {
    type: "lines",
    mask: "lines",
    autoSplit: true,
    onSplit: (self) =>
      gsap.from(self.lines, {
        yPercent: 110,
        duration: 1.1,
        stagger: 0.09,
        delay,
        ease: "expo.out",
        scrollTrigger: { trigger, start, toggleActions: "play none none none" },
      }),
  });
}

/** Characters rise one by one inside word masks. Used for the hero and the outro. */
export function maskChars(target: Element | null) {
  if (!target) return null;
  return SplitText.create(target, { type: "words,chars", mask: "words" });
}

/** Words travel in horizontally with a soft fade. */
export function slideWords(target: Element | null, { trigger, start = "top 72%", delay = 0 }: RevealOptions) {
  if (!target) return;
  SplitText.create(target, {
    type: "words",
    autoSplit: true,
    onSplit: (self) =>
      gsap.from(self.words, {
        x: 48,
        autoAlpha: 0,
        duration: 1,
        stagger: 0.05,
        delay,
        ease: "power3.out",
        scrollTrigger: { trigger, start, toggleActions: "play none none none" },
      }),
  });
}

/** Simple rise + fade for supporting copy. */
export function rise(targets: gsap.TweenTarget, { trigger, start = "top 72%", delay = 0 }: RevealOptions, stagger = 0.06) {
  gsap.from(targets, {
    y: 22,
    autoAlpha: 0,
    duration: 0.9,
    stagger,
    delay,
    ease: "power3.out",
    scrollTrigger: { trigger, start, toggleActions: "play none none none" },
  });
}
