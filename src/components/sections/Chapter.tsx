import type { ReactNode, Ref } from "react";
import type { NavId } from "@/data/profile";
import type { WorldSectionId } from "@/lib/world";

interface ChapterProps {
  world: WorldSectionId;
  nav: NavId;
  labelledBy: string;
  /** Which side the copy sits on; the 3D scene takes the other side. */
  side: "left" | "right";
  id?: string;
  /** Scroll length on wide screens (copy stays sticky while the scene plays). */
  height?: string;
  ref?: Ref<HTMLElement>;
  children: ReactNode;
}

/**
 * Layout for the 3D chapters. Wide screens: a tall section with sticky copy
 * on one side and the scene visible on the other. Narrow screens: a stage
 * gap first (the scene shows through it), then the copy.
 */
export function Chapter({ world, nav, labelledBy, side, id, height = "lg:h-[210svh]", ref, children }: ChapterProps) {
  return (
    <section ref={ref} id={id} data-world={world} data-nav={nav} aria-labelledby={labelledBy} className={`relative ${height}`}>
      <div className="lg:sticky lg:top-0 lg:flex lg:h-svh lg:items-center">
        <div aria-hidden="true" className="h-[58svh] lg:hidden" />
        <div className="container-x">
          <div
            data-chapter-content
            className={`relative pb-24 pt-6 lg:w-[44%] lg:py-0 xl:w-[38%] ${side === "right" ? "lg:ml-auto" : ""} max-lg:before:absolute max-lg:before:-inset-x-[var(--gutter)] max-lg:before:-top-16 max-lg:before:bottom-0 max-lg:before:-z-10 max-lg:before:bg-gradient-to-b max-lg:before:from-transparent max-lg:before:via-bg/85 max-lg:before:to-bg`}
          >
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

/** Typed "system state" line shown under a chapter heading. */
export function StatusLine({ text }: { text: string }) {
  return (
    <p className="mt-6 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-server" />
      <span aria-hidden="true" data-status={text} />
      <span className="sr-only">{text}</span>
    </p>
  );
}
