import Image from "next/image";
import type { Project } from "@/data/projects";
import { DeviceFrame } from "../ui/DeviceFrame";
import { ImageSlider } from "../ui/ImageSlider";
import { ProjectScreen } from "../ui/ProjectScreens";

const SIZES = "(min-width: 1280px) 30vw, (min-width: 640px) 46vw, 92vw";

/** "dqq-rco3.vercel.app" from a deployment URL. */
export const hostOf = (url: string) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");

/**
 * Card image area: a slim browser bar (address and live status) above the
 * screenshot, which eases in on hover. Projects with several screens get a
 * slider; without any screenshot a generated interface is shown instead.
 * `data-depth` drives the hover parallax in useCardTilt.
 */
export function ProjectPreview({ project }: { project: Project }) {
  const tint = `radial-gradient(ellipse 80% 70% at 50% 100%, color-mix(in oklab, ${project.accent} 16%, transparent), transparent 70%)`;

  const media = project.image ? (
    <Image
      src={project.image}
      alt=""
      fill
      sizes={SIZES}
      className="object-cover object-top transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover/card:scale-[1.04]"
    />
  ) : project.device === "phone" ? (
    <div className="grid h-full place-items-center pt-[8%]">
      <div className="w-[34%] translate-y-[12%]">
        <DeviceFrame project={project} />
      </div>
    </div>
  ) : (
    <div className="@container h-full w-full">
      <div className="h-full w-full" style={{ fontSize: "2.4cqw" }}>
        <ProjectScreen kind={project.preview ?? "saas"} />
      </div>
    </div>
  );

  return (
    <div
      role={project.gallery ? undefined : "img"}
      data-flip-id={project.slug}
      aria-label={project.gallery ? undefined : `${project.title} website screenshot`}
      className="relative overflow-hidden rounded-t-[5px] border-b border-line bg-[#0b0d11]"
      style={{ backgroundImage: tint }}
    >
      <div aria-hidden="true" className="relative z-[1] flex items-center gap-1.5 border-b border-line bg-[#0e1116] px-3 py-2">
        <span className="h-[7px] w-[7px] rounded-full bg-white/15" />
        <span className="h-[7px] w-[7px] rounded-full bg-white/15" />
        <span className="h-[7px] w-[7px] rounded-full bg-white/15" />
        <span className="ml-2 flex h-5 min-w-0 flex-1 items-center gap-1.5 rounded-full bg-white/[0.04] px-2.5 font-mono text-[10px] text-dim">
          <span className="truncate">{project.liveUrl ? hostOf(project.liveUrl) : `/${project.slug}`}</span>
        </span>
        {project.gallery && (
          <span className="ml-1 font-mono text-[9.5px] uppercase tracking-[0.14em] text-muted">{project.gallery.length} screens</span>
        )}
        {project.liveUrl && (
          <span className="ml-1 flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-server" />
            Live
          </span>
        )}
      </div>

      <div className="relative aspect-[16/9] overflow-hidden">
        {project.gallery ? (
          <ImageSlider slides={project.gallery} label={project.title} sizes={SIZES} />
        ) : (
          <>
            <div data-depth="14" className="absolute -inset-[4%]">
              {media}
            </div>
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg/50 via-transparent to-transparent" />
          </>
        )}
        {project.lang === "ar" && (
          <span className="absolute bottom-2.5 right-2.5 rounded-[3px] border border-white/15 bg-bg/70 px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.12em] text-fg/85">
            AR · RTL
          </span>
        )}
      </div>
    </div>
  );
}
