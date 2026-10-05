"use client";

import { useState } from "react";
import { buildSkills } from "@/animations/skills";
import { categoryMeta, techById, type TechCategory, type TechId } from "@/data/technologies";
import { useGSAPScene } from "@/hooks/useGSAPScene";
import { ChapterHeading } from "../ui/ChapterHeading";
import { iconColor, TechIcon } from "../ui/TechIcon";

const CLUSTERS: { category: TechCategory; code: string; items: TechId[] }[] = [
  { category: "frontend", code: "01", items: ["react", "nextjs", "typescript", "javascript", "tailwind", "gsap", "threejs"] },
  { category: "backend", code: "02", items: ["node", "express", "mongodb", "rest", "socketio", "auth"] },
  { category: "mobile", code: "03", items: ["flutter", "dart", "android"] },
  { category: "tools", code: "04", items: ["git", "github", "postman", "figma"] },
];

/**
 * Skills as a technology system rather than a grid: each discipline is a bus
 * with technologies branched off it. Hovering (or focusing) a node lifts it
 * in depth, lights its branch and reveals what it is used for — and lights
 * the technologies it is usually built with in the other clusters.
 */
export function Skills() {
  const [active, setActive] = useState<TechId | null>(null);
  const related = active ? new Set<TechId>(techById[active].related) : null;
  const scope = useGSAPScene<HTMLElement>((conditions, root) => buildSkills(root, conditions));

  return (
    <section ref={scope} id="skills" data-nav="stack" aria-labelledby="skills-title" className="relative py-24 lg:py-32">
      <div className="container-x">
        <div data-skills-header className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <ChapterHeading id="skills-title" index="07" label="Skills" title="A system, not a list." className="lg:col-span-7" />
          <p data-reveal="intro" className="max-w-md text-pretty leading-relaxed text-muted lg:col-span-4 lg:col-start-9">
            Every technology has a job in the product. Hover or focus one to see what it does and what it connects to.
          </p>
        </div>

        <div className="mt-14 grid gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-4" onMouseLeave={() => setActive(null)}>
          {CLUSTERS.map((cluster) => {
            const meta = categoryMeta[cluster.category];
            return (
              <div key={cluster.category} data-cluster className="relative [perspective:900px]" style={{ ["--cat" as string]: meta.color }}>
                <div data-cluster-head className="flex items-baseline gap-3 border-b border-line pb-4">
                  <span className="font-mono text-xs text-dim">{cluster.code}</span>
                  <h3 className="eyebrow text-fg">{meta.label}</h3>
                  <span aria-hidden="true" className="ml-auto h-1.5 w-1.5 rounded-full bg-[var(--cat)] shadow-[0_0_10px_var(--cat)]" />
                </div>
                <p className="mt-2 text-xs text-muted">{meta.description}</p>

                <ul className="relative mt-5 grid gap-2 pl-5">
                  {/* The category bus every node branches from. */}
                  <span aria-hidden="true" data-bus className="absolute bottom-5 left-0 top-5 w-px bg-[var(--cat)] opacity-40" />
                  {cluster.items.map((id) => {
                    const tech = techById[id];
                    const on = active === id;
                    const linked = related?.has(id) ?? false;
                    return (
                      <li key={id} data-skill-node className="group/node relative">
                        <span
                          aria-hidden="true"
                          data-branch
                          className={`absolute -left-5 top-[27px] h-px w-5 transition-colors duration-300 ${on || linked ? "bg-[var(--cat)]" : "bg-line-strong"}`}
                        />
                        <button
                          type="button"
                          onMouseEnter={() => setActive(id)}
                          onFocus={() => setActive(id)}
                          onBlur={() => setActive(null)}
                          className={`relative flex w-full items-start gap-3 rounded-[6px] border px-3 py-2.5 text-left transition-[transform,border-color,background-color,box-shadow] duration-500 ease-[var(--ease-out-expo)] ${
                            on
                              ? "border-[color-mix(in_oklab,var(--cat)_55%,transparent)] bg-bg-raised shadow-[0_18px_40px_-22px_var(--cat)] [transform:translateZ(22px)_translateX(4px)]"
                              : linked
                                ? "border-[color-mix(in_oklab,var(--cat)_30%,transparent)] bg-bg-elev"
                                : "border-line bg-bg-elev/80"
                          }`}
                        >
                          <span
                            className={`grid h-9 w-9 flex-none place-items-center rounded-[5px] border transition-[color,border-color,box-shadow] duration-300 ${
                              on || linked ? "border-white/20" : "border-line-strong text-muted"
                            } ${on ? "shadow-[0_0_18px_-4px_var(--icon)]" : ""}`}
                            style={{ ["--icon" as string]: iconColor(tech.icon), color: on || linked ? iconColor(tech.icon) : undefined }}
                          >
                            <TechIcon id={id} size={17} />
                          </span>
                          <span className="min-w-0 pt-0.5">
                            <span className="block text-[0.9375rem] font-medium leading-tight text-fg">{tech.name}</span>
                            <span className="mt-0.5 block font-mono text-[10.5px] uppercase tracking-[0.08em] text-muted">{tech.capability}</span>
                            <span className={`grid transition-[grid-template-rows] duration-500 ${on ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                              <span className="overflow-hidden">
                                <span className="block pt-2 text-xs leading-relaxed text-muted">{tech.description}</span>
                              </span>
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
