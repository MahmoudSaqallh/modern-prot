"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { ArrowDown, ArrowUpRight, Check, Copy, FileDown, Mail } from "lucide-react";
import { siWhatsapp } from "simple-icons";
import { bindContactRows, buildContact } from "@/animations/contact";
import { contactLinks, type ChannelId } from "@/data/contact";
import { profile } from "@/data/profile";
import { useGSAPScene } from "@/hooks/useGSAPScene";
import { scrollToSection } from "@/lib/scroll";
import { world } from "@/lib/world";
import { TechIcon } from "../ui/TechIcon";
import { StatusLine } from "./Chapter";

function LinkedInMark() {
  return (
    <span aria-hidden="true" className="grid h-[15px] w-[15px] place-items-center rounded-[3px] bg-current">
      <span className="text-[9px] font-bold leading-none text-bg">in</span>
    </span>
  );
}

function ChannelIcon({ id }: { id: ChannelId }) {
  if (id === "email") return <Mail size={16} strokeWidth={1.75} aria-hidden="true" />;
  if (id === "linkedin") return <LinkedInMark />;
  if (id === "github") return <TechIcon id="github" size={15} />;
  if (id === "whatsapp")
    return (
      <svg viewBox="0 0 24 24" width={15} height={15} fill="currentColor" aria-hidden="true">
        <path d={siWhatsapp.path} />
      </svg>
    );
  return <FileDown size={16} strokeWidth={1.75} aria-hidden="true" />;
}

/**
 * Closing scene: a link-based contact screen (no forms). Left: invitation,
 * what I'm available for, status. Right: the 3D communication node above a
 * command-style list of direct actions. Hover or focus a link and its wire
 * lights up in 3D; every action is a plain anchor that works without JS.
 */
export function Contact({ year }: { year: number }) {
  const [focus, setFocus] = useState<ChannelId | null>(null);
  const [copied, setCopied] = useState(false);
  const scope = useGSAPScene<HTMLElement>((conditions, root) => {
    const stop = buildContact(root, conditions);
    // GSAP hover motion only when motion is welcome; CSS covers focus otherwise.
    const unbind = conditions.motion ? bindContactRows(root) : undefined;
    return () => {
      stop?.();
      unbind?.();
    };
  });

  useEffect(() => {
    world.contactFocus = focus;
  }, [focus]);
  useEffect(
    () => () => {
      world.contactFocus = null;
    },
    [],
  );
  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
    } catch {
      // Clipboard unavailable (permissions / insecure context): the mailto link still works.
    }
  };

  const toTop = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    scrollToSection("home");
  };

  const focusProps = (id: ChannelId) => ({
    onMouseEnter: () => setFocus(id),
    onMouseLeave: () => setFocus(null),
    onFocus: () => setFocus(id),
    onBlur: () => setFocus(null),
  });

  return (
    <section
      ref={scope}
      id="contact"
      data-world="contact"
      data-world-anchor="top"
      data-nav="contact"
      aria-labelledby="contact-title"
      className="relative flex min-h-svh flex-col pt-28"
    >
      <div className="container-x grid flex-1 gap-x-10 gap-y-10 lg:grid-cols-12">
        {/* Mobile: the 3D node shows through this slot above the copy. */}
        <div aria-hidden="true" className="h-[34svh] lg:hidden" />

        <div className="lg:col-span-6">
          <p data-contact-copy className="eyebrow flex items-center gap-3">
            <span className="text-fg">12</span>
            <span aria-hidden="true" className="h-px w-8 bg-line-strong" />
            <span>Contact</span>
          </p>
          <h2 id="contact-title" data-contact-title className="display-lg mt-6 uppercase">
            Let&apos;s build
            <br />
            something <span className="font-serif font-normal normal-case italic tracking-normal">real.</span>
          </h2>
          <p data-contact-copy className="mt-6 max-w-md text-pretty text-lg leading-relaxed text-muted">
            Have a web, mobile, or full-stack idea? Let&apos;s turn it into a working product.
          </p>

          {profile.availableFor && (
            <div data-contact-copy className="mt-8">
              <p className="eyebrow text-[10.5px]">Available for</p>
              <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[0.9375rem] text-fg">
                {profile.availableFor.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span aria-hidden="true" className="h-1 w-1 bg-web" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {profile.availability && (
            <p data-contact-status className="mt-8 flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-fg">
              <span className="status-dot" aria-hidden="true" />
              {profile.availability}
            </p>
          )}
        </div>

        <div className="lg:col-span-5 lg:col-start-8">
          {/* Desktop: the 3D communication node shows through this slot. */}
          <div aria-hidden="true" className="relative hidden h-[300px] lg:block">
            <span className="absolute left-0 top-0 font-mono text-[10px] uppercase tracking-[0.14em] text-dim">comm.node</span>
            <span className="absolute right-0 top-0 font-mono text-[10px] uppercase tracking-[0.14em] text-dim">
              {contactLinks.length} channels
            </span>
          </div>

          <ul aria-label="Contact links" className="border-t border-line">
            {contactLinks.map((link) => {
              const down = Boolean(link.download);
              return (
                <li key={link.id} data-contact-row className="relative flex items-center">
                  <a
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                    download={link.download || undefined}
                    aria-label={link.ariaLabel}
                    {...focusProps(link.id)}
                    className="group grid min-h-[68px] flex-1 grid-cols-[auto_1fr_auto] items-center gap-4 py-3.5"
                  >
                    <span
                      data-row-icon
                      className="grid h-10 w-10 place-items-center rounded-full border border-line-strong text-muted transition-[color,border-color] duration-300 group-hover:border-web/60 group-hover:text-fg group-focus-visible:border-web/60 group-focus-visible:text-fg"
                    >
                      <ChannelIcon id={link.id} />
                    </span>
                    <span data-row-label className="min-w-0">
                      <span className="block font-mono text-[10.5px] uppercase tracking-[0.18em] text-muted">{link.label}</span>
                      <span className="block truncate text-lg font-medium tracking-tight text-fg sm:text-xl">{link.value}</span>
                    </span>
                    <span data-row-arrow data-direction={down ? "down" : "out"} className="text-muted transition-colors group-hover:text-fg">
                      {down ? <ArrowDown size={18} aria-hidden="true" /> : <ArrowUpRight size={18} aria-hidden="true" />}
                    </span>
                  </a>
                  {link.id === "email" && (
                    <button
                      type="button"
                      onClick={copyEmail}
                      className="ml-3 inline-flex h-9 flex-none items-center gap-1.5 rounded-full border border-line-strong px-3 font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted transition-colors hover:border-white/35 hover:text-fg"
                    >
                      {copied ? <Check size={13} aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />}
                      {copied ? "Copied ✓" : "Copy"}
                      <span className="sr-only">{copied ? " — email address copied" : " email address"}</span>
                    </button>
                  )}
                  {/* Divider: base line, plus an accent line drawn on hover/focus. */}
                  <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-px">
                    <span data-row-base className="absolute inset-0 bg-line" />
                    <span data-row-line className="absolute inset-0 origin-left scale-x-0 bg-web" />
                  </span>
                </li>
              );
            })}
          </ul>
          <p role="status" aria-live="polite" className="sr-only">
            {copied ? "Email address copied to clipboard" : ""}
          </p>
        </div>
      </div>

      <div className="container-x mt-16 pb-8">
        <div data-contact-final className="flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-end sm:justify-between">
          <StatusLine text={`system status: ${profile.availability ? "available" : "online"} · ready to build.`} />
          <div className="flex flex-col gap-2 font-mono text-xs text-dim sm:items-end">
            <a href="#home" onClick={toTop} className="link-underline w-fit text-muted hover:text-fg">
              Back to top ↑
            </a>
            <span>
              © {year} {profile.name}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
