import Image from "next/image";
import type { Project } from "@/data/projects";
import { ProjectScreen } from "./ProjectScreens";

/** Root font size of the generated preview, relative to the screen width. */
const PREVIEW_SCALE: Record<Project["device"], string> = {
  laptop: "1.55cqw",
  browser: "1.55cqw",
  desktop: "1.2cqw",
  phone: "4.6cqw",
};

const SIZES: Record<Project["device"], string> = {
  laptop: "(min-width: 1024px) 55vw, 92vw",
  browser: "(min-width: 1024px) 55vw, 92vw",
  desktop: "(min-width: 1024px) 60vw, 92vw",
  phone: "290px",
};

/**
 * Device mockup chosen by project type: laptop or browser for web work,
 * a phone for Flutter, a widescreen monitor for dashboards.
 */
export function DeviceFrame({ project }: { project: Project }) {
  const { device } = project;

  const screen = (
    <div className="device-screen @container">
      <div data-project-screen className="relative h-full w-full scale-[1.06]">
        {project.image ? (
          <Image src={project.image} alt="" fill sizes={SIZES[device]} className="object-cover object-top" />
        ) : (
          <div className="h-full w-full" style={{ fontSize: PREVIEW_SCALE[device] }}>
            <ProjectScreen kind={project.preview} />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div
      role="img"
      aria-label={`${project.title} interface on a ${device === "browser" ? "browser window" : device}`}
      className={`device device-${device}`}
    >
      {device === "browser" && (
        <div aria-hidden="true" className="mb-0 flex items-center gap-1.5 rounded-t-[12px] border border-b-0 border-line-strong bg-[#101318] px-3 py-2.5">
          <span className="h-2 w-2 rounded-full bg-white/20" />
          <span className="h-2 w-2 rounded-full bg-white/20" />
          <span className="h-2 w-2 rounded-full bg-white/20" />
          <span className="ml-3 h-4 flex-1 rounded-full bg-white/[0.05]" />
        </div>
      )}
      {device === "browser" ? <div className="[&_.device-screen]:rounded-t-none">{screen}</div> : screen}
      {device === "laptop" && <div aria-hidden="true" className="device-base" />}
      {device === "desktop" && <div aria-hidden="true" className="device-stand" />}
    </div>
  );
}
