"use client";

import type { Project } from "@/data/projects";
import { useCardTilt } from "@/hooks/useCardTilt";
import { ProjectLinks } from "./ProjectLinks";
import { ProjectPreview } from "./ProjectPreview";
import { StackIcons } from "./StackIcons";

export interface OpenProject {
  (slug: string, trigger: HTMLElement): void;
}

/** Pointer-following light; colour from the project accent. */
export function CardLight({ accent }: { accent: string }) {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[1] rounded-md opacity-0 transition-opacity duration-500 group-hover/card:opacity-100"
      style={{
        background: `radial-gradient(420px circle at var(--mx, 50%) var(--my, 30%), color-mix(in oklab, ${accent} 14%, transparent), transparent 65%)`,
      }}
    />
  );
}

export function ProjectCard({ project, onOpen }: { project: Project; onOpen: OpenProject }) {
  const tilt = useCardTilt<HTMLElement>();
  const headingId = `project-${project.slug}`;

  return (
    <article
      ref={tilt}
      aria-labelledby={headingId}
      data-cursor="project"
      className="group/card relative flex h-full flex-col rounded-md border border-line bg-bg-elev transition-[border-color,box-shadow] duration-500 hover:border-white/20 hover:shadow-[0_30px_60px_-30px_rgb(0_0_0/0.9)] focus-within:border-white/20"
    >
      <CardLight accent={project.accent} />
      <ProjectPreview project={project} />
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <p data-depth="4" className="eyebrow flex items-center gap-2.5">
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full" style={{ background: project.accent }} />
          <span className="text-fg">{project.type}</span>
          <span className="text-dim">{project.year}</span>
        </p>
        <h3
          id={headingId}
          className="mt-3 text-2xl font-semibold tracking-tight"
        >
          {/* Stretched button: the whole card opens the case study; links below stay clickable. */}
          <button
            type="button"
            onClick={(event) => onOpen(project.slug, event.currentTarget)}
            className="text-left after:absolute after:inset-0 after:z-[2] after:rounded-md"
          >
            <span className="inline-block transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/card:translate-x-1">{project.title}</span>
            <span className="sr-only">, open case study</span>
          </button>
        </h3>
        <p className="mt-2 text-pretty text-[0.9375rem] leading-relaxed text-muted">{project.description}</p>
        <div data-depth="6" className="mt-5">
          <StackIcons stack={project.stack} />
        </div>
        <div className="relative z-[3] mt-auto pt-5">
          <div className="flex items-center justify-between gap-3 border-t border-line pt-4">
            <ProjectLinks project={project} />
            <span aria-hidden="true" className="font-mono text-[10px] text-dim opacity-0 transition-opacity duration-300 group-hover/card:opacity-100">
              GET /projects/{project.slug}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
