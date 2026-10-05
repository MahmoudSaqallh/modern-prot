import type { MotionConditions } from "./gsap";
import { gsap, ScrollTrigger } from "./gsap";
import { maskLines, rise } from "./reveal";

/**
 * Development workflow. Wide screens with motion: the section is tall and
 * its rail is CSS-sticky (no GSAP pin, so React-owned nodes are never
 * re-parented); scroll fills the line, moves a data signal along it and
 * activates each stage in turn. Narrow screens: a vertical list where each
 * stage activates as it reaches the reading line.
 */
export function buildWorkflow(root: HTMLElement, { motion, desktop }: MotionConditions, onStage: (index: number) => void, count: number) {
  if (!motion) return;
  const q = gsap.utils.selector(root);
  const header = q("[data-workflow-header]")[0] ?? root;
  maskLines(q("[data-reveal='title']")[0] ?? null, { trigger: header });
  rise(q("[data-reveal='eyebrow'], [data-reveal='intro']"), { trigger: header, delay: 0.1 });

  onStage(-1);

  if (desktop) {
    let current = -1;
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: root,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.5,
        onUpdate: (self) => {
          const next = Math.min(count - 1, Math.floor(self.progress * count * 0.999 + 0.3));
          if (next !== current) {
            current = next;
            onStage(next);
          }
        },
      },
    });
    tl.fromTo(q("[data-workflow-fill='x']"), { scaleX: 0 }, { scaleX: 1, ease: "none" }, 0).fromTo(
      q("[data-workflow-signal]"),
      { left: "0%" },
      { left: "100%", ease: "none" },
      0,
    );
  } else {
    gsap.fromTo(
      q("[data-workflow-fill='y']"),
      { scaleY: 0 },
      { scaleY: 1, ease: "none", scrollTrigger: { trigger: q("[data-workflow-list]")[0] ?? root, start: "top 60%", end: "bottom 60%", scrub: true } },
    );
    q<HTMLElement>("[data-workflow-stage]").forEach((stage, i) => {
      ScrollTrigger.create({
        trigger: stage,
        start: "top 60%",
        onEnter: () => onStage(i),
        onLeaveBack: () => onStage(i - 1),
      });
    });
  }

  return () => onStage(count - 1);
}
