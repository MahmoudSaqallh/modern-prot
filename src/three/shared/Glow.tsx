"use client";

import type { Ref } from "react";
import { Billboard } from "@react-three/drei";
import type { Group, ShaderMaterial } from "three";

interface GlowProps {
  material: ShaderMaterial;
  size: number;
  position?: [number, number, number];
  ref?: Ref<Group>;
}

const PLANE: [number, number] = [1, 1];

/** Camera-facing radial glow. Material is shared by callers to keep programs few. */
export function Glow({ material, size, position, ref }: GlowProps) {
  return (
    <Billboard ref={ref} position={position}>
      <mesh material={material} scale={size} renderOrder={2}>
        <planeGeometry args={PLANE} />
      </mesh>
    </Billboard>
  );
}
