"use client";

import { buildChapter } from "@/animations/sections";
import { categoryMeta, techById, techCategories, technologies, type TechId } from "@/data/technologies";
import { useGSAPScene } from "@/hooks/useGSAPScene";
import { useStore } from "@/lib/store";
import { hoveredTech } from "@/lib/world";
import { ChapterHeading } from "../ui/ChapterHeading";
import { iconColor, TechIcon } from "../ui/TechIcon";
import { StatusLine } from "./Chapter";

const UNIVERSE: TechId[] = [
  "react", "nextjs", "typescript", "tailwind", "gsap", "threejs",
  "node", "express", "mongodb", "flutter", "dart", "git", "github", "postman", "figma",
];

/**
 * DOM side of the 3D tech universe. Hovering a node in 3D (raycast) or a
 * technology in this list sets the same store, so the scene and the detail
 * panel always agree — and keyboard users get the full experience.
 */
export function StackUniverse() {
  const scope = useGSAPScene<HTMLElement>((conditions, root) => buildChapter(root, conditions, "clip"));
  const active = useStore(hoveredTech, null);
  const tech = active ? techById[active] : null;

  return (
    <section ref={scope} id="universe" data-world="stack" data-nav="stack" aria-labelledby="universe-title" className="relative lg:min-h-[120svh]">
      <div aria-hidden="true" className="h-[62svh] lg:hidden" />
      <div className="container-x grid gap-10 pb-24 lg:min-h-[120svh] lg:grid-cols-12 lg:items-center lg:py-28">
        <div data-chapter-content className="lg:col-span-3">
          <ChapterHeading id="universe-title" index="06" label="Tech universe" title="One core, four orbits." />
          <p data-reveal="intro" className="mt-5 text-pretty leading-relaxed text-muted">
            Frontend, backend, mobile and tools orbit the same developer. Drag the scene to turn it; hover a technology to
            inspect it.
          </p>
          <StatusLine text="scan complete · 15 technologies · 4 orbits" />
        </div>

        <div className="lg:col-span-3 lg:col-start-10">
          <div aria-hidden={tech ? true : undefined} className="min-h-[11rem] rounded-md border border-line bg-bg-elev/70 p-5 backdrop-blur-[2px]">
            {tech ? (
              <>
                <p className="eyebrow flex items-center gap-2" style={{ color: categoryMeta[tech.category].color }}>
                  <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
                  {categoryMeta[tech.category].label}
                </p>
                <p className="mt-4 flex items-center gap-3 text-2xl font-semibold tracking-tight">
                  <span style={{ color: iconColor(tech.icon) }}>
                    <TechIcon id={tech.id} size={22} />
                  </span>
                  {tech.name}
                </p>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">{tech.capability}</p>
                <p className="mt-4 text-sm leading-relaxed text-muted">{tech.description}</p>
              </>
            ) : (
              <>
                <p className="eyebrow">Inspector</p>
                <p className="mt-4 text-sm leading-relaxed text-muted">Hover a node in the universe, or a technology below.</p>
              </>
            )}
          </div>

          <div className="mt-6 grid gap-4" onMouseLeave={() => hoveredTech.set(null)}>
            {techCategories.map((c) => (
              <div key={c}>
                <p className="eyebrow text-[10px]" style={{ color: categoryMeta[c].color }}>
                  {categoryMeta[c].label}
                </p>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {technologies
                    .filter((t) => t.category === c && UNIVERSE.includes(t.id))
                    .map((t) => (
                      <li key={t.id} data-cascade>
                        <button
                          type="button"
                          onMouseEnter={() => hoveredTech.set(t.id)}
                          onFocus={() => hoveredTech.set(t.id)}
                          onBlur={() => hoveredTech.set(null)}
                          className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors ${
                            active === t.id ? "border-white/40 text-fg" : "border-line-strong text-muted hover:text-fg"
                          }`}
                        >
                          <TechIcon id={t.id} size={12} />
                          {t.name}
                          <span className="sr-only">
                            : {t.capability}. {t.description}
                          </span>
                        </button>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
