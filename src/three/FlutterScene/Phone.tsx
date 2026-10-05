"use client";

import { useRef } from "react";
import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { BoxGeometry, MeshBasicMaterial, MeshStandardMaterial, PlaneGeometry, type Group } from "three";
import { useCanvasTexture } from "../shared/canvasTexture";
import { useWorldConfig } from "../shared/config";
import { Glow } from "../shared/Glow";
import { createGlowMaterial, PALETTE } from "../shared/materials";
import { world } from "@/lib/world";
import { damp } from "../shared/pointer";
import { useDisposable } from "../shared/useDisposable";
import { bookingScreen, homeScreen, SCREEN_SIZE, signInScreen } from "./screens";

const BODY: [number, number, number] = [1.9, 3.9, 0.2];
const SCREEN_W = 1.76;
const SCREEN_H = 3.76;

/**
 * Phone body with a live Flutter UI. Screens cross-fade to world.phoneScreen;
 * the phone leans toward the pointer and floats slightly.
 */
export function Phone({ presence }: { presence: { value: number } }) {
  const { reduced, tier } = useWorldConfig();
  const phone = useRef<Group>(null);
  const fades = useRef([1, 0, 0]);

  const w = tier === "high" ? SCREEN_SIZE.width : 400;
  const h = tier === "high" ? SCREEN_SIZE.height : 855;
  const tex0 = useCanvasTexture(w, h, signInScreen);
  const tex1 = useCanvasTexture(w, h, homeScreen);
  const tex2 = useCanvasTexture(w, h, bookingScreen);

  const screenGeometry = useDisposable(() => new PlaneGeometry(SCREEN_W, SCREEN_H), []);
  const buttonGeometry = useDisposable(() => new BoxGeometry(0.04, 0.38, 0.06), []);
  const screenMaterials = useDisposable(() => {
    const list = [tex0, tex1, tex2].map(
      (map) => new MeshBasicMaterial({ map, transparent: true, depthWrite: false, toneMapped: false }),
    );
    return { list, dispose: () => list.forEach((m) => m.dispose()) };
  }, [tex0, tex1, tex2]);
  const bodyMaterial = useDisposable(
    () => new MeshStandardMaterial({ color: "#14171d", metalness: 0.7, roughness: 0.32 }),
    [],
  );
  const glassMaterial = useDisposable(() => new MeshBasicMaterial({ color: "#020304" }), []);
  const backlight = useDisposable(() => createGlowMaterial(PALETTE.mobile, 0.55), []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 20);
    const screen = world.phoneScreen;
    const p = presence.value;
    fades.current = fades.current.map((v, i) => (reduced ? (i === screen ? 1 : 0) : damp(v, i === screen ? 1 : 0, 6, dt)));
    screenMaterials.list.forEach((m, i) => {
      m.opacity = fades.current[i] * p;
    });
    backlight.uniforms.uOpacity.value = 0.55 * p;

    const g = phone.current;
    if (!g) return;
    if (reduced) {
      g.rotation.set(0, -0.18, 0);
      return;
    }
    g.rotation.y = damp(g.rotation.y, -0.22 + world.pointer.x * 0.38 + (1 - p) * 0.8, 3, dt);
    g.rotation.x = damp(g.rotation.x, 0.04 - world.pointer.y * 0.2, 3, dt);
    g.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.05;
  });

  return (
    <>
      <Glow material={backlight} size={7} position={[0, 0, -1.2]} />
      <group ref={phone}>
        <RoundedBox args={BODY} radius={0.24} smoothness={tier === "high" ? 5 : 3} material={bodyMaterial} />
        <mesh geometry={screenGeometry} material={glassMaterial} position-z={0.101} scale={[1.02, 1.01, 1]} />
        {screenMaterials.list.map((material, i) => (
          <mesh key={i} geometry={screenGeometry} material={material} position-z={0.103 + i * 0.001} renderOrder={4 + i} />
        ))}
        <mesh geometry={buttonGeometry} material={bodyMaterial} position={[0.97, 0.7, 0]} />
        <mesh geometry={buttonGeometry} material={bodyMaterial} position={[0.97, 0.15, 0]} scale-y={0.6} />
      </group>
    </>
  );
}
