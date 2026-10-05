"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, PlaneGeometry, ShaderMaterial, Vector2, Vector3, type Mesh, type PerspectiveCamera } from "three";
import { world } from "@/lib/world";
import { useWorldConfig } from "../shared/config";
import { PALETTE } from "../shared/materials";
import { damp } from "../shared/pointer";
import { frameRig } from "../shared/rigState";
import { useDisposable } from "../shared/useDisposable";

const DISTANCE = 90;

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Two slow light pools (section accent + violet), soft value-noise distortion
// and fine grain on top of the section tint. Very low contrast on purpose.
const fragment = /* glsl */ `
  uniform vec3 uTint;
  uniform vec3 uAccent;
  uniform vec3 uViolet;
  uniform vec2 uPointer;
  uniform float uTime;
  uniform float uScroll;
  uniform float uIntro;
  uniform float uAspect;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }

  void main() {
    vec2 uv = vUv;
    float n = noise(uv * 3.0 + vec2(uTime * 0.02, uScroll * 0.25));
    vec2 warp = (vec2(n, noise(uv * 3.0 + 7.3)) - 0.5) * 0.06;
    vec2 a = vec2(uAspect, 1.0);

    vec2 p1 = vec2(0.28 + 0.08 * sin(uTime * 0.07 + uScroll * 0.6), 0.7 + 0.06 * cos(uTime * 0.05)) + uPointer * 0.035;
    vec2 p2 = vec2(0.78 + 0.07 * cos(uTime * 0.06 + uScroll * 0.4), 0.28 + 0.08 * sin(uTime * 0.08)) - uPointer * 0.025;
    float l1 = 1.0 - smoothstep(0.0, 0.62, distance((uv + warp) * a, p1 * a));
    float l2 = 1.0 - smoothstep(0.0, 0.55, distance((uv - warp) * a, p2 * a));

    vec3 col = uTint;
    col += uAccent * l1 * l1 * (0.075 + 0.03 * n);
    col += uViolet * l2 * l2 * 0.05;
    col = mix(uTint, col, uIntro);
    col += (hash(uv * 900.0 + fract(uTime) * 13.0) - 0.5) * 0.008;

    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

const forward = new Vector3();

/**
 * Far background plane that always fills the view: slow-moving light in the
 * current section's colour, soft noise and grain. Reacts gently to the
 * pointer and scroll; fades in as the intro initialises the system.
 */
export function Backdrop() {
  const { reduced } = useWorldConfig();
  const mesh = useRef<Mesh>(null);
  const pointer = useRef({ x: 0, y: 0 });
  // Scene clock that slows down in calm stations (the contact finale).
  const clock = useRef(0);

  const geometry = useDisposable(() => new PlaneGeometry(1, 1), []);
  const material = useDisposable(
    () =>
      new ShaderMaterial({
        uniforms: {
          uTint: { value: new Color("#08090c") },
          uAccent: { value: new Color(PALETTE.web) },
          uViolet: { value: new Color(PALETTE.violet) },
          uPointer: { value: new Vector2() },
          uTime: { value: 0 },
          uScroll: { value: 0 },
          uIntro: { value: 0 },
          uAspect: { value: 1 },
        },
        vertexShader: vertex,
        fragmentShader: fragment,
        depthWrite: false,
        fog: false,
      }),
    [],
  );

  useFrame((state, delta) => {
    const m = mesh.current;
    if (!m) return;
    const camera = state.camera as PerspectiveCamera;
    camera.getWorldDirection(forward);
    m.position.copy(camera.position).addScaledVector(forward, DISTANCE);
    m.quaternion.copy(camera.quaternion);
    const height = 2 * Math.tan((camera.fov * Math.PI) / 360) * DISTANCE * 1.15;
    m.scale.set(height * camera.aspect, height, 1);

    const dt = Math.min(delta, 0.05);
    pointer.current.x = damp(pointer.current.x, reduced ? 0 : world.pointer.x, 1.5, dt);
    pointer.current.y = damp(pointer.current.y, reduced ? 0 : world.pointer.y, 1.5, dt);
    const u = material.uniforms;
    (u.uTint.value as Color).copy(frameRig.tint);
    (u.uAccent.value as Color).copy(frameRig.accent);
    (u.uPointer.value as Vector2).set(pointer.current.x, pointer.current.y);
    clock.current += reduced ? 0 : dt * (1 - 0.7 * frameRig.calm);
    u.uTime.value = clock.current;
    u.uScroll.value = world.g;
    u.uIntro.value = reduced ? 1 : Math.min(1, world.intro * 2.5);
    u.uAspect.value = camera.aspect;
  });

  return <mesh ref={mesh} geometry={geometry} material={material} renderOrder={-100} frustumCulled={false} />;
}
