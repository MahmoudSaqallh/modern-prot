"use client";

import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface Slide {
  src: string;
  caption: string;
}

interface ImageSliderProps {
  slides: readonly Slide[];
  /** Project name, used in the accessible labels. */
  label: string;
  sizes: string;
  /** Smaller controls for cards; larger, swipeable view for the project detail. */
  size?: "card" | "full";
}

/**
 * Screenshot slider: the track slides between screens (instant with reduced
 * motion). Arrows, dots, ←/→ keys and swipe all move it; the current caption
 * is announced politely. Controls sit above a card's stretched link (z-[3]).
 */
export function ImageSlider({ slides, label, sizes, size = "card" }: ImageSliderProps) {
  const [index, setIndex] = useState(0);
  const swipeFrom = useRef<number | null>(null);
  const count = slides.length;
  const go = (next: number) => setIndex((next + count) % count);
  const full = size === "full";

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowLeft") go(index - 1);
    else if (event.key === "ArrowRight") go(index + 1);
    else return;
    event.preventDefault();
  };
  const onPointerDown = (event: PointerEvent) => {
    swipeFrom.current = event.clientX;
  };
  const onPointerUp = (event: PointerEvent) => {
    if (swipeFrom.current === null) return;
    const dx = event.clientX - swipeFrom.current;
    swipeFrom.current = null;
    if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
  };

  const arrow = `absolute top-1/2 z-[3] grid -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-bg/70 text-fg backdrop-blur-sm transition-[background-color,border-color,opacity] duration-300 hover:border-white/40 hover:bg-bg/90 ${
    full ? "h-10 w-10" : "h-8 w-8 opacity-0 group-hover/card:opacity-100 focus-visible:opacity-100"
  }`;

  return (
    <div
      role="group"
      aria-roledescription="carousel"
      aria-label={`${label} screenshots`}
      onKeyDown={onKeyDown}
      className="absolute inset-0 overflow-hidden"
    >
      <div
        onPointerDown={full ? onPointerDown : undefined}
        onPointerUp={full ? onPointerUp : undefined}
        onPointerCancel={() => (swipeFrom.current = null)}
        className={`flex h-full transition-transform duration-700 ease-[var(--ease-out-expo)] motion-reduce:transition-none ${full ? "touch-pan-y" : ""}`}
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((slide, i) => (
          <div
            key={slide.src}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}: ${slide.caption}`}
            aria-hidden={i !== index}
            className="relative h-full w-full flex-none"
          >
            <Image src={slide.src} alt={slide.caption} fill sizes={sizes} draggable={false} className="select-none object-cover object-top" />
          </div>
        ))}
      </div>

      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-bg/75 to-transparent" />

      <button type="button" onClick={() => go(index - 1)} aria-label="Previous screenshot" className={`${arrow} left-2.5`}>
        <ChevronLeft size={full ? 18 : 15} aria-hidden="true" />
      </button>
      <button type="button" onClick={() => go(index + 1)} aria-label="Next screenshot" className={`${arrow} right-2.5`}>
        <ChevronRight size={full ? 18 : 15} aria-hidden="true" />
      </button>

      <div className={`absolute inset-x-0 bottom-0 z-[3] flex items-center justify-between gap-3 ${full ? "px-4 pb-3" : "px-3 pb-2"}`}>
        <p className={`truncate font-mono uppercase tracking-[0.12em] text-fg/85 ${full ? "text-[11px]" : "text-[9.5px]"}`}>
          <span className="text-dim">{String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}</span> {slides[index].caption}
        </p>
        <div className="flex flex-none items-center">
          {slides.map((slide, i) => (
            <button
              key={slide.src}
              type="button"
              onClick={() => go(i)}
              aria-label={`Show screenshot ${i + 1}: ${slide.caption}`}
              aria-current={i === index}
              className="grid h-6 w-5 place-items-center"
            >
              <span
                className={`block h-1.5 rounded-full transition-[width,background-color] duration-300 ${i === index ? "w-3.5 bg-fg" : "w-1.5 bg-white/35"}`}
              />
            </button>
          ))}
        </div>
      </div>

      <p aria-live="polite" className="sr-only">
        Screenshot {index + 1} of {count}: {slides[index].caption}
      </p>
    </div>
  );
}
