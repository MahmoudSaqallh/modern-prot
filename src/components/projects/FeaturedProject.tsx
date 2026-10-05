"use client";

import type { Project } from "@/data/projects";
import { useCardTilt } from "@/hooks/useCardTilt";
import { DeviceFrame } from "../ui/DeviceFrame";
import { ProjectLinks } from "./ProjectLinks";
import { CardLight, type OpenProject } from "./ProjectCard";
import { StackIcons } from "./StackIcons";

/** The lead project: larger preview inside its device, plus a short case study. */
export function FeaturedProject({ project, onOpen }: { project: Project; onOpen: OpenProject }) {
  const tilt = useCardTilt<HTMLElement>();
  const headingId = `project-${project.slug}`;

  return (
    <article
      ref={tilt}
      aria-labelledby={headingId}
      data-cursor="project"
      className="group/card relative grid overflow-hidden rounded-md border border-line bg-bg-elev transition-[border-color,box-shadow] duration-500 hover:border-white/20 hover:shadow-[0_40px_80px_-40px_rgb(0_0_0/0.9)] focus-within:border-white/20 lg:grid-cols-12"
    >
      <CardLight accent={project.accent} />
      <div
        role="img"
        data-flip-id={project.slug}
        aria-label={`${project.title} interface preview`}
        className="relative flex items-center justify-center overflow-hidden border-b border-line px-6 pb-4 pt-10 sm:px-12 lg:col-span-7 lg:border-b-0 lg:border-r lg:px-10 lg:py-14"
        style={{
          backgroundImage: `radial-gradient(ellipse 70% 60% at 50% 100%, color-mix(in oklab, ${project.accent} 14%, transparent), transparent 70%)`,
        }}
      >
        <div data-depth="18" className="w-full max-w-[620px]">
          <DeviceFrame project={project} />
        </div>
      </div>

      <div className="flex flex-col p-6 sm:p-8 lg:col-span-5 lg:p-10">
        <p data-depth="4" className="eyebrow flex flex-wrap items-center gap-2.5">
          <span className="rounded-[3px] border border-line-strong px-1.5 py-0.5 text-[10px] text-fg">Featured</span>
          <span style={{ color: project.accent }}>{project.type}</span>
          <span className="text-dim">{project.year}</span>
        </p>
        <h3
          id={headingId}
          className="display-md mt-4"
        >
          <button
            type="button"
            onClick={(event) => onOpen(project.slug, event.currentTarget)}
            className="text-left after:absolute after:inset-0 after:z-[2]"
          >
            <span className="inline-block transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/card:translate-x-1">{project.title}</span>
            <span className="sr-only">, open case study</span>
          </button>
        </h3>
        <p className="mt-4 text-pretty leading-relaxed text-muted">{project.description}</p>

        {project.caseStudy && (
          <dl className="mt-6 grid gap-4 border-t border-line pt-5 text-sm">
            {(
              [
                ["Problem", project.caseStudy.problem],
                ["Solution", project.caseStudy.solution],
                ["Role", project.role],
                ["Result", project.caseStudy.outcome],
              ] as const
            ).map(([label, text]) => (
              <div key={label} className="grid gap-1 sm:grid-cols-[6rem_1fr] sm:gap-4">
                <dt className="eyebrow pt-0.5">{label}</dt>
                <dd className="text-pretty leading-relaxed text-fg/90">{text}</dd>
              </div>
            ))}
          </dl>
        )}

        <div data-depth="6" className="mt-6">
          <StackIcons stack={project.stack} withNames />
        </div>
        <ProjectLinks project={project} className="relative z-[3] mt-8 border-t border-line pt-5" />
      </div>
    </article>
  );
}
