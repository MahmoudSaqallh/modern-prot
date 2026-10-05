import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/data/projects";

/** Live Demo / GitHub / Case Study actions. Only the links that exist are shown. */
export function ProjectLinks({ project, className = "" }: { project: Project; className?: string }) {
  const links = [
    project.liveUrl && { label: "Live Demo", href: project.liveUrl },
    project.githubUrl && { label: "GitHub", href: project.githubUrl },
    project.caseStudyUrl && { label: "Case Study", href: project.caseStudyUrl },
  ].filter((l): l is { label: string; href: string } => Boolean(l));

  if (!links.length) return null;

  return (
    <div className={`flex flex-wrap items-center gap-x-5 gap-y-2 ${className}`}>
      {links.map((link, i) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`group/link inline-flex items-center gap-1.5 text-sm font-medium transition-colors ${i === 0 ? "text-fg" : "text-muted hover:text-fg"}`}
        >
          <span className="link-underline">{link.label}</span>
          <ArrowUpRight
            size={15}
            aria-hidden="true"
            className="transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5"
          />
          <span className="sr-only">
            {" "}
            for {project.title} (opens in a new tab)
          </span>
        </a>
      ))}
    </div>
  );
}
