"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/animations/gsap";
import { useFinePointer, useReducedMotion } from "@/hooks/useReducedMotion";
import { sceneCursor } from "@/lib/world";

const TARGETS = "[data-cursor], a, button, [role='button'], [role='tab'], input, textarea, select, label[for]";
const LABELS: Record<string, string> = { project: "View", drag: "Drag", code: "</>" };

type CursorState = "default" | "link" | "interactive" | "project" | "drag" | "code" | "text";

/**
 * Desktop-only developer cursor: a precise dot and a trailing ring.
 * Link (anchors), Interactive (controls), Project (cards), Code (editors and
 * terminals), Drag (the 3D universe, reported by the scene), Text (inputs).
 */
export function Cursor() {
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const enabled = fine && !reduced;
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = root.current;
    const d = dot.current;
    const r = ring.current;
    if (!enabled || !el || !d || !r) return;

    document.documentElement.classList.add("has-cursor");
    const dotX = gsap.quickTo(d, "x", { duration: 0.08, ease: "power3" });
    const dotY = gsap.quickTo(d, "y", { duration: 0.08, ease: "power3" });
    const ringX = gsap.quickTo(r, "x", { duration: 0.38, ease: "power3" });
    const ringY = gsap.quickTo(r, "y", { duration: 0.38, ease: "power3" });
    let state: CursorState | "" = "";
    let domTarget: Element | null = null;

    const apply = () => {
      let next: CursorState = "default";
      if (domTarget) {
        if (domTarget.matches("input, textarea, select")) next = "text";
        else next = (domTarget.getAttribute("data-cursor") as CursorState | null) ?? (domTarget.matches("a") ? "link" : "interactive");
      } else {
        const scene = sceneCursor.get();
        if (scene !== "default") next = scene;
      }
      if (next === state) return;
      state = next;
      r.dataset.state = next;
      if (label.current) label.current.textContent = LABELS[next] ?? "";
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      el.dataset.visible = "true";
      dotX(event.clientX);
      dotY(event.clientY);
      ringX(event.clientX);
      ringY(event.clientY);
      // Nearest interactive element wins; inside a card, its links/buttons win over the card.
      domTarget = event.target instanceof Element ? event.target.closest(TARGETS) : null;
      // A card's stretched title button covers the card: show the Project state there.
      const card = domTarget?.closest("[data-cursor='project']");
      if (card && domTarget?.closest("h3")) domTarget = card;
      apply();
    };
    const onLeave = () => {
      el.dataset.visible = "false";
    };
    const onDown = () => {
      r.dataset.pressed = "true";
    };
    const onUp = () => {
      r.dataset.pressed = "false";
    };
    const unsubscribe = sceneCursor.subscribe(apply);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    return () => {
      unsubscribe();
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div ref={root} className="cursor" aria-hidden="true" data-visible="false">
      <div ref={ring} className="cursor-ring" data-state="default">
        <span ref={label} className="cursor-label" />
      </div>
      <div ref={dot} className="cursor-dot" />
    </div>
  );
}
