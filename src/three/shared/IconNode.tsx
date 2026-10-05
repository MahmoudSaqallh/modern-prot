"use client";

import { useMemo, useRef, type Ref } from "react";
import { Billboard } from "@react-three/drei";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { MeshBasicMaterial, PlaneGeometry, type Group } from "three";
import { useCanvasTexture } from "./canvasTexture";
import { useWorldConfig } from "./config";
import { Glow } from "./Glow";
import { PLATE_H, PLATE_OFFSET, PLATE_TEXTURE, PLATE_W, platePainter, type PlateIcon } from "./iconPlate";
import { createGlowMaterial } from "./materials";
import { damp } from "./pointer";
import { useDisposable } from "./useDisposable";

/** Written by the owning scene every frame; read by the node. */
export interface NodeState {
  /** 0..1 visibility (scale and opacity). */
  appear: number;
  /** 0..1 activation (glow and slight scale-up). */
  lit: number;
}

interface IconNodeProps {
  icon: PlateIcon;
  label: string | null;
  color: string;
  position?: [number, number, number];
  scale?: number;
  state: NodeState;
  onPointerOver?: (event: ThreeEvent<PointerEvent>) => void;
  onPointerOut?: (event: ThreeEvent<PointerEvent>) => void;
  ref?: Ref<Group>;
}

/** Camera-facing technology plate with an activation glow. Used by every scene. */
export function IconNode({ icon, label, color, position, scale = 1, state, onPointerOver, onPointerOut, ref }: IconNodeProps) {
  const { reduced } = useWorldConfig();
  const inner = useRef<Group>(null);
  const lit = useRef(0);

  const painter = useMemo(() => platePainter(icon, label, color), [icon, label, color]);
  const texture = useCanvasTexture(PLATE_TEXTURE.width, PLATE_TEXTURE.height, painter);
  const plane = useDisposable(() => new PlaneGeometry(PLATE_W, PLATE_H), []);
  const material = useDisposable(
    () => new MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, toneMapped: false }),
    [texture],
  );
  const glow = useDisposable(() => createGlowMaterial(color, 0.3), [color]);

  useFrame((_, delta) => {
    const g = inner.current;
    if (!g) return;
    lit.current = reduced ? state.lit : damp(lit.current, state.lit, 8, Math.min(delta, 0.05));
    g.visible = state.appear > 0.01;
    g.scale.setScalar(Math.max(0.0001, state.appear * scale * (1 + 0.14 * lit.current)));
    material.opacity = state.appear;
    glow.uniforms.uOpacity.value = (0.16 + 0.8 * lit.current) * state.appear;
  });

  return (
    <group ref={ref} position={position}>
      <group ref={inner}>
        <Billboard>
          <Glow material={glow} size={1.5} position={[0, 0, -0.01]} />
          <mesh
            geometry={plane}
            material={material}
            position={[0, PLATE_OFFSET, 0]}
            renderOrder={3}
            onPointerOver={onPointerOver}
            onPointerOut={onPointerOut}
          />
        </Billboard>
      </group>
    </group>
  );
}
