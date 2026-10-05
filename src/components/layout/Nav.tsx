"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { ScrollTrigger, useGSAP } from "@/animations/gsap";
import { paletteOpen } from "./CommandPalette";
import { navItems, profile, type NavId } from "@/data/profile";
import { getLenis, scrollToSection } from "@/lib/scroll";
import { useStore } from "@/lib/store";
import { activeNav } from "@/lib/world";

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

function subscribeScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

export function Nav() {
  const active = useStore(activeNav, "home");
  const [open, setOpen] = useState(false);
  const scrolled = useSyncExternalStore(subscribeScroll, () => window.scrollY > 24, () => false);
  const links = useRef<Partial<Record<NavId, HTMLAnchorElement | null>>>({});
  const indicator = useRef<HTMLSpanElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const progress = useRef<HTMLSpanElement>(null);

  // Slide the indicator under the active link.
  useIsoLayoutEffect(() => {
    const place = () => {
      const link = links.current[active];
      const bar = indicator.current;
      if (!link || !bar) return;
      bar.style.width = `${link.offsetWidth}px`;
      bar.style.transform = `translateX(${link.offsetLeft}px)`;
      bar.style.opacity = "1";
    };
    place();
    window.addEventListener("resize", place);
    document.fonts?.ready.then(place);
    return () => window.removeEventListener("resize", place);
  }, [active]);

  // Page progress. (The active section is reported by the camera director.)
  useGSAP(() => {
    const bar = progress.current;
    if (bar) {
      ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => {
          bar.style.transform = `scaleX(${self.progress.toFixed(4)})`;
        },
      });
    }
  });

  // Mobile menu: lock scroll, focus the first link, close on Escape, restore focus.
  useEffect(() => {
    if (!open) return;
    const lenis = getLenis();
    lenis?.stop();
    document.body.style.overflow = "hidden";
    panel.current?.querySelector<HTMLElement>("a")?.focus();
    const trigger = toggle.current;
    return () => {
      lenis?.start();
      document.body.style.overflow = "";
      trigger?.focus();
    };
  }, [open]);

  const go = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    setOpen(false);
    // Let the menu close (and scroll unlock) before travelling.
    requestAnimationFrame(() => scrollToSection(id));
  };

  const onPanelKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (event.key !== "Tab" || !panel.current) return;
    const focusable = Array.from(panel.current.querySelectorAll<HTMLElement>("a, button"));
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

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500 ${
        scrolled && !open ? "border-b border-line bg-bg/70 backdrop-blur-md" : "border-b border-transparent"
      }`}
    >
      <div className="container-x flex h-16 items-center justify-between gap-6">
        <a
          href="#home"
          onClick={(event) => go(event, "home")}
          className="group flex items-center gap-3"
          aria-label={`${profile.name}, back to top`}
        >
          <span className="grid h-8 w-8 place-items-center rounded-full border border-line-strong font-mono text-[11px] tracking-tight text-fg transition-colors group-hover:border-white/40">
            {profile.initials}
          </span>
          <span className="hidden text-sm font-medium tracking-tight sm:inline">{profile.name}</span>
        </a>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="relative flex items-center gap-1">
            {navItems.map((item) => (
              <li key={item.id}>
                <a
                  ref={(el) => {
                    links.current[item.id] = el;
                  }}
                  href={`#${item.id}`}
                  onClick={(event) => go(event, item.id)}
                  aria-current={active === item.id ? "true" : undefined}
                  className={`block rounded-full px-3.5 py-2 text-[13px] transition-colors duration-300 ${
                    active === item.id ? "text-fg" : "text-muted hover:text-fg"
                  }`}
                >
                  {item.label}
                </a>
              </li>
            ))}
            <span
              ref={indicator}
              aria-hidden="true"
              className="pointer-events-none absolute bottom-0 left-0 h-px bg-fg opacity-0 transition-[transform,width] duration-500 ease-[var(--ease-out-expo)]"
            />
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => paletteOpen.set(true)}
            aria-label="Open command palette (Ctrl or Cmd + K)"
            className="hidden h-9 items-center gap-2 rounded-full border border-line-strong px-3 font-mono text-[11px] text-muted transition-colors hover:border-white/40 hover:text-fg md:flex"
          >
            <span aria-hidden="true">⌘K</span>
          </button>
          <a
            href={`mailto:${profile.email}`}
            className="hidden items-center gap-2 rounded-full border border-line-strong px-4 py-2 text-[13px] text-fg transition-colors hover:border-white/40 sm:flex"
          >
            Let&apos;s talk
          </a>
          <button
            ref={toggle}
            type="button"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
            className="relative grid h-10 w-10 place-items-center rounded-full border border-line-strong lg:hidden"
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <span
              aria-hidden="true"
              className={`absolute h-px w-4 bg-fg transition-transform duration-300 ${open ? "rotate-45" : "-translate-y-[3px]"}`}
            />
            <span
              aria-hidden="true"
              className={`absolute h-px w-4 bg-fg transition-transform duration-300 ${open ? "-rotate-45" : "translate-y-[3px]"}`}
            />
          </button>
        </div>
      </div>

      {/* Page progress. */}
      <span aria-hidden="true" className="absolute inset-x-0 bottom-[-1px] h-px overflow-hidden">
        <span ref={progress} className="block h-full origin-left scale-x-0 bg-gradient-to-r from-web via-server to-mobile" />
      </span>

      <div
        id="mobile-menu"
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        hidden={!open}
        onKeyDown={onPanelKeyDown}
        className="fixed inset-x-0 bottom-0 top-16 bg-bg lg:hidden"
      >
        <nav aria-label="Mobile" className="container-x flex h-full flex-col justify-between pb-10 pt-8">
          <ul className="grid gap-1">
            {navItems.map((item, i) => (
              <li key={item.id} className="border-b border-line">
                <a
                  href={`#${item.id}`}
                  onClick={(event) => go(event, item.id)}
                  aria-current={active === item.id ? "true" : undefined}
                  className="flex items-baseline justify-between py-4"
                >
                  <span className={`text-4xl font-semibold tracking-tight ${active === item.id ? "text-fg" : "text-muted"}`}>
                    {item.label}
                  </span>
                  <span className="font-mono text-xs text-dim">0{i + 1}</span>
                </a>
              </li>
            ))}
          </ul>
          <a href={`mailto:${profile.email}`} className="font-mono text-sm text-muted">
            {profile.email}
          </a>
        </nav>
      </div>
    </header>
  );
}
