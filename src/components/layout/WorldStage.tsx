"use client";

import { useEffect, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { createCameraDirector } from "@/animations/camera";
import { useGSAP } from "@/animations/gsap";
import { useDeviceTier } from "@/hooks/useDeviceTier";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { sceneReady, world } from "@/lib/world";

// Three.js, R3F and every scene ship in their own chunk, loaded after hydration.
const WorldCanvas = dynamic(() => import("@/three/WorldCanvas"), { ssr: false });

let webglCache: boolean | null = null;
function detectWebGL() {
  if (webglCache !== null) return webglCache;
  try {
    const canvas = document.createElement("canvas");
    webglCache = Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    webglCache = false;
  }
  return webglCache;
}
const noopSubscribe = () => () => {};

/**
 * Fixed layer behind the page hosting the persistent 3D world, plus the
 * scroll/pointer wiring that drives it. Rendered after <main> so sections
 * exist when the camera director first measures them.
 */
export function WorldStage() {
  const reduced = useReducedMotion();
  const tier = useDeviceTier();
  const webgl = useSyncExternalStore(noopSubscribe, detectWebGL, () => null);

  // Without WebGL the page is complete on its own; release the loader.
  useEffect(() => {
    if (webgl === false) sceneReady.set(true);
  }, [webgl]);

  useGSAP(() => createCameraDirector({ stage: document.getElementById("world-stage"), reduced }), {
    dependencies: [reduced],
    revertOnUpdate: true,
  });

  useEffect(() => {
    if (reduced) {
      world.pointer.x = 0;
      world.pointer.y = 0;
      return;
    }
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      world.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      world.pointer.y = -((event.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduced]);

  return (
    <div id="world-stage" className="world-stage" aria-hidden="true">
      {webgl && <WorldCanvas reduced={reduced} tier={tier} />}
    </div>
  );
}
