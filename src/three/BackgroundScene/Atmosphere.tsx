"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { BufferAttribute, BufferGeometry, PlaneGeometry, PointsMaterial, type Color, type Mesh, type Points, type Vector2 } from "three";
import { world } from "@/lib/world";
import { useWorldConfig } from "../shared/config";
import { createGridMaterial, PALETTE, seeded } from "../shared/materials";
import { damp } from "../shared/pointer";
import { frameRig } from "../shared/rigState";
import { useDisposable } from "../shared/useDisposable";

/**
 * Environment shared by every station: a technical floor grid (with data
 * pulses in the section colour) that follows the camera, and sparse dust the camera descends through (which is what makes
 * scrolling read as travel). One draw call each.
 */
export function Atmosphere() {
  const { tier, reduced } = useWorldConfig();
  const grid = useRef<Mesh>(null);
  const dust = useRef<Points>(null);

  const gridGeometry = useDisposable(() => new PlaneGeometry(90, 90, 1, 1), []);
  const gridMaterial = useDisposable(() => createGridMaterial(PALETTE.muted), []);

  const count = tier === "high" ? 520 : 160;
  const dustGeometry = useDisposable(() => {
    const rand = seeded(7);
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (rand() - 0.5) * 38;
      positions[i * 3 + 1] = 10 - rand() * 145;
      positions[i * 3 + 2] = -24 + rand() * 30;
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(positions, 3));
    return geometry;
  }, [count]);
  const dustMaterial = useDisposable(
    () =>
      new PointsMaterial({
        color: PALETTE.muted,
        size: tier === "high" ? 0.045 : 0.06,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
      }),
    [tier],
  );
  const center = useMemo(() => ({ x: 0, z: 0 }), []);
  // Grid clock slows in calm stations (the contact finale).
  const clock = useRef(0);

  useFrame((state, delta) => {
    const mesh = grid.current;
    if (mesh) {
      const cam = state.camera.position;
      mesh.position.set(cam.x, cam.y - 5.4, cam.z - 8);
      center.x = mesh.position.x;
      center.z = mesh.position.z;
      (gridMaterial.uniforms.uCenter.value as Vector2).set(center.x, center.z);
    }
    // Grid appears as the system initialises; pulses take the section colour.
    const u = gridMaterial.uniforms;
    clock.current += reduced ? 0 : Math.min(delta, 0.05) * (1 - 0.75 * frameRig.calm);
    u.uTime.value = clock.current;
    u.uOpacity.value = 0.16 * (reduced ? 1 : Math.min(1, world.intro * 3));
    (u.uAccent.value as Color).copy(frameRig.accent);

    const d = dust.current;
    if (d && !reduced) {
      const dt = Math.min(delta, 0.05);
      d.position.y = Math.sin(state.clock.elapsedTime * 0.08) * 0.4;
      // Slight parallax against the pointer: near dust moves, the world feels deep.
      d.position.x = damp(d.position.x, -world.pointer.x * 0.6, 1.5, dt);
    }
  });

  return (
    <>
      <mesh ref={grid} geometry={gridGeometry} material={gridMaterial} rotation-x={-Math.PI / 2} renderOrder={-1} />
      <points ref={dust} geometry={dustGeometry} material={dustMaterial} />
    </>
  );
}
