"use client";

import type { ReactNode } from "react";
import { useWorldValue } from "@/hooks/useWorldValue";
import { world } from "@/lib/world";

/**
 * Mounts its children only while the camera is near a station. Used for
 * effects that render every frame on their own (e.g. contact shadows), so
 * they cost nothing elsewhere. Re-renders only when crossing the boundary.
 */
export function NearStation({ index, range = 0.95, children }: { index: number; range?: number; children: ReactNode }) {
  const near = useWorldValue(() => Math.abs(world.g - index) < range, false);
  return near ? <>{children}</> : null;
}
