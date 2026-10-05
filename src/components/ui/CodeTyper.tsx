"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { codeSnippets } from "@/data/architecture";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { SYNTAX_COLORS, tokenize } from "@/lib/syntax";
import { TechIcon } from "./TechIcon";

const CPS = 42;
const PAUSE_MS = 2600;

/**
 * Editor that types real snippets (React, Express, MongoDB, Flutter) with
 * syntax highlighting, a moving cursor and an active-line highlight, then
 * moves to the next file. Runs only while visible; instant with reduced motion.
 */
export function CodeTyper() {
  const reduced = useReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState(0);
  const [progress, setProgress] = useState({ tab: 0, n: 0 });
  const [visible, setVisible] = useState(false);
  const [manual, setManual] = useState(false);

  const snippet = codeSnippets[tab];
  const total = useMemo(() => snippet.lines.reduce((sum, l) => sum + l.length + 1, 0), [snippet]);
  const shown = reduced ? total : progress.tab === tab ? progress.n : 0;

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Type the current file, pause, then advance (unless the visitor picked a tab).
  useEffect(() => {
    if (reduced || !visible) return;
    let n = 0;
    let timer = 0;
    const step = () => {
      n = Math.min(total, n + 2);
      setProgress({ tab, n });
      if (n < total) {
        timer = window.setTimeout(step, 2000 / CPS);
      } else if (!manual) {
        timer = window.setTimeout(() => setTab((t) => (t + 1) % codeSnippets.length), PAUSE_MS);
      }
    };
    timer = window.setTimeout(step, 250);
    return () => window.clearTimeout(timer);
  }, [tab, visible, reduced, total, manual]);

  // Split the typed budget across lines; the cursor sits on the last line reached.
  const rendered: string[] = [];
  let remaining = shown;
  let activeLine = 0;
  for (let i = 0; i < snippet.lines.length; i++) {
    const line = snippet.lines[i];
    if (remaining >= 0) activeLine = i;
    rendered.push(line.slice(0, Math.max(0, Math.min(line.length, remaining))));
    remaining -= line.length + 1;
  }

  return (
    <div ref={root} data-cursor="code" className="overflow-hidden rounded-md border border-line-strong bg-[#0a0c0f] shadow-[0_40px_80px_-40px_rgb(0_0_0/0.9)]">
      <div role="tablist" aria-label="Code samples" className="flex overflow-x-auto border-b border-line [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {codeSnippets.map((s, i) => (
          <button
            key={s.id}
            role="tab"
            type="button"
            aria-selected={i === tab}
            onClick={() => {
              setManual(true);
              setTab(i);
            }}
            className={`flex flex-none items-center gap-2 border-r border-line px-4 py-2.5 font-mono text-[12px] transition-colors ${
              i === tab ? "bg-white/[0.04] text-fg" : "text-muted hover:text-fg"
            }`}
          >
            <TechIcon id={s.tech} size={13} />
            {s.file}
          </button>
        ))}
      </div>

      <div className="relative min-h-[15.5rem] py-4 font-mono text-[12.5px] leading-[1.75] sm:text-[13px]">
        <pre className="sr-only">{snippet.lines.join("\n")}</pre>
        <div aria-hidden="true">
          {snippet.lines.map((line, i) => {
            const text = rendered[i];
            const isActive = i === activeLine;
            return (
              <div key={`${snippet.id}-${i}`} className={`flex pr-4 transition-colors ${isActive ? "bg-web/[0.06]" : ""}`}>
                <span className={`w-10 flex-none select-none pr-3 text-right ${isActive ? "text-muted" : "text-dim/70"}`}>{i + 1}</span>
                <span className="whitespace-pre">
                  {tokenize(text).map((token, k) => (
                    <span key={k} style={{ color: SYNTAX_COLORS[token.kind] }}>
                      {token.text}
                    </span>
                  ))}
                  {isActive && <span className="code-caret ml-px inline-block h-[1.1em] w-[0.55em] translate-y-[3px] bg-web/80" />}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-line px-4 py-2 font-mono text-[11px] text-muted">
        <span>{snippet.label}</span>
        <span className="text-server">{shown >= total ? "✓ compiled" : "typing…"}</span>
      </div>
    </div>
  );
}
