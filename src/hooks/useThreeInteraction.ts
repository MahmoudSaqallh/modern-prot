"use client";

import { useCallback } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import { sceneCursor } from "@/lib/world";

type Hover = (event: ThreeEvent<PointerEvent>) => void;

/**
 * Raycast hover wiring for 3D objects: returns a binder that produces
 * onPointerOver / onPointerOut handlers for a key. Hovering stops propagation
 * (the nearest object wins) and switches the cursor to its interactive state.
 */
export function useThreeInteraction<K extends string>(onChange: (key: K | null) => void, cursor: "interactive" | "drag" = "interactive") {
  return useCallback(
    (key: K): { onPointerOver: Hover; onPointerOut: Hover } => ({
      onPointerOver: (event) => {
        event.stopPropagation();
        onChange(key);
        sceneCursor.set(cursor);
      },
      onPointerOut: () => {
        onChange(null);
        sceneCursor.set("default");
      },
    }),
    [onChange, cursor],
  );
}
