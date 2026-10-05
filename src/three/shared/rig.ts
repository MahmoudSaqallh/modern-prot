import { Color, Vector3 } from "three";
import { lerp, stationPair, type Station, type Vec3 } from "@/lib/stations";

export interface RigSample {
  cameraPos: Vector3;
  cameraTarget: Vector3;
  corePos: Vector3;
  coreScale: number;
  calm: number;
  rings: number;
  tint: Color;
  key: Color;
  keyIntensity: number;
  rim: Color;
  accent: Color;
}

export function createRigSample(): RigSample {
  return {
    cameraPos: new Vector3(),
    cameraTarget: new Vector3(),
    corePos: new Vector3(),
    coreScale: 1,
    calm: 0,
    rings: 1,
    tint: new Color(),
    key: new Color(),
    keyIntensity: 1,
    rim: new Color(),
    accent: new Color(),
  };
}

const ta = new Vector3();
const tb = new Vector3();
const pa = new Vector3();
const pb = new Vector3();
const ca = new Color();
const cb = new Color();

const setVec = (out: Vector3, v: Vec3) => out.set(v[0], v[1], v[2]);

function pose(station: Station, compact: boolean, aspect: number, outPos: Vector3, outTarget: Vector3) {
  setVec(outTarget, compact ? station.compactTarget : station.target);
  const offset = compact ? station.compactOffset : station.offset;
  // Portrait screens need more distance to keep objects inside the frame.
  const pull = aspect < 1 ? 1 + (1 - aspect) * 0.55 : 1;
  outPos.set(offset[0] * pull, offset[1], offset[2] * pull).add(outTarget);
}

function mixColor(out: Color, a: string, b: string, t: number) {
  return out.copy(ca.set(a)).lerp(cb.set(b), t);
}

/** Interpolated camera, core and lighting for a continuous station position. No allocations. */
export function sampleRig(g: number, compact: boolean, aspect: number, out: RigSample) {
  const { a, b, t } = stationPair(g);
  pose(a, compact, aspect, pa, ta);
  pose(b, compact, aspect, pb, tb);
  out.cameraPos.lerpVectors(pa, pb, t);
  out.cameraTarget.lerpVectors(ta, tb, t);
  out.corePos.lerpVectors(setVec(pa, a.core.pos), setVec(pb, b.core.pos), t);
  out.coreScale = lerp(a.core.scale, b.core.scale, t);
  out.calm = lerp(a.core.calm, b.core.calm, t);
  out.rings = lerp(a.rings, b.rings, t);
  mixColor(out.tint, a.tint, b.tint, t);
  mixColor(out.key, a.light.key, b.light.key, t);
  mixColor(out.rim, a.light.rim, b.light.rim, t);
  mixColor(out.accent, a.accent, b.accent, t);
  out.keyIntensity = lerp(a.light.intensity, b.light.intensity, t);
  return out;
}

export function dampVec(current: Vector3, target: Vector3, lambda: number, dt: number) {
  const k = 1 - Math.exp(-lambda * dt);
  current.x += (target.x - current.x) * k;
  current.y += (target.y - current.y) * k;
  current.z += (target.z - current.z) * k;
  return current;
}
