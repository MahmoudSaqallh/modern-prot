import { AdditiveBlending, Color, DoubleSide, ShaderMaterial, Vector2, type ColorRepresentation } from "three";

const fresnelVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const fresnelFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uPower;
  uniform float uIntensity;
  uniform float uOpacity;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float f = pow(1.0 - max(dot(normalize(vNormal), normalize(vView)), 0.0), uPower);
    gl_FragColor = vec4(uColor * f * uIntensity, f * uOpacity);
  }
`;

/** Rim-lit energy shell. Additive, so it reads as light rather than a surface. */
export function createFresnelMaterial(color: ColorRepresentation, power = 2.4, intensity = 1.6) {
  return new ShaderMaterial({
    uniforms: {
      uColor: { value: new Color(color) },
      uPower: { value: power },
      uIntensity: { value: intensity },
      uOpacity: { value: 1 },
    },
    vertexShader: fresnelVertex,
    fragmentShader: fresnelFragment,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });
}

const glowVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const glowFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying vec2 vUv;
  void main() {
    float d = distance(vUv, vec2(0.5)) * 2.0;
    float a = pow(clamp(1.0 - d, 0.0, 1.0), 2.6);
    gl_FragColor = vec4(uColor * a, a * uOpacity);
  }
`;

/** Soft radial falloff for billboards. Replaces a bloom pass at a fraction of the cost. */
export function createGlowMaterial(color: ColorRepresentation, opacity = 1) {
  return new ShaderMaterial({
    uniforms: { uColor: { value: new Color(color) }, uOpacity: { value: opacity } },
    vertexShader: glowVertex,
    fragmentShader: glowFragment,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });
}

const gridVertex = /* glsl */ `
  varying vec3 vWorld;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const gridFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uAccent;
  uniform vec2 uCenter;
  uniform float uRadius;
  uniform float uOpacity;
  uniform float uTime;
  varying vec3 vWorld;

  float hash(float n) { return fract(sin(n * 91.345) * 47453.21); }

  void main() {
    vec2 minorG = abs(fract(vWorld.xz - 0.5) - 0.5) / fwidth(vWorld.xz);
    vec2 c = vWorld.xz / 4.0;
    vec2 majorG = abs(fract(c - 0.5) - 0.5) / fwidth(c);
    float minor = 1.0 - min(min(minorG.x, minorG.y), 1.0);
    float majorX = 1.0 - min(majorG.x, 1.0); // lines running along z
    float majorZ = 1.0 - min(majorG.y, 1.0); // lines running along x
    float major = max(majorX, majorZ);
    float fade = 1.0 - smoothstep(uRadius * 0.25, uRadius, distance(vWorld.xz, uCenter));

    // Data pulses: short bright segments travelling along some major lines.
    float laneX = floor(c.x + 0.5);
    float laneZ = floor(c.y + 0.5);
    float sx = fract(vWorld.z * 0.035 + uTime * 0.11 + hash(laneX));
    float sz = fract(vWorld.x * 0.035 - uTime * 0.09 + hash(laneZ + 17.0));
    float pulseX = smoothstep(0.0, 0.05, sx) * (1.0 - smoothstep(0.05, 0.16, sx)) * step(0.62, hash(laneX + 3.0)) * majorX;
    float pulseZ = smoothstep(0.0, 0.05, sz) * (1.0 - smoothstep(0.05, 0.16, sz)) * step(0.7, hash(laneZ + 9.0)) * majorZ;
    float pulse = max(pulseX, pulseZ);

    float a = (minor * 0.35 + major * 0.65) * fade * uOpacity + pulse * fade * 0.55 * min(1.0, uOpacity * 6.0);
    vec3 col = mix(uColor, uAccent, clamp(pulse * 1.4, 0.0, 1.0));
    gl_FragColor = vec4(col, a);
  }
`;

/** Technical floor grid with travelling data pulses, anti-aliased with screen derivatives. */
export function createGridMaterial(color: ColorRepresentation) {
  return new ShaderMaterial({
    uniforms: {
      uColor: { value: new Color(color) },
      uAccent: { value: new Color("#33d6ff") },
      uCenter: { value: new Vector2() },
      uRadius: { value: 22 },
      uOpacity: { value: 0.16 },
      uTime: { value: 0 },
    },
    vertexShader: gridVertex,
    fragmentShader: gridFragment,
    transparent: true,
    depthWrite: false,
    side: DoubleSide,
  });
}

/** Deterministic PRNG so generated layouts are stable between renders. */
export function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const PALETTE = {
  web: "#33d6ff",
  server: "#5be37d",
  data: "#34d399",
  mobile: "#3b82f6",
  violet: "#8b5cf6",
  accent: "#9bef00",
  fg: "#f5f7fa",
  muted: "#8b919c",
  line: "#2a2f37",
} as const;
