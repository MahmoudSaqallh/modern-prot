"use client";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { gsap } from "@/animations/gsap";
import { navItems, profile } from "@/data/profile";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { getLenis, scrollToSection } from "@/lib/scroll";
import { createStore, useStore } from "@/lib/store";
import { world } from "@/lib/world";

export const paletteOpen = createStore(false);

interface Command {
  id: string;
  label: string;
  hint: string;
  run: () => void;
}

function useCommands(): Command[] {
  return useMemo(
    () => [
      ...navItems.map((item) => ({ id: `go-${item.id}`, label: `Go to ${item.label}`, hint: `cd ~/${item.id}`, run: () => scrollToSection(item.id) })),
      { id: "stack", label: "Open tech universe", hint: "open ./universe", run: () => scrollToSection("universe") },
      {
        id: "request",
        label: "Send GET /api/projects",
        hint: "curl /api/projects",
        run: () => {
          scrollToSection("backend");
          window.setTimeout(() => (world.requestId += 1), 900);
        },
      },
      { id: "terminal", label: "Open terminal", hint: "./terminal", run: () => scrollToSection("terminal") },
      { id: "email", label: "Copy email address", hint: profile.email, run: () => void navigator.clipboard?.writeText(profile.email).catch(() => {}) },
      { id: "cv", label: "Download CV", hint: "wget cv.pdf", run: () => window.open(profile.cvUrl, "_blank", "noopener") },
      { id: "github", label: "Open GitHub", hint: "git remote -v", run: () => window.open(profile.github, "_blank", "noopener,noreferrer") },
      { id: "linkedin", label: "Open LinkedIn", hint: "open linkedin", run: () => window.open(profile.linkedin, "_blank", "noopener,noreferrer") },
    ],
    [],
  );
}

/** Ctrl/Cmd + K: jump anywhere or run an action. Keyboard-first combobox. */
export function CommandPalette() {
  const open = useStore(paletteOpen, false);

  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        paletteOpen.set(!paletteOpen.get());
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!open) return null;
  return createPortal(<Palette />, document.body);
}

function Palette() {
  const commands = useCommands();
  const reduced = useReducedMotion();
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const panel = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const restore = useRef<Element | null>(null);
  const listId = useId();

  const results = commands.filter((c) => `${c.label} ${c.hint}`.toLowerCase().includes(query.trim().toLowerCase()));
  const current = Math.min(index, Math.max(0, results.length - 1));

  useEffect(() => {
    restore.current = document.activeElement;
    input.current?.focus();
    getLenis()?.stop();
    if (!reduced && panel.current) gsap.from(panel.current, { y: -12, autoAlpha: 0, scale: 0.98, duration: 0.35, ease: "power3.out" });
    return () => {
      getLenis()?.start();
      if (restore.current instanceof HTMLElement) restore.current.focus({ preventScroll: true });
    };
  }, [reduced]);

  const close = () => paletteOpen.set(false);
  const runAt = (i: number) => {
    const cmd = results[i];
    if (!cmd) return;
    close();
    requestAnimationFrame(() => cmd.run());
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIndex((current + 1) % Math.max(1, results.length));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setIndex((current - 1 + results.length) % Math.max(1, results.length));
    } else if (event.key === "Enter") {
      event.preventDefault();
      runAt(current);
    } else if (event.key === "Escape") {
      event.preventDefault();
      close();
    } else if (event.key === "Tab") {
      // Single focus stop: keep focus in the input.
      event.preventDefault();
    }
  };

  return (
    <div className="fixed inset-0 z-[95] grid place-items-start justify-center px-4 pt-[14vh]" role="dialog" aria-modal="true" aria-label="Command palette">
      <div className="absolute inset-0 bg-bg/70 backdrop-blur-[2px]" aria-hidden="true" onClick={close} />
      <div ref={panel} className="relative w-full max-w-lg overflow-hidden rounded-md border border-line-strong bg-bg-raised shadow-[0_40px_100px_-30px_rgb(0_0_0/0.95)]">
        <div className="flex items-center gap-3 border-b border-line px-4">
          <span aria-hidden="true" className="font-mono text-sm text-server">
            ❯
          </span>
          <input
            ref={input}
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={results[current] ? `${listId}-${results[current].id}` : undefined}
            aria-label="Type a command"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setIndex(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Type a command or section…"
            autoComplete="off"
            spellCheck={false}
            className="h-12 min-w-0 flex-1 bg-transparent font-mono text-sm text-fg outline-none placeholder:text-dim"
          />
          <kbd className="rounded border border-line-strong px-1.5 py-0.5 font-mono text-[10px] text-muted">esc</kbd>
        </div>
        <ul id={listId} role="listbox" aria-label="Commands" data-lenis-prevent className="max-h-[50vh] overflow-y-auto py-2">
          {results.length === 0 && <li className="px-4 py-3 text-sm text-muted">No matching command. Try “projects” or “email”.</li>}
          {results.map((cmd, i) => (
            <li
              key={cmd.id}
              id={`${listId}-${cmd.id}`}
              role="option"
              aria-selected={i === current}
              onMouseEnter={() => setIndex(i)}
              onClick={() => runAt(i)}
              className={`mx-2 flex cursor-pointer items-center justify-between gap-4 rounded-[5px] px-3 py-2.5 text-sm ${i === current ? "bg-white/[0.06] text-fg" : "text-muted"}`}
            >
              {cmd.label}
              <span className="truncate font-mono text-[11px] text-dim">{cmd.hint}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
