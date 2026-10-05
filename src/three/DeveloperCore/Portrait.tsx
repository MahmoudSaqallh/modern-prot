"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, PlaneGeometry, ShaderMaterial, SRGBColorSpace, TextureLoader, type Mesh, type Texture } from "three";
import { profile } from "@/data/profile";
import { world } from "@/lib/world";
import { useWorldConfig } from "../shared/config";
import { PALETTE } from "../shared/materials";
import { smoothstep } from "../shared/pointer";
import { useDisposable } from "../shared/useDisposable";

/** Same 4:5 aspect as the source photo (640×800) — never stretched. */
const H = 1.72;
const W = H * 0.8;

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// The photo itself is untouched in the centre (face and shoulders). Only the
// presentation changes: a soft oval feather, a gentle edge falloff so the grey
// studio backdrop melts into the core, a thin rim light, and a reveal wipe.
const fragment = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uOpacity;
  uniform float uReveal;
  uniform vec3 uRim;
  varying vec2 vUv;

  void main() {
    vec4 tex = texture2D(uMap, vUv);
    vec2 p = (vUv - vec2(0.5, 0.53)) / vec2(0.5, 0.53);
    float d = length(p);

    float mask = 1.0 - smoothstep(0.74, 1.0, d);
    mask *= smoothstep(0.0, 0.16, vUv.y);

    // Edge falloff only (d > 0.4); the face region keeps its original colour.
    vec3 color = tex.rgb * mix(1.0, 0.5, smoothstep(0.4, 0.98, d));
    float rim = smoothstep(0.66, 0.76, d) * (1.0 - smoothstep(0.76, 0.9, d));
    color += uRim * rim * 0.22;

    // Reveal: a soft line sweeps upward.
    float edge = uReveal * 1.15;
    float reveal = 1.0 - smoothstep(edge - 0.12, edge, vUv.y);
    color += uRim * (smoothstep(edge - 0.12, edge - 0.02, vUv.y) * reveal) * 0.5 * (1.0 - step(1.0, uReveal));

    gl_FragColor = vec4(color, mask * reveal * uOpacity);
    #include <colorspace_fragment>
  }
`;

/**
 * The developer at the centre of the Developer Core: the portrait sits inside
 * the energy shell, behind the rotating cage, slightly forward of the centre so
 * pointer movement gives it a little parallax against the cage lines.
 * `presence` (0..1) is driven by the core: visible in the hero and contact.
 */
export function Portrait({ presence }: { presence: { value: number } }) {
  const { reduced } = useWorldConfig();
  const mesh = useRef<Mesh>(null);
  const [texture, setTexture] = useState<Texture | null>(null);

  // Loaded without suspending: a missing or broken photo simply leaves the
  // portrait hidden instead of throwing and taking the whole canvas down.
  useEffect(() => {
    if (!profile.avatar) return;
    let alive = true;
    let loaded: Texture | null = null;
    new TextureLoader().load(
      encodeURI(profile.avatar),
      (tex) => {
        tex.colorSpace = SRGBColorSpace;
        tex.anisotropy = 4;
        if (!alive) return tex.dispose();
        loaded = tex;
        setTexture(tex);
      },
      undefined,
      () => console.warn(`[portrait] could not load ${profile.avatar}; the portrait stays hidden.`),
    );
    return () => {
      alive = false;
      loaded?.dispose();
    };
  }, []);

  const geometry = useDisposable(() => new PlaneGeometry(W, H), []);
  const material = useDisposable(
    () =>
      new ShaderMaterial({
        uniforms: {
          uMap: { value: texture },
          uOpacity: { value: 0 },
          uReveal: { value: 0 },
          uRim: { value: new Color(PALETTE.web) },
        },
        vertexShader: vertex,
        fragmentShader: fragment,
        transparent: true,
        depthWrite: false,
      }),
    [texture],
  );

  useFrame(() => {
    const m = mesh.current;
    if (!m) return;
    const p = presence.value;
    m.visible = texture !== null && p > 0.01;
    // Sequence: core forms, nodes activate, then the portrait is revealed.
    material.uniforms.uReveal.value = reduced ? 1 : smoothstep(0.4, 0.68, world.intro);
    material.uniforms.uOpacity.value = p;
  });

  return <mesh ref={mesh} visible={false} geometry={geometry} material={material} position={[0, 0.02, 0.28]} renderOrder={5} />;
}
