"use client";

import { useState } from "react";
import { FlaskConical, Lightbulb, Rocket } from "lucide-react";
import { buildWorkflow } from "@/animations/workflow";
import { workflow, type WorkflowStage } from "@/data/workflow";
import { useGSAPScene } from "@/hooks/useGSAPScene";
import { ChapterHeading } from "../ui/ChapterHeading";
import { TechIcon } from "../ui/TechIcon";

const LAST = workflow.length - 1;

function StageIcon({ icon, size = 18 }: { icon: WorkflowStage["icon"]; size?: number }) {
  if (icon === "idea") return <Lightbulb size={size} strokeWidth={1.75} aria-hidden="true" />;
  if (icon === "testing") return <FlaskConical size={size} strokeWidth={1.75} aria-hidden="true" />;
  if (icon === "deploy") return <Rocket size={size} strokeWidth={1.75} aria-hidden="true" />;
  return <TechIcon id={icon} size={size - 1} />;
}

/** Idea → Design → Frontend → API → Backend → Database → Mobile → Testing → Deployment. */
export function Workflow() {
  // Without motion every stage is shown as reached.
  const [active, setActive] = useState(LAST);
  const scope = useGSAPScene<HTMLElement>((conditions, root) => buildWorkflow(root, conditions, setActive, workflow.length));

  return (
    <section ref={scope} id="workflow" data-nav="experience" aria-labelledby="workflow-title" className="relative cinematic:h-[260svh]">
      <div className="py-24 cinematic:sticky cinematic:top-0 cinematic:flex cinematic:h-svh cinematic:items-center cinematic:py-0">
        <div aria-hidden="true" className="tech-grid absolute inset-0" />
        <div className="container-x relative w-full">
          <div data-workflow-header className="grid gap-6 lg:grid-cols-12 lg:items-end">
            <ChapterHeading id="workflow-title" index="09" label="How I build" title="From idea to production." className="lg:col-span-7" />
            <p data-reveal="intro" className="max-w-md text-pretty leading-relaxed text-muted lg:col-span-4 lg:col-start-9">
              One pipeline, one person accountable: design, web, API, data and mobile ship together.
            </p>
          </div>

          {/* Horizontal rail (wide screens with motion). */}
          <div className="relative mt-16 hidden cinematic:block">
            <div aria-hidden="true" className="absolute left-[5.5%] right-[5.5%] top-6 h-px bg-line">
              <div data-workflow-fill="x" className="h-full origin-left bg-gradient-to-r from-web via-server to-mobile" />
              <span
                data-workflow-signal
                className="absolute top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_14px_3px_rgb(155_239_0/0.55)]"
              />
            </div>
            <ol className="relative grid grid-cols-9 gap-2" aria-label="Development workflow">
              {workflow.map((stage, i) => {
                const reached = i <= active;
                const current = i === active;
                return (
                  <li key={stage.id} aria-current={current ? "step" : undefined} className="flex flex-col items-center text-center">
                    <span
                      className={`grid h-12 w-12 place-items-center rounded-full border bg-bg transition-[border-color,color,box-shadow,transform] duration-500 ${
                        current
                          ? "scale-110 border-fg text-fg shadow-[0_0_28px_-6px_rgb(51_214_255/0.6)]"
                          : reached
                            ? "border-white/30 text-fg"
                            : "border-line-strong text-dim"
                      }`}
                    >
                      <StageIcon icon={stage.icon} />
                    </span>
                    <span className="mt-2 font-mono text-[10px] text-dim">{String(i + 1).padStart(2, "0")}</span>
                    <span className={`mt-1 text-[0.9375rem] font-medium transition-[opacity,transform] duration-500 ${reached ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"}`}>
                      {stage.label}
                    </span>
                    <span className={`mt-2 max-w-[11rem] text-pretty text-xs leading-relaxed text-muted transition-[opacity,transform] duration-500 ${current ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"}`}>
                      {stage.description}
                    </span>
                    <code
                      className={`mt-2 rounded-[3px] border border-line px-1.5 py-0.5 font-mono text-[10px] text-accent transition-opacity duration-500 ${current ? "opacity-100" : "opacity-0"}`}
                    >
                      {stage.signal}
                    </code>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Vertical list (narrow screens, or reduced motion). */}
          <div className="relative mt-12 cinematic:hidden">
            <div aria-hidden="true" className="absolute bottom-6 left-6 top-6 w-px bg-line">
              <div data-workflow-fill="y" className="h-full w-full origin-top bg-gradient-to-b from-web via-server to-mobile" />
            </div>
            <ol data-workflow-list className="relative grid gap-6" aria-label="Development workflow">
              {workflow.map((stage, i) => {
                const reached = i <= active;
                return (
                  <li key={stage.id} data-workflow-stage className="flex gap-4">
                    <span
                      className={`grid h-12 w-12 flex-none place-items-center rounded-full border bg-bg transition-colors duration-500 ${
                        reached ? "border-white/35 text-fg" : "border-line-strong text-dim"
                      }`}
                    >
                      <StageIcon icon={stage.icon} />
                    </span>
                    <span className="pt-1">
                      <span className="flex items-baseline gap-2">
                        <span className="font-mono text-[10px] text-dim">{String(i + 1).padStart(2, "0")}</span>
                        <span className={`text-base font-medium transition-colors ${reached ? "text-fg" : "text-muted"}`}>{stage.label}</span>
                      </span>
                      <span className="mt-1 block text-sm leading-relaxed text-muted">{stage.description}</span>
                      <code className="mt-1.5 inline-block font-mono text-[11px] text-accent">{stage.signal}</code>
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
