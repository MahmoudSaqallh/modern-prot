"use client";

import { useCallback, useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { buildTerminal } from "@/animations/terminal";
import { experience } from "@/data/experience";
import { profile } from "@/data/profile";
import { projects } from "@/data/projects";
import { useGSAPScene } from "@/hooks/useGSAPScene";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { scrollToSection } from "@/lib/scroll";
import { ChapterHeading } from "../ui/ChapterHeading";

interface Line {
  id: number;
  kind: "input" | "output" | "error";
  rows: string[];
  links?: { label: string; href: string; download?: boolean }[];
}

interface Result {
  rows: string[];
  links?: Line["links"];
  go?: string;
}

const SUGGESTIONS = ["whoami", "stack", "skills", "projects", "contact"];
const MAX_LINES = 60;

const COMMANDS: Record<string, { summary: string; run: () => Result }> = {
  whoami: { summary: "Who is this?", run: () => ({ rows: ["Full Stack MERN + Flutter Developer", profile.message] }) },
  stack: { summary: "Core technologies", run: () => ({ rows: ["React", "Next.js", "Node.js", "Express", "MongoDB", "Flutter", "Dart"] }) },
  skills: {
    summary: "Skills by discipline",
    run: () => ({
      rows: [
        "frontend   React · Next.js · TypeScript · Tailwind · GSAP · Three.js",
        "backend    Node.js · Express · MongoDB · REST · Socket.IO",
        "mobile     Flutter · Dart · Android",
        "tools      Git · GitHub · Postman · Figma",
      ],
    }),
  },
  projects: {
    summary: "Open projects",
    run: () => ({ rows: [...projects.map((p) => `${p.title.padEnd(18)}${p.type}`), "Opening projects..."], go: "projects" }),
  },
  experience: { summary: "Roles", run: () => ({ rows: experience.map((e) => `${e.period.padEnd(16)}${e.role} — ${e.company}`) }) },
  contact: { summary: "Open contact", run: () => ({ rows: [`→ Opening contact… ${profile.email}`], go: "contact" }) },
  cv: { summary: "Download CV", run: () => ({ rows: ["Curriculum vitae (PDF):"], links: [{ label: profile.cvUrl, href: profile.cvUrl, download: true }] }) },
  socials: {
    summary: "GitHub and LinkedIn",
    run: () => ({ rows: ["Elsewhere:"], links: [{ label: profile.github, href: profile.github }, { label: profile.linkedin, href: profile.linkedin }] }),
  },
  help: {
    summary: "List commands",
    run: () => ({ rows: [...Object.entries(COMMANDS).map(([name, c]) => `${name.padEnd(12)}${c.summary}`), `${"clear".padEnd(12)}Clear the screen`] }),
  },
};

const ALIASES: Record<string, string> = { ls: "help", "sudo hire-me": "contact", work: "projects" };

const WELCOME: Line[] = [{ id: 0, kind: "output", rows: [`portfolio — ${profile.specialty}`, 'Type a command, or try "whoami".'] }];

/** Output rows typed out character by character (instant with reduced motion). */
function Typed({ rows, onProgress }: { rows: string[]; onProgress: () => void }) {
  const reduced = useReducedMotion();
  const full = rows.join("\n");
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (reduced) return;
    let n = 0;
    const timer = window.setInterval(() => {
      n = Math.min(full.length, n + 3);
      setCount(n);
      onProgress();
      if (n >= full.length) window.clearInterval(timer);
    }, 16);
    return () => window.clearInterval(timer);
  }, [full, reduced, onProgress]);

  const shown = reduced ? full : full.slice(0, count);
  return (
    <>
      <span className="sr-only">{full}</span>
      <span aria-hidden="true" className="whitespace-pre-wrap">
        {shown}
        {!reduced && count < full.length && <span className="ml-px inline-block h-[1em] w-[0.5em] translate-y-[2px] bg-muted" />}
      </span>
    </>
  );
}

export function Console() {
  const scope = useGSAPScene<HTMLElement>((conditions, root) => buildTerminal(root, conditions));

  const [lines, setLines] = useState<Line[]>(WELCOME);
  const [value, setValue] = useState("");
  const history = useRef<string[]>([]);
  const cursor = useRef(-1);
  const nextId = useRef(1);
  const output = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const inputId = useId();

  const stickToBottom = useCallback(() => {
    const el = output.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(stickToBottom, [lines, stickToBottom]);

  const run = (raw: string) => {
    const command = raw.trim().toLowerCase();
    if (!command) return;
    history.current = [raw.trim(), ...history.current].slice(0, 30);
    cursor.current = -1;
    if (command === "clear") {
      setLines([]);
      return;
    }
    const match = COMMANDS[ALIASES[command] ?? command];
    const result = match?.run();
    const id = nextId.current;
    nextId.current += 2;
    const reply: Line = result
      ? { id: id + 1, kind: "output", rows: result.rows, links: result.links }
      : { id: id + 1, kind: "error", rows: [`command not found: ${command} — type "help"`] };
    setLines((prev) => [...prev, { id, kind: "input" as const, rows: [raw.trim()] }, reply].slice(-MAX_LINES));
    if (result?.go) {
      const target = result.go;
      window.setTimeout(() => scrollToSection(target), 700);
    }
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    run(value);
    setValue("");
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
    event.preventDefault();
    const list = history.current;
    if (!list.length) return;
    cursor.current = event.key === "ArrowUp" ? Math.min(list.length - 1, cursor.current + 1) : Math.max(-1, cursor.current - 1);
    setValue(cursor.current === -1 ? "" : list[cursor.current]);
  };

  return (
    <section ref={scope} id="terminal" data-world="terminal" data-nav="experience" aria-labelledby="console-title" className="relative py-24 lg:py-32">
      <div className="container-x grid items-start gap-12 lg:grid-cols-12 lg:gap-8">
        <ChapterHeading id="console-title" index="11" label="Terminal" title="Prefer the command line?" className="lg:col-span-4">
          An optional shortcut through this site. Try <code className="font-mono text-fg">whoami</code> or{" "}
          <code className="font-mono text-fg">stack</code>.
        </ChapterHeading>

        <div
          data-terminal
          data-cursor="code"
          className="terminal-3d overflow-hidden rounded-md border border-line-strong bg-[#0a0c0f] shadow-[0_40px_80px_-40px_rgb(0_0_0/0.9)] lg:col-span-7 lg:col-start-6"
        >
          <div className="flex items-center gap-2 border-b border-line px-4 py-3">
            <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <span className="ml-3 font-mono text-xs text-dim">guest@portfolio: ~</span>
          </div>

          <div
            ref={output}
            role="log"
            aria-live="polite"
            aria-label="Terminal output"
            data-lenis-prevent
            className="terminal-output h-72 overflow-y-auto overscroll-contain px-4 py-4 font-mono text-[13px] leading-relaxed text-muted sm:h-80"
          >
            {lines.map((line) => (
              <div key={line.id} className={line.kind === "error" ? "text-[#f08a6c]" : undefined}>
                {line.kind === "input" ? (
                  <span className="text-fg">
                    <span className="text-server" aria-hidden="true">
                      ❯{" "}
                    </span>
                    {line.rows[0]}
                  </span>
                ) : (
                  <>
                    <Typed rows={line.rows} onProgress={stickToBottom} />
                    {line.links?.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        download={link.download || undefined}
                        target={link.download ? undefined : "_blank"}
                        rel={link.download ? undefined : "noopener noreferrer"}
                        className="block w-fit"
                      >
                        {link.label}
                      </a>
                    ))}
                  </>
                )}
              </div>
            ))}
          </div>

          <form
            onSubmit={onSubmit}
            className="flex items-center gap-2 border-t border-line px-4 py-3 font-mono text-[13px] transition-shadow has-[input:focus-visible]:shadow-[inset_0_0_0_1px_var(--color-web)]"
          >
            <label htmlFor={inputId} className="sr-only">
              Terminal command
            </label>
            <span aria-hidden="true" className="text-server">
              ❯
            </span>
            <input
              ref={input}
              id={inputId}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              onKeyDown={onKeyDown}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              placeholder="whoami"
              className="min-w-0 flex-1 bg-transparent text-fg caret-web outline-none placeholder:text-dim"
            />
            <button type="submit" className="rounded px-2 py-1 text-xs uppercase tracking-[0.12em] text-muted hover:text-fg">
              Run
            </button>
          </form>

          <div className="flex flex-wrap gap-2 border-t border-line px-4 py-3">
            {SUGGESTIONS.map((cmd) => (
              <button
                key={cmd}
                type="button"
                onClick={() => run(cmd)}
                className="rounded-full border border-line-strong px-3 py-1 font-mono text-xs text-muted transition-colors hover:border-white/30 hover:text-fg"
              >
                {cmd}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
