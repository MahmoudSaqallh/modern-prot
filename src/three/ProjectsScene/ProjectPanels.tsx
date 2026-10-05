"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshBasicMaterial, PlaneGeometry, Vector3, type Group } from "three";
import { projects, type Project } from "@/data/projects";
import { techById } from "@/data/technologies";
import { SCENE_ORIGIN, stationWeight } from "@/lib/stations";
import { activeProject, world, worldIndex } from "@/lib/world";
import { fontStack, roundRect, useCanvasTexture, type Painter } from "../shared/canvasTexture";
import { useWorldConfig } from "../shared/config";
import { Glow } from "../shared/Glow";
import { createGlowMaterial } from "../shared/materials";
import { damp } from "../shared/pointer";
import { dampVec } from "../shared/rig";
import { useDisposable } from "../shared/useDisposable";

const INDEX = worldIndex("projects");
const W = 3.2;
const H = 2;

/** Small optimised copy of the screenshot (Next image optimiser), enough for a panel. */
const shotUrl = (src: string) => `/_next/image?url=${encodeURIComponent(src)}&w=640&q=75`;

/** Draw `img` to fill the rect (cover, anchored to the top like the cards). */
function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const sw = w / scale;
  const sh = h / scale;
  ctx.drawImage(img, (img.naturalWidth - sw) / 2, 0, sw, sh, x, y, w, h);
}

function panelPainter(project: Project, shot: HTMLImageElement | null): Painter {
  return (ctx, width, height) => {
    // Laid out on a 640×400 design canvas, scaled to the tier's texture size.
    const w = 640;
    const h = 400;
    ctx.save();
    ctx.scale(width / w, height / h);
    const mono = fontStack("mono");
    const sans = fontStack("sans");
    ctx.fillStyle = "rgba(12,14,18,0.95)";
    roundRect(ctx, 2, 2, w - 4, h - 4, 18);
    ctx.fill();
    ctx.strokeStyle = "rgba(245,247,250,0.14)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = project.accent;
    ctx.fillRect(2, 2, w - 4, 6);
    ctx.font = `500 17px ${mono}`;
    ctx.fillStyle = project.accent;
    ctx.fillText(project.type.toUpperCase(), 26, 40);
    ctx.font = `600 38px ${sans}`;
    ctx.fillStyle = "#f5f7fa";
    ctx.fillText(project.title, 24, 84, w - 48);

    // The real screenshot once loaded; a mini interface sketch until then.
    const [sx, sy, sw, sh] = [24, 104, w - 48, 240];
    ctx.fillStyle = "rgba(245,247,250,0.06)";
    roundRect(ctx, sx, sy, sw, sh, 10);
    ctx.fill();
    if (shot) {
      ctx.save();
      roundRect(ctx, sx, sy, sw, sh, 10);
      ctx.clip();
      drawCover(ctx, shot, sx, sy, sw, sh);
      ctx.restore();
    } else {
      ctx.fillStyle = "rgba(245,247,250,0.16)";
      for (let i = 0; i < 4; i++) {
        roundRect(ctx, sx + 22, sy + 28 + i * 30, (sw - 200) * (0.9 - i * 0.15), 12, 6);
        ctx.fill();
      }
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = project.accent;
      roundRect(ctx, sx + sw - 160, sy + 28, 136, 110, 10);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.font = `400 17px ${mono}`;
    ctx.fillStyle = "rgba(139,145,156,0.9)";
    ctx.fillText(project.stack.map((s) => techById[s].name).join(" · "), 26, h - 24, w - 52);
    ctx.restore();
  };
}

/** Behind the card grid (below the heading), spread across the width. */
const LAYOUT: [number, number, number][] = [
  [-6.4, -0.9, -6],
  [-2.2, -0.3, -7],
  [2.3, -0.6, -6.5],
  [6.5, -1.1, -6],
  [-5.2, -3.7, -5.5],
  [0.2, -4.3, -6.5],
  [5.4, -3.5, -5.5],
  [-6.6, -6.8, -6.2],
  [-1.6, -7.4, -7],
  [3.6, -7, -6.4],
  [8.2, -6.4, -6.8],
];

const FOCUS = new Vector3(0, 0.3, 4.2);

/**
 * Floating project panels behind the card grid. When a project is opened,
 * its panel flies forward to meet the camera and the rest recede.
 */
export function ProjectPanels() {
  const root = useRef<Group>(null);

  useFrame(() => {
    const group = root.current;
    if (!group) return;
    group.visible = stationWeight(world.g, INDEX) > 0.001;
  });

  return (
    <group position={SCENE_ORIGIN.projects}>
      <group ref={root}>
        {projects.map((project, i) => (
          <Panel key={project.slug} project={project} index={i} />
        ))}
      </group>
    </group>
  );
}

function Panel({ project, index }: { project: Project; index: number }) {
  const { reduced, tier } = useWorldConfig();
  const ref = useRef<Group>(null);
  const home = useMemo(() => new Vector3(...LAYOUT[index % LAYOUT.length]), [index]);
  const target = useMemo(() => new Vector3(), []);
  const focus = useRef(0);

  // Screenshot loads in the background; the panel repaints with it when ready.
  const [shot, setShot] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    if (!project.image) return;
    let alive = true;
    const img = new Image();
    img.decoding = "async";
    img.onload = () => alive && setShot(img);
    img.src = shotUrl(project.image);
    return () => {
      alive = false;
      img.onload = null;
    };
  }, [project.image]);

  const painter = useMemo(() => panelPainter(project, shot), [project, shot]);
  const texture = useCanvasTexture(tier === "high" ? 640 : 448, tier === "high" ? 400 : 280, painter);
  const plane = useDisposable(() => new PlaneGeometry(W, H), []);
  const material = useDisposable(() => new MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, toneMapped: false }), [texture]);
  const glow = useDisposable(() => createGlowMaterial(project.accent, 0), [project.accent]);

  useFrame((state, delta) => {
    const g = ref.current;
    if (!g) return;
    const dt = Math.min(delta, 0.05);
    const w = stationWeight(world.g, INDEX);
    const open = activeProject.get();
    const mine = open === project.slug ? 1 : 0;
    focus.current = reduced ? mine : damp(focus.current, mine, 3.5, dt);
    const others = open && !mine ? 1 : 0;

    target.copy(home);
    if (!reduced) target.y += Math.sin(state.clock.elapsedTime * 0.35 + index * 1.7) * 0.15;
    target.z -= others * 3;
    target.lerp(FOCUS, focus.current);
    if (reduced) g.position.copy(target);
    else dampVec(g.position, target, 4, dt);

    g.rotation.y = (1 - focus.current) * -home.x * 0.04;
    g.scale.setScalar(1 + focus.current * 0.5);
    // Quiet behind the grid; full strength only for the opened project.
    material.opacity = w * (others ? 0.15 : 0.4 + focus.current * 0.6);
    glow.uniforms.uOpacity.value = w * focus.current * 0.8;
  });

  return (
    <group ref={ref} position={home}>
      <Glow material={glow} size={6} position={[0, 0, -0.3]} />
      <mesh geometry={plane} material={material} renderOrder={3} />
    </group>
  );
}
