import type { NavId } from "@/data/profile";
import type { TechId } from "@/data/technologies";
import { createStore } from "./store";

/** Sections that take part in the persistent 3D world, in page order. */
export const WORLD_SECTIONS = [
  "hero",
  "about",
  "frontend",
  "backend",
  "database",
  "flutter",
  "stack",
  "projects",
  "experience",
  "terminal",
  "contact",
] as const;

export type WorldSectionId = (typeof WORLD_SECTIONS)[number];

export const worldIndex = (id: WorldSectionId) => WORLD_SECTIONS.indexOf(id);

/**
 * Mutable per-frame state shared by the DOM and the WebGL world.
 * Written by scroll/pointer/UI handlers, read inside useFrame.
 * Deliberately not React state: changing it must never re-render the tree.
 */
export const world = {
  /** Continuous station position: integer = settled on a section, fraction = travelling. */
  g: 0,
  /** 0..1 progress of each section crossing the viewport centre. */
  progress: Object.fromEntries(WORLD_SECTIONS.map((id) => [id, 0])) as Record<WorldSectionId, number>,
  /** Normalised pointer, -1..1 (window). */
  pointer: { x: 0, y: 0 },
  /** Hero intro progress, 0..1 (GSAP). */
  intro: 0,
  /** Frontend layer highlighted from the DOM, -1 for none. */
  frontendLayer: -1,
  /** Backend nodes highlighted from the DOM. */
  backendFocus: [] as string[],
  /** Incremented to fire a request through the backend scene. */
  requestId: 0,
  /** Database collection highlighted / queried. */
  collection: "projects",
  /** Incremented to run a query in the database scene. */
  queryId: 0,
  /** Flutter screen index shown on the 3D phone. */
  phoneScreen: 1,
  /** Viewport heights scrolled past the last anchor (the world scrolls with the page there). */
  tail: 0,
  /** Contact channel highlighted from the DOM (link hover, project type). */
  contactFocus: null as string | null,
  /** Contact closing sequence progress, 0..1 (GSAP): node appears, wires connect. */
  contactIntro: 0,
  /** Canvas opacity resolved from the stations. */
  opacity: 1,
};

const listeners = new Set<() => void>();

/** Notify subscribers that world state changed (on-demand rendering, derived UI). */
export function notifyWorld() {
  listeners.forEach((listener) => listener());
}

export function subscribeWorld(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** True once the loader has handed over to the page. */
export const appReady = createStore(false);
/** Set by the canvas after its first rendered frame (or when WebGL is unavailable). */
export const sceneReady = createStore(false);
/** Navigation group of the section at the viewport centre. */
export const activeNav = createStore<NavId>("home");
/** Technology hovered in the 3D universe or the accessible list. */
export const hoveredTech = createStore<TechId | null>(null);
/** Frontend layer hovered in the 3D browser (raycast) — mirrored in the DOM list. */
export const hoveredLayer = createStore<number>(-1);
/** Project opened in the detail view. */
export const activeProject = createStore<string | null>(null);
/** Cursor state requested by the 3D layer (e.g. "drag" over the universe). */
export const sceneCursor = createStore<"default" | "drag" | "interactive">("default");
