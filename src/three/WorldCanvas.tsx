"use client";

import { lazy, Suspense, useMemo, useRef, useState } from "react";
import { PerformanceMonitor } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { sceneReady } from "@/lib/world";
import { ServerGraph } from "./MernArchitecture/ServerGraph";
import { CodeField } from "./CodeScene/CodeField";
import { DataScene } from "./DatabaseScene/DataScene";
import { CommNode } from "./ContactScene/CommNode";
import { DeveloperCore } from "./DeveloperCore/DeveloperCore";
import { FlutterScene } from "./FlutterScene/FlutterScene";
import { BrowserScene } from "./FrontendScene/BrowserScene";
import { ProjectPanels } from "./ProjectsScene/ProjectPanels";
import { Atmosphere } from "./BackgroundScene/Atmosphere";
import { Backdrop } from "./BackgroundScene/Backdrop";
import { Lighting } from "./Lighting/Lighting";
import { CameraRig } from "./shared/CameraRig";
import { WorldConfigContext, type WorldConfig } from "./shared/config";
import { FrameGate } from "./shared/FrameGate";
import { TechUniverse } from "./TechUniverse/TechUniverse";

// Post-processing is only loaded where it will run.
const Effects = lazy(() => import("./shared/Effects"));

const BG = "#08090c";

/**
 * The persistent 3D world: one WebGL context for the whole page. Each chapter
 * is a scene placed along the camera's path; scenes hide themselves away
 * from their station, and rendering pauses whenever the canvas is faded out.
 * Pointer events are sourced from <body> so raycasting works beneath the DOM.
 */
export default function WorldCanvas({ reduced, tier }: WorldConfig) {
  const maxDpr = tier === "high" ? 1.75 : 1.25;
  const [dpr, setDpr] = useState(maxDpr);
  const [effects, setEffects] = useState(tier === "high");
  const config = useMemo(() => ({ reduced, tier }), [reduced, tier]);
  const eventSource = useMemo(() => (typeof document === "undefined" ? undefined : document.body), []);

  return (
    <Canvas
      dpr={Math.min(dpr, maxDpr)}
      gl={{ antialias: tier === "high", powerPreference: "high-performance", alpha: false, stencil: false }}
      camera={{ fov: 40, near: 0.1, far: 140, position: [0, 1, 17] }}
      frameloop={reduced ? "demand" : "always"}
      eventSource={eventSource}
      eventPrefix="client"
    >
      <WorldConfigContext value={config}>
        <color attach="background" args={[BG]} />
        <fog attach="fog" args={[BG, 14, 50]} />
        <FrameGate reduced={reduced} />
        <FirstFrame />
        <CameraRig />
        <Lighting />
        <Backdrop />
        <Atmosphere />
        <Suspense fallback={null}>
          <DeveloperCore />
          <CodeField />
          <BrowserScene />
          <ServerGraph />
          <DataScene />
          <FlutterScene />
          <TechUniverse />
          <ProjectPanels />
          <CommNode />
        </Suspense>
        {tier === "high" && effects && (
          <Suspense fallback={null}>
            <Effects />
          </Suspense>
        )}
        <PerformanceMonitor
          flipflops={3}
          onDecline={() => setDpr(1)}
          onIncline={() => setDpr(maxDpr)}
          onFallback={() => {
            setDpr(1);
            setEffects(false);
          }}
        />
      </WorldConfigContext>
    </Canvas>
  );
}

/** Signals the loader once the first frame has been drawn. */
function FirstFrame() {
  const done = useRef(false);
  useFrame(() => {
    if (done.current) return;
    done.current = true;
    requestAnimationFrame(() => sceneReady.set(true));
  });
  return null;
}
