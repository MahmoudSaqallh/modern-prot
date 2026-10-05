"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { animateFilter, captureCards, revealCards } from "@/animations/projects";
import { Flip, gsap } from "@/animations/gsap";
import { maskLines, rise } from "@/animations/reveal";
import { projectFilters, projects, type ProjectFilter } from "@/data/projects";
import { useGSAPScene } from "@/hooks/useGSAPScene";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { activeProject } from "@/lib/world";
import { ChapterHeading } from "../ui/ChapterHeading";
import { FeaturedProject } from "./FeaturedProject";
import { ProjectCard } from "./ProjectCard";
import { ProjectDetail } from "./ProjectDetail";

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

const matches = (filter: ProjectFilter, category: readonly string[]) => filter === "All" || category.includes(filter);
const countFor = (filter: ProjectFilter) => projects.filter((p) => matches(filter, p.category)).length;

export function Projects() {
  const reduced = useReducedMotion();
  const [filter, setFilter] = useState<ProjectFilter>("All");
  const grid = useRef<HTMLUListElement>(null);
  const pending = useRef<Flip.FlipState | null>(null);
  const running = useRef<gsap.core.Timeline | null>(null);
  const finishReveal = useRef<(() => void) | null>(null);
  const [open, setOpen] = useState<{ slug: string; origin: Flip.FlipState | null } | null>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  // The 3D world flies to the opened project panel.
  useEffect(() => {
    activeProject.set(open?.slug ?? null);
  }, [open]);
  useEffect(() => () => activeProject.set(null), []);

  const openProject = (slug: string, trigger: HTMLElement) => {
    returnFocus.current = trigger;
    const preview = trigger.closest("article")?.querySelector(`[data-flip-id="${slug}"]`);
    setOpen({ slug, origin: preview && !reduced ? Flip.getState(preview) : null });
  };

  const closeProject = () => {
    setOpen(null);
    returnFocus.current?.focus({ preventScroll: true });
  };

  const openProjectData = open ? projects.find((p) => p.slug === open.slug) : undefined;

  const scope = useGSAPScene<HTMLElement>(({ motion }, root) => {
    if (!motion) return;
    const q = gsap.utils.selector(root);
    const header = q("[data-projects-header]")[0] ?? root;
    maskLines(q("[data-reveal='title']")[0] ?? null, { trigger: header });
    rise(q("[data-reveal='eyebrow'], [data-reveal='intro'], [data-filters]"), { trigger: header, delay: 0.1 }, 0.08);
    if (grid.current) finishReveal.current = revealCards(grid.current);
    return () => {
      finishReveal.current = null;
    };
  });

  const choose = (next: ProjectFilter) => {
    if (next === filter) return;
    // Filtering makes scroll-reveals moot: show every card before measuring.
    finishReveal.current?.();
    finishReveal.current = null;
    if (!reduced && grid.current) {
      running.current?.progress(1);
      pending.current = captureCards(grid.current);
    }
    setFilter(next);
  };

  // Animate from the captured layout once React has applied the new filter.
  useIsoLayoutEffect(() => {
    const state = pending.current;
    if (!state) return;
    pending.current = null;
    running.current = animateFilter(state);
  }, [filter]);

  useEffect(() => () => void running.current?.kill(), []);

  const visibleCount = countFor(filter);

  return (
    <section ref={scope} id="projects" data-world="projects" data-world-anchor="top" data-nav="projects" aria-labelledby="projects-title" className="relative py-28 lg:py-36">
      <div className="container-x">
        <div data-projects-header className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <ChapterHeading id="projects-title" index="08" label="Selected work" title="Products shipped end to end." size="lg" className="lg:col-span-8">
            Web platforms, Flutter apps and the APIs between them — designed, built and deployed.
          </ChapterHeading>

          <div data-filters className="lg:col-span-4 lg:justify-self-end">
            <div role="group" aria-label="Filter projects" className="flex flex-wrap gap-1.5 lg:justify-end">
              {projectFilters.map((f) => {
                const on = f === filter;
                return (
                  <button
                    key={f}
                    type="button"
                    aria-pressed={on}
                    onClick={() => choose(f)}
                    className={`rounded-full border px-3 py-1.5 text-[13px] transition-[background-color,border-color,color] duration-300 ${
                      on ? "border-fg bg-fg text-bg" : "border-line-strong text-muted hover:border-white/35 hover:text-fg"
                    }`}
                  >
                    {f}
                    <span className={`ml-1.5 font-mono text-[10px] ${on ? "text-bg/60" : "text-dim"}`}>{countFor(f)}</span>
                  </button>
                );
              })}
            </div>
            <p role="status" className="sr-only">
              Showing {visibleCount} {visibleCount === 1 ? "project" : "projects"}
              {filter === "All" ? "" : ` in ${filter}`}
            </p>
          </div>
        </div>

        <ul ref={grid} className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => {
            const show = matches(filter, project.category);
            return (
              <li
                key={project.slug}
                data-card
                data-hidden={!show}
                className={project.featured ? "sm:col-span-2 xl:col-span-3" : undefined}
              >
                {project.featured ? <FeaturedProject project={project} onOpen={openProject} /> : <ProjectCard project={project} onOpen={openProject} />}
              </li>
            );
          })}
        </ul>
      </div>
      {openProjectData &&
        open &&
        createPortal(<ProjectDetail project={openProjectData} origin={open.origin} onClose={closeProject} />, document.body)}
    </section>
  );
}
