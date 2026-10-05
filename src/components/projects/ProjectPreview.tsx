import Image from "next/image";
import type { Project } from "@/data/projects";
import { DeviceFrame } from "../ui/DeviceFrame";
import { ProjectScreen } from "../ui/ProjectScreens";

/**
 * Card image area. Screenshots fill the frame; without one, a generated
 * interface is shown — inside a phone for mobile apps, edge to edge otherwise.
 * `data-depth` drives the hover parallax in useCardTilt.
 */
export function ProjectPreview({ project }: { project: Project }) {
  const tint = `radial-gradient(ellipse 80% 70% at 50% 100%, color-mix(in oklab, ${project.accent} 16%, transparent), transparent 70%)`;

  return (
    <div
      role="img"
      data-flip-id={project.slug}
      aria-label={`${project.title} interface preview`}
      className="relative aspect-[16/10] overflow-hidden rounded-t-[5px] border-b border-line bg-[#0b0d11]"
      style={{ backgroundImage: tint }}
    >
      <div data-depth="14" className="absolute -inset-[4%]">
        {project.image ? (
          <Image src={project.image} alt="" fill sizes="(min-width: 1280px) 30vw, (min-width: 640px) 46vw, 92vw" className="object-cover object-top" />
        ) : project.device === "phone" ? (
          <div className="grid h-full place-items-center pt-[8%]">
            <div className="w-[34%] translate-y-[12%]">
              <DeviceFrame project={project} />
            </div>
          </div>
        ) : (
          <div className="@container h-full w-full">
            <div className="h-full w-full" style={{ fontSize: "2.4cqw" }}>
              <ProjectScreen kind={project.preview} />
            </div>
          </div>
        )}
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg/40 to-transparent" />
    </div>
  );
}
