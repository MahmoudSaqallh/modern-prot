import { WORLD_SECTIONS, type WorldSectionId } from "./world";

export type Vec3 = readonly [number, number, number];

/** World-space origin of each scene. The camera descends through the system. */
export const SCENE_ORIGIN = {
  hero: [0, 0, 0],
  about: [0, -12, 0],
  frontend: [0, -26, 0],
  backend: [0, -42, 0],
  database: [0, -58, 0],
  flutter: [0, -74, 0],
  stack: [0, -90, 0],
  projects: [0, -106, 0],
  contact: [0, -122, 0],
} as const satisfies Record<string, Vec3>;

export interface Station {
  /** Camera look-at target and camera offset from it, for wide layouts (copy beside the 3D). */
  target: Vec3;
  offset: Vec3;
  /** Narrow layouts: the 3D sits above the copy. */
  compactTarget: Vec3;
  compactOffset: Vec3;
  /** Where the Developer Core is and what it is doing. */
  core: { pos: Vec3; scale: number; calm: number };
  /** How open the core's technology constellation is. */
  rings: number;
  /** Canvas opacity (0 pauses rendering). */
  opacity: number;
  /** Background / fog tint. */
  tint: string;
  /** Section accent: drives the backdrop light, grid data lines and accent light. */
  accent: string;
  /** Section lighting: key light colour and strength, rim light colour. */
  light: { key: string; intensity: number; rim: string };
}

const O = SCENE_ORIGIN;
const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

const quiet: Station = {
  target: [0, -114, 0],
  offset: [0, 4, 21],
  compactTarget: [0, -114, 0],
  compactOffset: [0, 4, 24],
  core: { pos: O.contact, scale: 0.7, calm: 1 },
  rings: 0,
  opacity: 0.3,
  tint: "#08090c",
  accent: "#33d6ff",
  light: { key: "#c9d1d9", intensity: 0.8, rim: "#8b919c" },
};

export const STATIONS: Record<WorldSectionId, Station> = {
  hero: {
    target: [-3.6, 0.1, 0],
    offset: [0, 0.3, 11.5],
    compactTarget: [0, -2.1, 0],
    compactOffset: [0, 0.3, 16],
    core: { pos: O.hero, scale: 1, calm: 0 },
    rings: 1,
    opacity: 1,
    tint: "#08090c",
    accent: "#33d6ff",
    light: { key: "#9fdcff", intensity: 1.2, rim: "#33d6ff" },
  },
  about: {
    target: O.about,
    offset: [0, 0.4, 13],
    compactTarget: add(O.about, [0, -1, 0]),
    compactOffset: [0, 0.4, 16],
    core: { pos: add(O.about, [4.4, 1.6, -3]), scale: 0.42, calm: 0.3 },
    rings: 0,
    opacity: 0.75,
    tint: "#08090c",
    accent: "#33d6ff",
    light: { key: "#9fdcff", intensity: 1.1, rim: "#33d6ff" },
  },
  frontend: {
    target: add(O.frontend, [-2.6, -0.9, 0]),
    offset: [1.2, 1.4, 12.5],
    compactTarget: add(O.frontend, [0, -2.2, 0]),
    compactOffset: [0, 1.4, 16],
    core: { pos: add(O.frontend, [0.6, 0.1, -4.6]), scale: 0.38, calm: 0.2 },
    rings: 0,
    opacity: 1,
    tint: "#060a0f",
    accent: "#33d6ff",
    light: { key: "#8fd8ff", intensity: 1.35, rim: "#33d6ff" },
  },
  backend: {
    target: add(O.backend, [2.3, 0.1, 0]),
    offset: [-1.4, 1.1, 13.5],
    compactTarget: add(O.backend, [0, -2.2, 0]),
    compactOffset: [0, 1, 17],
    core: { pos: add(O.backend, [0, -0.2, -2]), scale: 0.42, calm: 0.2 },
    rings: 0,
    opacity: 1,
    tint: "#06090a",
    accent: "#5be37d",
    light: { key: "#7a8a99", intensity: 0.85, rim: "#5be37d" },
  },
  database: {
    target: add(O.database, [-2.7, -0.2, 0]),
    offset: [1, 2, 13.5],
    compactTarget: add(O.database, [0, -2.2, 0]),
    compactOffset: [0, 2, 17],
    core: { pos: add(O.database, [0, 2.9, -1.6]), scale: 0.32, calm: 0.3 },
    rings: 0,
    opacity: 1,
    tint: "#060b09",
    accent: "#34d399",
    light: { key: "#9ff0dc", intensity: 0.95, rim: "#34d399" },
  },
  flutter: {
    target: add(O.flutter, [2.9, 0, 0]),
    offset: [0, 0.4, 10.5],
    compactTarget: add(O.flutter, [0, -1.9, 0]),
    compactOffset: [0, 0.3, 14],
    core: { pos: add(O.flutter, [0, 0.4, -1.9]), scale: 0.55, calm: 0.4 },
    rings: 0,
    opacity: 1,
    tint: "#08081a",
    accent: "#3b82f6",
    light: { key: "#c7d2ff", intensity: 1.6, rim: "#3b82f6" },
  },
  stack: {
    target: O.stack,
    offset: [0, 1.4, 15],
    compactTarget: add(O.stack, [0, -2.4, 0]),
    compactOffset: [0, 1.2, 21],
    core: { pos: O.stack, scale: 0.55, calm: 0.5 },
    rings: 0,
    opacity: 1,
    tint: "#08090c",
    accent: "#8b5cf6",
    light: { key: "#d8dde5", intensity: 1.1, rim: "#33d6ff" },
  },
  projects: {
    target: O.projects,
    offset: [0, 0.6, 14],
    compactTarget: O.projects,
    compactOffset: [0, 0.6, 18],
    core: { pos: add(O.projects, [7, -3, -8]), scale: 0.4, calm: 0.6 },
    rings: 0,
    opacity: 0.5,
    tint: "#08090c",
    accent: "#8b919c",
    light: { key: "#f5f7fa", intensity: 1, rim: "#8b919c" },
  },
  experience: quiet,
  terminal: quiet,
  contact: {
    // The communication node sits in the slot above the contact links (right column);
    // past this anchor the scene scrolls with the page (world.tail).
    target: add(O.contact, [-3.65, -1.75, 0]),
    offset: [0, 0.2, 11.5],
    compactTarget: add(O.contact, [0, -2.8, 0]),
    compactOffset: [0, 0.2, 15],
    core: { pos: O.contact, scale: 0.45, calm: 1 },
    rings: 0,
    opacity: 1,
    tint: "#08090c",
    accent: "#2aa9cc",
    light: { key: "#9fdcff", intensity: 0.8, rim: "#33d6ff" },
  },
};

export const STATION_LIST = WORLD_SECTIONS.map((id) => STATIONS[id]);

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};

/** Resolve a continuous station position into the two stations around it. */
export function stationPair(g: number) {
  const max = STATION_LIST.length - 1;
  const clamped = Math.min(max, Math.max(0, g));
  const i = Math.min(max - 1, Math.floor(clamped));
  return { a: STATION_LIST[i], b: STATION_LIST[i + 1], t: clamped - i };
}

export function stationOpacity(g: number) {
  const { a, b, t } = stationPair(g);
  return lerp(a.opacity, b.opacity, t);
}

/** 1 when the world is settled on `index`, falling to 0 one station away. */
export function stationWeight(g: number, index: number) {
  return clamp01(1 - Math.abs(g - index));
}

/** Frontend layer that scroll progress points at (3D browser and DOM list agree). */
export const layerAtProgress = (p: number, count: number) =>
  Math.min(count - 1, Math.max(0, Math.floor(((p - 0.2) / 0.6) * count)));

/** Mobile chapter progress at which the phone switches screen. */
export const SCREEN_BREAKS = [0.4, 0.62] as const;
