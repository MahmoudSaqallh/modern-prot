"use client";

import { useCallback, useSyncExternalStore } from "react";
import { subscribeWorld } from "@/lib/world";

/**
 * Derive a small piece of React state from the per-frame world object.
 * `select` must return a primitive; the component re-renders only when the
 * derived value changes (e.g. which layer is active), not every frame.
 */
export function useWorldValue<T extends string | number | boolean>(select: () => T, serverValue: T): T {
  const subscribe = useCallback((onChange: () => void) => subscribeWorld(onChange), []);
  return useSyncExternalStore(subscribe, select, () => serverValue);
}
