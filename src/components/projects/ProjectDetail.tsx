"use client";

import { useEffect, useLayoutEffect, useRef, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { Flip, gsap } from "@/animations/gsap";
import type { Project } from "@/data/projects";
import { techById } from "@/data/technologies";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { getLenis } from "@/lib/scroll";
import { DeviceFrame } from "../ui/DeviceFrame";
import { iconColor, TechIcon } from "../ui/TechIcon";
import { ProjectLinks } from "./ProjectLinks";

interface ProjectDetailProps {
  project: Project;
  /** Flip state of the card preview captured just before opening. */
  origin: Flip.FlipState | null;
  onClose: () => void;
}

/**
 * Cinematic project view. The card's preview morphs into the large device
 * (GSAP Flip), the case study and stack cascade in, and the 3D camera flies to
 * the project's panel behind (activeProject store). Behaves as a modal dialog:
 * focus moves in, is trapped, Esc closes, focus returns to the card.
 */
export function ProjectDetail({ project, origin, onClose }: ProjectDetailProps) {
  const reduced = useReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const closing = useRef(false);
  const headingId = `detail-${project.slug}`;

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const q = gsap.utils.selector(el);
    const ctx = gsap.context(() => {
      if (reduced) return;
      gsap.from(q("[data-detail-backdrop]"), { autoAlpha: 0, duration: 0.5, ease: "power2.out" });
      if (origin) {
        Flip.from(origin, { targets: q("[data-flip-id]"), duration: 0.85, ease: "expo.inOut", absolute: true, scale: true, simple: true });
      } else {
        gsap.from(q("[data-flip-id]"), { scale: 0.92, autoAlpha: 0, duration: 0.8, ease: "expo.out" });
      }
      gsap.from(q("[data-detail-reveal]"), { y: 28, autoAlpha: 0, duration: 0.8, stagger: 0.07, delay: 0.35, ease: "power3.out" });
      gsap.from(q("[data-detail-tech]"), { scale: 0.6, autoAlpha: 0, duration: 0.5, stagger: 0.05, delay: 0.7, ease: "back.out(2)" });
    }, el);
    return () => ctx.revert();
  }, [origin, reduced]);

  useEffect(() => {
    const lenis = getLenis();
    lenis?.stop();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    return () => {
      lenis?.start();
      document.body.style.overflow = previous;
    };
  }, []);

  const close = () => {
    const el = root.current;
    if (closing.current) return;
    closing.current = true;
    if (!el || reduced) {
      onClose();
      return;
    }
    gsap
      .timeline({ onComplete: onClose })
      .to(el.querySelectorAll("[data-detail-reveal], [data-flip-id]"), { y: 20, autoAlpha: 0, duration: 0.3, stagger: 0.02, ease: "power2.in" })
      .to(el.querySelector("[data-detail-backdrop]"), { autoAlpha: 0, duration: 0.3 }, "-=0.1");
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      close();
      return;
    }
    if (event.key !== "Tab" || !root.current) return;
    const focusable = Array.from(root.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"));
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const study = project.caseStudy;

  return (
    <div ref={root} role="dialog" aria-modal="true" aria-labelledby={headingId} onKeyDown={onKeyDown} className="fixed inset-0 z-[80]">
      <div data-detail-backdrop className="absolute inset-0 bg-bg/80 backdrop-blur-[3px]" onClick={close} aria-hidden="true" />
      <div data-lenis-prevent className="relative h-full overflow-y-auto overscroll-contain">
        <div className="container-x relative grid min-h-full items-center gap-10 py-20 lg:grid-cols-12 lg:gap-12">
          <button
            ref={closeButton}
            type="button"
            onClick={close}
            className="fixed right-[var(--gutter)] top-5 z-10 flex items-center gap-2 rounded-full border border-line-strong bg-bg/80 px-3 py-2 font-mono text-xs text-fg transition-colors hover:border-white/40"
          >
            <X size={14} aria-hidden="true" /> Close <span className="text-dim">esc</span>
          </button>

          <div className="lg:col-span-7">
            <div data-flip-id={project.slug} className="relative mx-auto w-full" style={{ maxWidth: project.device === "phone" ? 300 : 820 }}>
              <DeviceFrame project={project} />
            </div>
          </div>

          <div className="lg:col-span-5">
            <p data-detail-reveal className="eyebrow flex flex-wrap items-center gap-2.5">
              <span style={{ color: project.accent }}>{project.type}</span>
              <span className="text-dim">{project.year}</span>
              <span className="font-mono normal-case tracking-normal text-dim">· /projects/{project.slug}</span>
            </p>
            <h2 id={headingId} data-detail-reveal className="display-lg mt-4">
              {project.title}
            </h2>
            <p data-detail-reveal className="mt-5 text-pretty text-lg leading-relaxed text-muted">
              {project.description}
            </p>

            {study && (
              <dl className="mt-8 grid gap-5 border-t border-line pt-6">
                {(
                  [
                    ["Problem", study.problem],
                    ["Solution", study.solution],
                    ["Role", project.role],
                    ["Result", study.outcome],
                  ] as const
                ).map(([label, text]) => (
                  <div key={label} data-detail-reveal className="grid gap-1 sm:grid-cols-[6.5rem_1fr] sm:gap-4">
                    <dt className="eyebrow pt-0.5">{label}</dt>
                    <dd className="text-pretty leading-relaxed text-fg/90">{text}</dd>
                  </div>
                ))}
              </dl>
            )}

            <div data-detail-reveal className="mt-8 border-t border-line pt-6">
              <p className="eyebrow">Stack</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {project.stack.map((id) => (
                  <li key={id} data-detail-tech className="flex items-center gap-2 rounded-full border border-line-strong px-3 py-1.5 text-sm">
                    <span style={{ color: iconColor(techById[id].icon) }}>
                      <TechIcon id={id} size={14} />
                    </span>
                    {techById[id].name}
                  </li>
                ))}
              </ul>
            </div>

            <div data-detail-reveal>
              <ProjectLinks project={project} className="mt-8 border-t border-line pt-6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
