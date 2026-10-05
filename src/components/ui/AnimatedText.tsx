"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { appReady } from "@/lib/world";

const TYPE_SPEED = 50;
const ERASE_SPEED = 30;
const PAUSE_AFTER = 3000;
const PAUSE_BEFORE = 500;
/** After the loader hands over: the core forms and the nodes activate first. */
const START_DELAY = 1300;

type Phase = "typing" | "pause-after" | "erasing" | "pause-before";

/**
 * Typewriter: types each phrase, pauses, erases, moves to the next.
 * The text and cursor nodes are created imperatively inside an element React
 * renders empty, so React never reconciles them. With reduced motion the first
 * phrase is shown without animation.
 */
export default function AnimatedText({ phrases, className = "" }: { phrases: readonly string[]; className?: string }) {
  const typewriterRef = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const typewriter = typewriterRef.current;
    if (!typewriter || phrases.length === 0) return;

    const cursor = document.createElement("span");
    cursor.className =
      "inline-block h-[0.95em] min-h-[22px] w-[3px] rounded-[1px] bg-fg align-middle ms-[5px] typewriter-cursor";
    typewriter.appendChild(cursor);

    const textNode = document.createTextNode("");
    typewriter.insertBefore(textNode, cursor);

    if (reduced) {
      textNode.textContent = phrases[0];
      return () => {
        cursor.remove();
        textNode.remove();
      };
    }

    let phraseIndex = 0;
    let charIndex = 0;
    let phase: Phase = "typing";
    let timeoutId = 0;

    const schedule = (fn: () => void, delay: number) => {
      timeoutId = window.setTimeout(fn, delay);
    };

    const tick = () => {
      const phrase = phrases[phraseIndex];

      if (phase === "typing") {
        if (charIndex < phrase.length) {
          charIndex += 1;
          textNode.textContent = phrase.substring(0, charIndex);
          schedule(tick, TYPE_SPEED);
          return;
        }
        phase = "pause-after";
        schedule(tick, PAUSE_AFTER);
        return;
      }

      if (phase === "pause-after") {
        phase = "erasing";
        schedule(tick, 0);
        return;
      }

      if (phase === "erasing") {
        if (charIndex > 0) {
          charIndex -= 1;
          textNode.textContent = phrase.substring(0, charIndex);
          schedule(tick, ERASE_SPEED);
          return;
        }
        phase = "pause-before";
        schedule(tick, PAUSE_BEFORE);
        return;
      }

      phraseIndex = (phraseIndex + 1) % phrases.length;
      phase = "typing";
      schedule(tick, 0);
    };

    let unsubscribe = () => {};
    if (appReady.get()) schedule(tick, START_DELAY);
    else {
      unsubscribe = appReady.subscribe(() => {
        if (!appReady.get()) return;
        unsubscribe();
        schedule(tick, START_DELAY);
      });
    }

    return () => {
      unsubscribe();
      window.clearTimeout(timeoutId);
      if (cursor.parentNode === typewriter) typewriter.removeChild(cursor);
      if (textNode.parentNode === typewriter) typewriter.removeChild(textNode);
    };
  }, [phrases, reduced]);

  return (
    <span className={`block ${className}`}>
      <span ref={typewriterRef} className="inline text-fg" />
    </span>
  );
}
