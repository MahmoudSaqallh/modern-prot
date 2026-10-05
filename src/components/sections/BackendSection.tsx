"use client";

import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";
import { buildChapter } from "@/animations/sections";
import type { TechId } from "@/data/technologies";
import { techById } from "@/data/technologies";
import { useGSAPScene } from "@/hooks/useGSAPScene";
import { world } from "@/lib/world";
import { ChapterHeading } from "../ui/ChapterHeading";
import { TechIcon } from "../ui/TechIcon";
import { Chapter, StatusLine } from "./Chapter";

const CAPABILITIES: { id: string; name: string; detail: string; nodes: string[] }[] = [
  { id: "rest", name: "REST APIs", detail: "Versioned resources, validation and consistent error shapes.", nodes: ["api", "node"] },
  { id: "authn", name: "Authentication", detail: "JWT access + refresh tokens and httpOnly cookies.", nodes: ["auth", "api"] },
  { id: "authz", name: "Authorization", detail: "Role and ownership checks in Express middleware.", nodes: ["auth", "express"] },
  { id: "routing", name: "Routing & middleware", detail: "Layered Express routers, rate limits, request logging.", nodes: ["express", "node"] },
  { id: "data", name: "Data access", detail: "Indexed MongoDB queries returning only what the UI needs.", nodes: ["mongodb", "express"] },
  { id: "realtime", name: "Realtime", detail: "Socket.IO events pushed to web and mobile clients.", nodes: ["node", "client"] },
];

const STACK: TechId[] = ["node", "express", "mongodb", "rest", "socketio", "postman"];

type LogLine = { id: number; text: string; tone: "out" | "in" | "muted" };

export function BackendSection() {
  const scope = useGSAPScene<HTMLElement>((conditions, root) => buildChapter(root, conditions, "clip"));
  const [hovered, setHovered] = useState<string | null>(null);
  const [log, setLog] = useState<LogLine[]>([{ id: 0, text: "Ready. Press “Send request”.", tone: "muted" }]);
  const [pending, setPending] = useState(false);
  const timers = useRef<number[]>([]);
  const nextId = useRef(1);
  const active = CAPABILITIES.find((c) => c.id === hovered) ?? null;

  useEffect(() => {
    world.backendFocus = active ? active.nodes : [];
  }, [active]);
  useEffect(
    () => () => {
      world.backendFocus = [];
      timers.current.forEach(window.clearTimeout);
    },
    [],
  );

  const push = (text: string, tone: LogLine["tone"]) => {
    const id = nextId.current++;
    setLog((prev) => [...prev, { id, text, tone }].slice(-4));
  };

  const send = () => {
    if (pending) return;
    setPending(true);
    world.requestId += 1;
    push("→ GET /api/projects  Authorization: Bearer …", "out");
    // Timings mirror the 3D request (6 hops out, 4 back).
    timers.current.push(window.setTimeout(() => push("  auth ok · db.projects.find({ status: \"live\" })", "muted"), 1900));
    timers.current.push(
      window.setTimeout(() => {
        push("← 200 OK · 48 ms · 2 items", "in");
        setPending(false);
      }, 4400),
    );
  };

  return (
    <Chapter ref={scope} world="backend" nav="stack" labelledBy="backend-title" side="right" id="backend">
      <ChapterHeading id="backend-title" index="03" label="Backend" title="The system behind the screen.">
        Node.js and Express APIs with authentication, permissions and data access handled on the server. Send a request
        and follow it through the architecture.
      </ChapterHeading>
      <StatusLine text="node server.js · listening on :8080 · mongodb connected" />

      <div data-cascade className="mt-8 overflow-hidden rounded-md border border-line-strong bg-[#0a0c0f]" data-cursor="code">
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5">
          <p className="flex items-center gap-2 font-mono text-[13px]">
            <span className="rounded-[3px] bg-server/15 px-1.5 py-0.5 text-[11px] font-semibold text-server">GET</span>
            <span className="text-fg">/api/projects</span>
          </p>
          <button
            type="button"
            onClick={send}
            disabled={pending}
            className="flex items-center gap-2 rounded-full border border-line-strong px-3 py-1.5 text-xs text-fg transition-colors hover:border-white/40 disabled:opacity-50"
          >
            <Play size={12} aria-hidden="true" /> {pending ? "Sending…" : "Send request"}
          </button>
        </div>
        <ol role="log" aria-live="polite" aria-label="Request log" className="min-h-[7.5rem] px-4 py-3 font-mono text-[12px] leading-relaxed">
          {log.map((line) => (
            <li key={line.id} className={line.tone === "in" ? "text-server" : line.tone === "out" ? "text-web" : "text-muted"}>
              {line.text}
            </li>
          ))}
        </ol>
      </div>

      <ul className="mt-6 grid border-t border-line sm:grid-cols-2 sm:gap-x-6" onMouseLeave={() => setHovered(null)}>
        {CAPABILITIES.map((cap) => (
          <li key={cap.id} data-cascade className="border-b border-line">
            <button
              type="button"
              onMouseEnter={() => setHovered(cap.id)}
              onFocus={() => setHovered(cap.id)}
              onBlur={() => setHovered(null)}
              className="flex w-full items-center justify-between gap-3 py-2.5 text-left text-[0.9375rem]"
            >
              <span className={`transition-colors duration-300 ${hovered === cap.id ? "text-fg" : "text-muted"}`}>{cap.name}</span>
              <span className="sr-only">: {cap.detail}</span>
              <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full transition-colors ${hovered === cap.id ? "bg-server" : "bg-line-strong"}`} />
            </button>
          </li>
        ))}
      </ul>
      <p aria-hidden="true" className="mt-3 min-h-[2.5rem] text-sm leading-relaxed text-muted">
        {active ? active.detail : "Hover a capability to light the nodes that handle it."}
      </p>

      <ul aria-label="Backend stack" className="mt-4 flex flex-wrap gap-3 text-muted">
        {STACK.map((id) => (
          <li key={id} data-cascade className="flex items-center gap-1.5 text-xs">
            <TechIcon id={id} size={14} />
            {techById[id].name}
          </li>
        ))}
      </ul>
    </Chapter>
  );
}
