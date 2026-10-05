"use client";

import { useEffect, useState } from "react";
import { Play } from "lucide-react";
import { buildChapter } from "@/animations/sections";
import { collections } from "@/data/architecture";
import { useGSAPScene } from "@/hooks/useGSAPScene";
import { world } from "@/lib/world";
import { ChapterHeading } from "../ui/ChapterHeading";
import { TechIcon } from "../ui/TechIcon";
import { Chapter, StatusLine } from "./Chapter";

const QUERY: Record<string, string> = {
  users: 'db.users.find({ role: "customer" })',
  projects: 'db.projects.find({ status: "live" })',
  orders: 'db.orders.find({ status: "delivered" })',
  messages: 'db.messages.find({ room: "order:4821" })',
};

const RELATIONS = ["orders.userId → users._id", "messages.room → orders", "projects.ownerId → users._id"];

export function DatabaseSection() {
  const scope = useGSAPScene<HTMLElement>((conditions, root) => buildChapter(root, conditions, "mask"));
  const [selected, setSelected] = useState("projects");

  useEffect(() => {
    world.collection = selected;
  }, [selected]);

  const run = () => {
    world.collection = selected;
    world.queryId += 1;
  };

  const doc = collections.find((c) => c.name === selected) ?? collections[0];

  return (
    <Chapter ref={scope} world="database" nav="stack" labelledBy="database-title" side="left">
      <ChapterHeading id="database-title" index="04" label="Database" title="Data shaped by how it is read.">
        MongoDB collections designed around real queries: indexed fields, references between documents, and
        aggregation where the UI needs summaries.
      </ChapterHeading>
      <StatusLine text="mongosh · connected to portfolio · 4 collections" />

      <div data-cascade className="mt-8 overflow-hidden rounded-md border border-line-strong bg-[#0a0c0f]" data-cursor="code">
        <div className="flex items-center gap-3 border-b border-line px-4 py-2.5">
          <TechIcon id="mongodb" size={15} colored />
          <span className="font-mono text-[13px] text-fg">portfolio</span>
        </div>
        <div className="grid gap-3 p-4 sm:grid-cols-[9rem_1fr]">
          <ul aria-label="Collections" className="grid content-start gap-1">
            {collections.map((c) => (
              <li key={c.name}>
                <button
                  type="button"
                  aria-pressed={c.name === selected}
                  onClick={() => setSelected(c.name)}
                  className={`flex w-full items-center justify-between rounded-[4px] px-2.5 py-1.5 font-mono text-[12px] transition-colors ${
                    c.name === selected ? "bg-data/10 text-fg" : "text-muted hover:bg-white/[0.04] hover:text-fg"
                  }`}
                >
                  {c.name}
                  <span className="text-[10px] text-dim">{c.count.toLocaleString("en-US")}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="min-w-0 font-mono text-[12px] leading-relaxed">
            <div className="flex items-center justify-between gap-2">
              <code className="truncate text-fg">{QUERY[selected]}</code>
              <button
                type="button"
                onClick={run}
                className="flex flex-none items-center gap-1.5 rounded-full border border-line-strong px-2.5 py-1 text-[11px] text-fg hover:border-white/40"
              >
                <Play size={11} aria-hidden="true" /> Run
              </button>
            </div>
            <div className="mt-3 rounded-[4px] border border-line bg-bg/60 p-3">
              <p className="text-muted">{"{"}</p>
              {Object.entries(doc.sample).map(([key, value]) => (
                <p key={key} className="truncate pl-3">
                  <span className="text-web">{key}</span>
                  <span className="text-muted">: </span>
                  <span className="text-data">{value}</span>
                </p>
              ))}
              <p className="text-muted">{"}"}</p>
            </div>
          </div>
        </div>
      </div>

      <ul aria-label="Relationships" className="mt-6 grid gap-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-muted">
        {RELATIONS.map((r) => (
          <li key={r} data-cascade className="flex items-center gap-2">
            <span aria-hidden="true" className="h-px w-4 border-t border-dashed border-data/60" />
            {r}
          </li>
        ))}
      </ul>
    </Chapter>
  );
}
