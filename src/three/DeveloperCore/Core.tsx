"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  EdgesGeometry,
  IcosahedronGeometry,
  LineBasicMaterial,
  MeshBasicMaterial,
  SphereGeometry,
  type Group,
  type LineSegments,
} from "three";
import { world } from "@/lib/world";
import { useWorldConfig } from "../shared/config";
import { Glow } from "../shared/Glow";
import { createFresnelMaterial, createGlowMaterial, PALETTE } from "../shared/materials";
import { easeOutCubic, smoothstep } from "../shared/pointer";
import { useDisposable } from "../shared/useDisposable";
import { Portrait } from "./Portrait";

function edges(radius: number, detail: number) {
  const source = new IcosahedronGeometry(radius, detail);
  const geometry = new EdgesGeometry(source);
  source.dispose();
  return geometry;
}

/**
 * The Developer Core: an energy shell, a rotating cage and a bright heart.
 * Where the portrait is shown (`portrait` > 0) the core grows a little, the
 * heart and inner lattice step back so they never wash over the face, and the
 * cage is drawn in front of the photo.
 */
export function Core({ energy, portrait }: { energy: { value: number }; portrait: { value: number } }) {
  const { reduced, tier } = useWorldConfig();
  const root = useRef<Group>(null);
  const cage = useRef<LineSegments>(null);
  const lattice = useRef<LineSegments>(null);

  const segments = tier === "high" ? 48 : 24;
  const shellGeometry = useDisposable(() => new SphereGeometry(1, segments, segments), [segments]);
  const shellMaterial = useDisposable(() => createFresnelMaterial(PALETTE.web, 2.3, 1.1), []);
  const heartGeometry = useDisposable(() => new IcosahedronGeometry(0.11, 2), []);
  const heartMaterial = useDisposable(() => new MeshBasicMaterial({ color: "#dff7ff", transparent: true }), []);
  const cageGeometry = useDisposable(() => edges(1.34, 1), []);
  const latticeGeometry = useDisposable(() => edges(0.64, 0), []);
  const cageMaterial = useDisposable(
    () => new LineBasicMaterial({ color: PALETTE.web, transparent: true, opacity: 0.3, depthWrite: false }),
    [],
  );
  const latticeMaterial = useDisposable(
    () => new LineBasicMaterial({ color: "#c6f1ff", transparent: true, opacity: 0.5, depthWrite: false }),
    [],
  );
  const glowMaterial = useDisposable(() => createGlowMaterial(PALETTE.web, 0.75), []);
  const heartGlowMaterial = useDisposable(() => createGlowMaterial("#cdf3ff", 0.9), []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 20);
    const intro = reduced ? 1 : easeOutCubic(smoothstep(0, 0.45, world.intro));
    const p = portrait.value;
    root.current?.scale.setScalar((0.4 + 0.6 * intro) * (1 + 0.38 * p));
    const e = energy.value;

    if (!reduced) {
      if (cage.current) {
        cage.current.rotation.y += dt * 0.12 * e;
        cage.current.rotation.x += dt * 0.04 * e;
      }
      if (lattice.current) {
        lattice.current.rotation.y -= dt * 0.32 * e;
        lattice.current.rotation.z += dt * 0.11 * e;
      }
    }
    const pulse = reduced ? 0 : Math.sin(state.clock.elapsedTime * 1.3) * 0.06 * e;
    shellMaterial.uniforms.uOpacity.value = intro;
    glowMaterial.uniforms.uOpacity.value = (0.5 + 0.25 * e + pulse) * intro * (1 - 0.55 * p);
    heartGlowMaterial.uniforms.uOpacity.value = (0.85 + pulse) * intro * (1 - p);
    heartMaterial.opacity = intro * (1 - p);
    latticeMaterial.opacity = 0.5 * (1 - 0.85 * p);
    cageMaterial.opacity = 0.3 * intro;
  });

  return (
    <group ref={root}>
      <Glow material={glowMaterial} size={4.4} />
      <mesh geometry={shellGeometry} material={shellMaterial} />
      <mesh geometry={heartGeometry} material={heartMaterial} />
      <Glow material={heartGlowMaterial} size={1.2} />
      <lineSegments ref={lattice} geometry={latticeGeometry} material={latticeMaterial} />
      <Portrait presence={portrait} />
      {/* Drawn after the portrait so the cage reads in front of it. */}
      <lineSegments ref={cage} geometry={cageGeometry} material={cageMaterial} renderOrder={6} />
    </group>
  );
}
