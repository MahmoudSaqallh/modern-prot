import type { NavId } from "@/data/profile";
import { clamp01, smoothstep, stationOpacity } from "@/lib/stations";
import { activeNav, notifyWorld, world, WORLD_SECTIONS, worldIndex, type WorldSectionId } from "@/lib/world";
import { ScrollTrigger } from "./gsap";

interface Anchor {
  id: WorldSectionId;
  index: number;
  el: HTMLElement;
  nav: NavId;
  top: number;
  height: number;
  /** Scroll position at which the camera is fully settled on this section. */
  at: number;
}

/**
 * Maps document scroll to the persistent 3D world (ScrollTrigger-driven).
 *
 * Each `[data-world]` section gets an anchor: the scroll position where its
 * centre meets the viewport centre (`data-world-anchor="top"` uses its top,
 * for tall sections). Between anchors the camera travels with a held ease,
 * so transitions straddle section boundaries instead of lagging behind them.
 * Positions are re-measured after every ScrollTrigger refresh.
 */
export function createCameraDirector({ stage, reduced }: { stage: HTMLElement | null; reduced: boolean }) {
  const anchors: Anchor[] = WORLD_SECTIONS.flatMap((id) => {
    const el = document.querySelector<HTMLElement>(`[data-world="${id}"]`);
    if (!el) return [];
    return [{ id, index: worldIndex(id), el, nav: (el.dataset.nav ?? "home") as NavId, top: 0, height: 0, at: 0 }];
  });
  if (anchors.length === 0) return () => {};

  // Every navigable section (3D or not) for the active-nav indicator.
  const navSections = Array.from(document.querySelectorAll<HTMLElement>("main [data-nav]")).map((el) => ({
    el,
    nav: el.dataset.nav as NavId,
    top: 0,
  }));

  let lastOpacity = -1;

  const update = () => {
    const y = window.scrollY;
    const centre = y + window.innerHeight / 2;

    let g = anchors[0].index;
    if (y >= anchors[anchors.length - 1].at) {
      g = anchors[anchors.length - 1].index;
    } else {
      for (let k = 0; k < anchors.length - 1; k++) {
        const a = anchors[k];
        const b = anchors[k + 1];
        if (y >= a.at && y < b.at) {
          const raw = (y - a.at) / Math.max(1, b.at - a.at);
          // Reduced motion: cut between stations at the midpoint instead of flying.
          const t = reduced ? (raw < 0.5 ? 0 : 1) : smoothstep(0.15, 0.85, raw);
          g = a.index + (b.index - a.index) * t;
          break;
        }
      }
    }
    world.g = g;
    const last = anchors[anchors.length - 1];
    world.tail = y > last.at ? (y - last.at) / window.innerHeight : 0;

    for (const a of anchors) world.progress[a.id] = clamp01((centre - a.top) / Math.max(1, a.height));
    let nav: NavId = navSections[0]?.nav ?? anchors[0].nav;
    for (const s of navSections) if (centre >= s.top) nav = s.nav;
    activeNav.set(nav);

    const opacity = stationOpacity(g);
    world.opacity = opacity;
    if (stage && Math.abs(opacity - lastOpacity) > 0.002) {
      stage.style.opacity = opacity.toFixed(3);
      stage.style.visibility = opacity < 0.01 ? "hidden" : "visible";
      lastOpacity = opacity;
    }

    notifyWorld();
  };

  const measure = () => {
    const y = window.scrollY;
    const vh = window.innerHeight;
    for (const a of anchors) {
      const rect = a.el.getBoundingClientRect();
      a.top = rect.top + y;
      a.height = rect.height;
      a.at = a.el.dataset.worldAnchor === "top" ? a.top : a.top + a.height / 2 - vh / 2;
    }
    for (const s of navSections) s.top = s.el.getBoundingClientRect().top + y;
    anchors[0].at = Math.min(anchors[0].at, 0);
    for (let k = 1; k < anchors.length; k++) anchors[k].at = Math.max(anchors[k].at, anchors[k - 1].at + 1);
    update();
  };

  const trigger = ScrollTrigger.create({ start: 0, end: "max", onUpdate: update });
  ScrollTrigger.addEventListener("refresh", measure);
  measure();

  return () => {
    trigger.kill();
    ScrollTrigger.removeEventListener("refresh", measure);
  };
}
