"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/animations/gsap";
import { profile } from "@/data/profile";
import { techById, type TechId } from "@/data/technologies";
import { appReady, sceneReady } from "@/lib/world";
import { TechIcon } from "../ui/TechIcon";

const MIN_MS = 1000;
const MAX_MS = 2200;

const MODULES: TechId[] = ["react", "nextjs", "typescript", "javascript", "node", "express", "mongodb", "flutter", "dart"];

/** Boot log; `at` is the progress (0–100) at which each line prints. */
const LOG = [
  { at: 0, text: "initializing portfolio" },
  { at: 16, text: "loading modules · react next ts js node express mongodb flutter dart" },
  { at: 46, text: "connecting stack · client ↔ api ↔ db" },
  { at: 74, text: "compiling experience · 3d world, motion, scenes" },
  { at: 100, text: "build successful ✓" },
];

/**
 * Signature preloader: a real boot sequence. Log lines carry the actual
 * elapsed load time, the stack comes online module by module, and on
 * completion the core ignites where the 3D Developer Core forms — then the
 * loader opens as an aperture from that point into the site.
 * Bounded (~1–2.2 s), skipped with reduced motion, hidden by CSS if JS fails.
 */
export function Loader() {
  const root = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) {
        appReady.set(true);
        setDone(true);
        return;
      }

      const q = gsap.utils.selector(el);
      const count = q("[data-count]")[0] as HTMLElement | undefined;
      const bar = q("[data-bar]")[0] as HTMLElement | undefined;
      const stage = q("[data-stage-text]")[0] as HTMLElement | undefined;
      const modules = q<HTMLElement>("[data-module]");
      const lines = q<HTMLElement>("[data-log]");
      const start = performance.now();
      const counter = { value: 0 };
      let finished = false;

      const stamp = (line: HTMLElement) => {
        if (line.dataset.state === "on") return;
        line.dataset.state = "on";
        const ts = line.querySelector("[data-ts]");
        if (ts) ts.textContent = `${((performance.now() - start) / 1000).toFixed(2)}s`;
        if (stage) stage.textContent = line.dataset.text ?? "";
      };

      const render = () => {
        const v = counter.value;
        if (count) count.textContent = String(Math.round(v)).padStart(3, "0");
        if (bar) bar.style.transform = `scaleX(${(v / 100).toFixed(4)})`;
        modules.forEach((m, i) => {
          m.dataset.state = v >= ((i + 1) / modules.length) * 88 ? "on" : "off";
        });
        lines.forEach((line, i) => {
          if (v >= LOG[i].at && LOG[i].at < 100) stamp(line);
        });
      };

      const crawl = gsap.to(counter, { value: 90, duration: 1.8, ease: "power1.out", onUpdate: render });
      render();

      const finish = () => {
        if (finished) return;
        finished = true;
        crawl.kill();
        // Where the Developer Core forms on this layout: the aperture opens there.
        const wide = window.innerWidth >= 1024;
        el.style.setProperty("--ax", wide ? "76%" : "50%");
        el.style.setProperty("--ay", wide ? "50%" : "30%");
        gsap
          .timeline({ onComplete: () => setDone(true) })
          .to(counter, { value: 100, duration: 0.35, ease: "power2.out", onUpdate: render })
          .call(() => stamp(lines[lines.length - 1]))
          .to(q("[data-ignite]"), { scale: 1, autoAlpha: 1, duration: 0.3, ease: "back.out(3)" }, "+=0.15")
          .call(() => appReady.set(true))
          .to(q("[data-loader-content]"), { autoAlpha: 0, y: -12, duration: 0.45, ease: "power2.in" }, "<")
          .to(el, { "--r": "150vmax", duration: 1.05, ease: "expo.inOut" }, "<0.05")
          .to(q("[data-ignite]"), { scale: 6, autoAlpha: 0, duration: 0.6, ease: "power2.out" }, "<");
      };

      const whenSceneReady = () => {
        if (!sceneReady.get()) return;
        const wait = Math.max(0, MIN_MS - (performance.now() - start));
        gsap.delayedCall(wait / 1000, finish);
      };
      const unsubscribe = sceneReady.subscribe(whenSceneReady);
      whenSceneReady();
      gsap.delayedCall(MAX_MS / 1000, finish);
      return () => unsubscribe();
    },
    { scope: root },
  );

  if (done) return null;

  return (
    <div ref={root} className="loader" role="status" aria-live="polite" aria-label="Loading portfolio">
      <div aria-hidden="true" className="tech-grid absolute inset-0 opacity-60" />
      <div aria-hidden="true" className="loader-scan" />

      <div data-loader-content className="relative grid h-full grid-rows-[auto_1fr_auto] gap-8">
        <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
          <span>
            <span className="text-fg">{profile.name.toLowerCase().replace(/\s+/g, ".")}</span>/portfolio
          </span>
          <span>build · production</span>
        </div>

        <div className="grid content-center gap-10 lg:grid-cols-12 lg:items-end">
          {/* Boot log with real elapsed timestamps. */}
          <ol className="grid gap-1.5 font-mono text-[12px] lg:col-span-7">
            {LOG.map((line) => (
              <li key={line.text} data-log data-text={line.text} data-state="off" className="loader-log flex gap-4">
                <span data-ts className="w-14 flex-none text-right text-dim" />
                <span className={line.at === 100 ? "text-accent" : undefined}>{line.text}</span>
              </li>
            ))}
          </ol>

          {/* The stack coming online. */}
          <ul className="flex flex-wrap gap-2 lg:col-span-5 lg:justify-end" aria-label="Modules">
            {MODULES.map((id) => (
              <li
                key={id}
                data-module
                data-state="off"
                className="loader-module grid h-11 w-11 place-items-center rounded-[6px] border"
                style={{ ["--brand" as string]: "path" in techById[id].icon ? `#${(techById[id].icon as { hex: string }).hex}` : "#5be37d" }}
                title={techById[id].name}
              >
                <TechIcon id={id} size={18} title={techById[id].name} />
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="flex items-end justify-between gap-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
              <span aria-hidden="true" className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-accent align-middle" />
              <span data-stage-text>initializing portfolio</span>
            </p>
            <p className="font-mono leading-none tracking-[-0.04em] text-fg">
              <span data-count className="text-[clamp(3.5rem,11vw,9rem)] tabular-nums">
                000
              </span>
              <span className="text-[clamp(1.5rem,3vw,2.5rem)] text-dim">%</span>
            </p>
          </div>
          <div className="mt-4 h-px w-full bg-line">
            <div data-bar className="h-full origin-left scale-x-0 bg-gradient-to-r from-web via-server to-accent" />
          </div>
        </div>
      </div>

      {/* The core ignites where the 3D Developer Core will form. */}
      <span aria-hidden="true" data-ignite className="loader-ignite" />
    </div>
  );
}
