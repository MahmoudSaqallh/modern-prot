"use client";

import { createContext, useContext } from "react";
import type { DeviceTier } from "@/hooks/useDeviceTier";

export interface WorldConfig {
  reduced: boolean;
  tier: DeviceTier;
}

export const WorldConfigContext = createContext<WorldConfig>({ reduced: false, tier: "high" });

export const useWorldConfig = () => useContext(WorldConfigContext);
