"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { subscribeWorld, world } from "@/lib/world";

/**
 * Pauses rendering entirely while the canvas is faded out, and renders only
 * on change with reduced motion. Canvas textures repaint when fonts arrive,
 * so one more frame is requested then.
 */
export function FrameGate({ reduced }: { reduced: boolean }) {
  const setFrameloop = useThree((s) => s.setFrameloop);
  const invalidate = useThree((s) => s.invalidate);

  useEffect(() => {
    let mode = "";
    const apply = () => {
      const next = world.opacity < 0.01 ? "never" : reduced ? "demand" : "always";
      if (next !== mode) {
        mode = next;
        setFrameloop(next);
      }
      if (next === "demand") invalidate();
    };
    apply();
    const unsubscribe = subscribeWorld(apply);
    let timer = 0;
    document.fonts?.ready.then(() => {
      timer = window.setTimeout(() => invalidate(), 80);
    });
    return () => {
      unsubscribe();
      window.clearTimeout(timer);
    };
  }, [reduced, setFrameloop, invalidate]);

  return null;
}
