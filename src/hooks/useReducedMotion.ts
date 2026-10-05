"use client";

import { useMediaQuery } from "./useMediaQuery";

export function useReducedMotion() {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

/** Desktop pointer that can hover precisely: enables cursor and magnetic effects. */
export function useFinePointer() {
  return useMediaQuery("(hover: hover) and (pointer: fine)");
}
