"use client";

import { useMediaQuery } from "./useMediaQuery";

export type DeviceTier = "high" | "low";

/**
 * Coarse GPU budget. Touch devices and narrow viewports get the light scene:
 * capped DPR, no antialias, fewer particles, no DOM labels in 3D.
 */
export function useDeviceTier(): DeviceTier {
  const narrow = useMediaQuery("(max-width: 1023.98px)");
  const coarse = useMediaQuery("(pointer: coarse)");
  return narrow || coarse ? "low" : "high";
}
