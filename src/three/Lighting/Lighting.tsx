"use client";

import { useRef } from "react";
import { Environment, Lightformer } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import type { AmbientLight, DirectionalLight, HemisphereLight, PointLight } from "three";
import { world } from "@/lib/world";
import { useWorldConfig } from "../shared/config";
import { PALETTE } from "../shared/materials";
import { frameRig, rigLook } from "../shared/rigState";

/**
 * Cinematic lighting that follows the camera's focus:
 *  - key light (section colour/strength: cooler for frontend, darker for
 *    backend, brighter for Flutter, neutral for projects)
 *  - cool fill from the opposite side, and a hemisphere for ambient depth
 *  - rim light behind the subject
 *  - one accent light in the section colour that drifts slowly
 *  - a one-time environment map (local lightformers, no network) for soft
 *    reflections on standard materials such as the phone body.
 * Few lights, all reused: no per-node point lights.
 */
export function Lighting() {
  const { reduced, tier } = useWorldConfig();
  const ambient = useRef<AmbientLight>(null);
  const hemi = useRef<HemisphereLight>(null);
  const key = useRef<DirectionalLight>(null);
  const fill = useRef<DirectionalLight>(null);
  const rim = useRef<PointLight>(null);
  const accent = useRef<PointLight>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const l = rigLook;
    const intro = reduced ? 1 : Math.min(1, world.intro * 1.6);

    if (key.current) {
      key.current.color.copy(frameRig.key);
      key.current.intensity = frameRig.keyIntensity * intro;
      key.current.position.set(l.x + 4, l.y + 6, l.z + 6);
      key.current.target.position.copy(l);
      key.current.target.updateMatrixWorld();
    }
    if (fill.current) {
      fill.current.position.set(l.x - 6, l.y + 1.5, l.z + 4);
      fill.current.target.position.copy(l);
      fill.current.target.updateMatrixWorld();
    }
    if (rim.current) {
      rim.current.color.copy(frameRig.rim);
      rim.current.position.set(l.x - 4, l.y + 1.5, l.z - 3);
    }
    if (accent.current) {
      accent.current.color.copy(frameRig.accent);
      const a = reduced ? 0.6 : t * 0.25;
      accent.current.position.set(l.x + Math.cos(a) * 3.2, l.y - 1 + Math.sin(a * 0.7) * 0.8, l.z + 2.5);
      accent.current.intensity = 5 * intro;
    }
    if (hemi.current) hemi.current.groundColor.copy(frameRig.tint);
    if (ambient.current) ambient.current.intensity = (0.12 + frameRig.keyIntensity * 0.1) * intro;
  });

  return (
    <>
      <ambientLight ref={ambient} intensity={0.2} />
      <hemisphereLight ref={hemi} args={["#cfe6ff", "#08090c", 0.35]} />
      <directionalLight ref={key} intensity={1.2} />
      <directionalLight ref={fill} color="#8fb8ff" intensity={0.35} />
      <pointLight ref={rim} intensity={9} distance={14} />
      <pointLight ref={accent} intensity={5} distance={10} decay={2} />
      <Environment frames={1} resolution={tier === "high" ? 128 : 64}>
        <Lightformer form="rect" intensity={2.2} position={[0, 5, -4]} rotation-x={Math.PI / 2} scale={[10, 3, 1]} />
        <Lightformer form="rect" intensity={1.2} color={PALETTE.web} position={[-6, 1, 0]} rotation-y={Math.PI / 2} scale={[6, 1.2, 1]} />
        <Lightformer form="rect" intensity={0.8} color={PALETTE.violet} position={[6, -1, 2]} rotation-y={-Math.PI / 2} scale={[6, 1, 1]} />
      </Environment>
    </>
  );
}
