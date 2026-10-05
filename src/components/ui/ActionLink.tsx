"use client";

import type { MouseEvent, ReactNode } from "react";
import { scrollToSection } from "@/lib/scroll";
import { ArrowDown, ArrowUpRight } from "./Icons";
import { Magnetic } from "./Magnetic";

interface ActionLinkProps {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost";
  /** Icon direction; in-page links default to "down". */
  direction?: "down" | "out";
  download?: boolean;
  className?: string;
  /** Command hint shown on hover, e.g. "cd ~/projects". */
  hint?: string;
}

/** Pill call-to-action. In-page anchors scroll smoothly and move focus to the target. */
export function ActionLink({ href, children, variant = "primary", direction, download, className = "", hint }: ActionLinkProps) {
  const internal = href.startsWith("#");
  const dir = direction ?? (internal ? "down" : "out");
  const external = !internal && /^https?:/.test(href);

  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!internal) return;
    event.preventDefault();
    scrollToSection(href.slice(1));
  };

  return (
    <Magnetic>
      <a
        href={href}
        onClick={onClick}
        download={download || undefined}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        data-direction={dir}
        className={`btn group ${variant === "primary" ? "btn-primary" : "btn-ghost"} ${className}`}
      >
        {hint && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-7 left-4 whitespace-nowrap font-mono text-[10px] text-muted opacity-0 transition-[opacity,transform] duration-300 group-hover:-translate-y-0.5 group-hover:opacity-100 group-focus-visible:opacity-100"
          >
            $ {hint}
          </span>
        )}
        <span>{children}</span>
        {dir === "down" ? <ArrowDown className="btn-icon" /> : <ArrowUpRight className="btn-icon" />}
        {external && <span className="sr-only"> (opens in a new tab)</span>}
      </a>
    </Magnetic>
  );
}
