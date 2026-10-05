"use client";

import { buildChapter } from "@/animations/sections";
import { frontendLayers } from "@/data/architecture";
import { techById, type TechId } from "@/data/technologies";
import { useGSAPScene } from "@/hooks/useGSAPScene";
import { useWorldValue } from "@/hooks/useWorldValue";
import { layerAtProgress } from "@/lib/stations";
import { useStore } from "@/lib/store";
import { hoveredLayer, world } from "@/lib/world";
import { ChapterHeading } from "../ui/ChapterHeading";
import { TechIcon } from "../ui/TechIcon";
import { Chapter, StatusLine } from "./Chapter";

const STACK: TechId[] = ["react", "nextjs", "typescript", "tailwind", "gsap"];
const scrollLayer = () => layerAtProgress(world.progress.frontend, frontendLayers.length);

export function FrontendSection() {
  const scope = useGSAPScene<HTMLElement>((conditions, root) => buildChapter(root, conditions, "mask"));
  const hovered = useStore(hoveredLayer, -1);
  const auto = useWorldValue(scrollLayer, 0);
  const active = hovered >= 0 ? hovered : auto;
  const owners = new Set(frontendLayers[active]?.techs ?? []);

  return (
    <Chapter ref={scope} world="frontend" nav="stack" labelledBy="frontend-title" side="left" id="stack">
      <ChapterHeading
        id="frontend-title"
        index="02"
        label="Frontend"
        title={
          <>
            Interfaces, built <span className="font-serif font-normal italic tracking-normal">in layers.</span>
          </>
        }
      >
        The browser you see is only the top layer. Behind it: the component tree, the state it reads, and the API calls
        that feed it. Hover a layer — here or in the 3D window.
      </ChapterHeading>
      <StatusLine text="rendering <App /> · 4 layers · hydrated" />

      <ol className="mt-8 border-t border-line" onMouseLeave={() => hoveredLayer.set(-1)}>
        {frontendLayers.map((layer, i) => {
          const on = i === active;
          return (
            <li key={layer.id} data-cascade className="relative border-b border-line">
              <span aria-hidden="true" className={`absolute -left-4 top-0 h-full w-px bg-web transition-opacity duration-500 ${on ? "opacity-100" : "opacity-0"}`} />
              <button
                type="button"
                onMouseEnter={() => hoveredLayer.set(i)}
                onFocus={() => hoveredLayer.set(i)}
                onBlur={() => hoveredLayer.set(-1)}
                data-cursor="code"
                className="grid w-full grid-cols-[2.25rem_1fr_auto] items-baseline gap-x-3 py-3.5 text-left"
              >
                <span className="font-mono text-xs text-dim">0{i + 1}</span>
                <span>
                  <span className={`block text-lg font-medium tracking-tight transition-colors duration-300 ${on ? "text-fg" : "text-muted"}`}>{layer.name}</span>
                  <span className={`grid transition-[grid-template-rows] duration-500 ${on ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                    <span className="overflow-hidden">
                      <span className="block pt-1 text-sm leading-relaxed text-muted">{layer.description}</span>
                    </span>
                  </span>
                </span>
                <span className="flex items-center gap-1.5">
                  {layer.techs.map((id) => (
                    <TechIcon key={id} id={id} size={14} title={techById[id].name} className={on ? "text-fg" : "text-dim"} />
                  ))}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <ul aria-label="Frontend stack" className="mt-7 flex flex-wrap gap-2">
        {STACK.map((id) => (
          <li
            key={id}
            data-cascade
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors duration-300 ${
              owners.has(id) ? "border-web/50 text-fg" : "border-line-strong text-muted"
            }`}
          >
            <TechIcon id={id} size={13} />
            {techById[id].name}
          </li>
        ))}
      </ul>
    </Chapter>
  );
}
