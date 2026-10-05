"use client";

import { useEffect, useState } from "react";
import { buildChapter } from "@/animations/sections";
import { flutterFlow, mobileFeatures, mobileScreens } from "@/data/architecture";
import { techById } from "@/data/technologies";
import { useGSAPScene } from "@/hooks/useGSAPScene";
import { useWorldValue } from "@/hooks/useWorldValue";
import { SCREEN_BREAKS } from "@/lib/stations";
import { world } from "@/lib/world";
import { ChapterHeading } from "../ui/ChapterHeading";
import { iconColor, TechIcon } from "../ui/TechIcon";
import { Chapter, StatusLine } from "./Chapter";

/** Screen implied by scroll position through the chapter. */
const scrollScreen = () => {
  const p = world.progress.flutter;
  return p < SCREEN_BREAKS[0] ? 0 : p < SCREEN_BREAKS[1] ? 1 : 2;
};

export function FlutterSection() {
  const scope = useGSAPScene<HTMLElement>((conditions, root) => buildChapter(root, conditions, "slide"));
  const auto = useWorldValue(scrollScreen, 1);
  const [picked, setPicked] = useState<number | null>(null);
  const screen = picked ?? auto;

  // The 3D phone reads the screen from the world state.
  useEffect(() => {
    world.phoneScreen = screen;
  }, [screen]);

  return (
    <Chapter ref={scope} world="flutter" nav="stack" labelledBy="flutter-title" side="right" height="lg:h-[240svh]">
      <ChapterHeading id="flutter-title" index="05" label="Mobile / Flutter" title="Same backend, in your pocket.">
        A Flutter app with its own native feel on the same API as the web app: typed models, cached state, push
        notifications and secure sign-in.
      </ChapterHeading>
      <StatusLine text="flutter run · release · connected to api.example.com" />

      <div role="group" aria-label="Phone screen" className="mt-8 flex gap-2">
        {mobileScreens.map((s, i) => (
          <button
            key={s.id}
            type="button"
            data-cascade
            aria-pressed={screen === i}
            onClick={() => setPicked(i)}
            className={`rounded-full border px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] transition-colors ${
              screen === i ? "border-mobile/60 text-fg" : "border-line-strong text-muted hover:text-fg"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <ol aria-label="Mobile data flow" className="relative mt-8 grid gap-3">
        <span aria-hidden="true" className="absolute bottom-5 left-5 top-5 w-px overflow-hidden bg-line-strong">
          <span className="flow-dot absolute left-0 top-0 h-6 w-px bg-gradient-to-b from-transparent via-mobile to-transparent" />
        </span>
        {flutterFlow.map((step) => (
          <li key={step.id} data-cascade className="relative flex items-center gap-4">
            <span className="grid h-10 w-10 flex-none place-items-center rounded-full border border-line-strong bg-bg" style={{ color: iconColor(techById[step.icon].icon) }}>
              <TechIcon id={step.icon} size={16} />
            </span>
            <span>
              <span className="block text-[0.9375rem] font-medium text-fg">{step.name}</span>
              <span className="block font-mono text-[11px] uppercase tracking-[0.1em] text-muted">{step.note}</span>
            </span>
          </li>
        ))}
      </ol>

      <ul aria-label="Mobile capabilities" className="mt-8 grid grid-cols-2 gap-x-6 gap-y-2.5">
        {mobileFeatures.map((feature) => (
          <li key={feature} data-cascade className="flex items-center gap-2.5 text-sm text-muted">
            <span aria-hidden="true" className="h-1 w-1 flex-none bg-mobile" />
            {feature}
          </li>
        ))}
      </ul>
    </Chapter>
  );
}
