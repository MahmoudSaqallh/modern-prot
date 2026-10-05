"use client";

import { useState } from "react";
import Image from "next/image";
import { profile } from "@/data/profile";
import { techById, type TechId } from "@/data/technologies";
import { TechIcon } from "./TechIcon";

const STACK: TechId[] = ["react", "nextjs", "node", "express", "mongodb", "flutter", "dart"];

/**
 * Secondary portrait for the programmer intro. The photo is shown as-is
 * (object-fit cover, focused on the face); only the presentation is styled:
 * a technical grid behind, corner marks, a soft edge falloff into the page,
 * and the stack wired in underneath. `data-*` hooks drive the GSAP reveal
 * and the pointer depth.
 */
export function PortraitPanel({ className = "" }: { className?: string }) {
  // A missing photo falls back to the monogram instead of a broken image.
  const [failed, setFailed] = useState(false);
  if (!profile.avatar) return null;

  return (
    <figure data-portrait className={`relative ${className}`}>
      {/* Grid plate offset behind the photo. */}
      <div aria-hidden="true" data-depth="4" className="absolute -inset-3 translate-x-4 translate-y-4 rounded-md border border-line">
        <div className="tech-grid absolute inset-0 rounded-md opacity-80" />
      </div>

      <div data-depth="12" className="relative">
        <div data-portrait-frame className="relative aspect-[4/5] overflow-hidden rounded-md border border-line-strong bg-bg-elev">
          {failed ? (
            <span role="img" aria-label={`Portrait of ${profile.name}`} className="absolute inset-0 grid place-items-center text-6xl font-semibold tracking-tight text-fg/80">
              {profile.initials}
            </span>
          ) : (
            <Image
              data-portrait-image
              src={encodeURI(profile.avatar)}
              alt={`Portrait of ${profile.name}`}
              fill
              sizes="(min-width: 1024px) 300px, (min-width: 640px) 45vw, 60vw"
              className="object-cover object-[50%_32%]"
              onError={() => setFailed(true)}
            />
          )}
          {/* Presentation only: edges fall off into the dark page; the face is untouched. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 85% 75% at 50% 38%, transparent 55%, rgb(8 9 12 / 0.55) 100%), linear-gradient(to top, rgb(8 9 12 / 0.85), transparent 32%)",
            }}
          />
          {/* Corner marks, like a viewport or a capture frame. */}
          {["left-2 top-2 border-l border-t", "right-2 top-2 border-r border-t", "bottom-2 left-2 border-b border-l", "bottom-2 right-2 border-b border-r"].map((pos) => (
            <span key={pos} aria-hidden="true" className={`absolute h-3.5 w-3.5 border-web/70 ${pos}`} />
          ))}
          <span aria-hidden="true" className="absolute left-4 top-3.5 font-mono text-[10px] uppercase tracking-[0.14em] text-fg/80">
            ● dev.identity
          </span>
          <figcaption className="absolute inset-x-0 bottom-0 p-4">
            <span className="block text-[0.9375rem] font-semibold tracking-tight text-fg">{profile.name}</span>
            <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Full Stack · MERN · Flutter</span>
          </figcaption>
        </div>

        {/* The stack, wired to the portrait. */}
        <div data-portrait-stack className="relative mt-3 flex items-center gap-1.5">
          <span aria-hidden="true" className="absolute left-0 right-0 top-1/2 h-px bg-line-strong" />
          {STACK.map((id) => (
            <span
              key={id}
              title={techById[id].name}
              className="relative grid h-7 w-7 place-items-center rounded-full border border-line-strong bg-bg text-muted"
            >
              <TechIcon id={id} size={12} title={techById[id].name} />
            </span>
          ))}
        </div>
      </div>
    </figure>
  );
}
