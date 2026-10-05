"use client";

import { useMemo, useRef } from "react";
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

function panelPainter(project: Project): Painter {
  return (ctx, w, h) => {
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
    ctx.font = `500 20px ${mono}`;
    ctx.fillStyle = project.accent;
    ctx.fillText(project.type.toUpperCase(), 32, 52);
    ctx.font = `600 52px ${sans}`;
    ctx.fillStyle = "#f5f7fa";
    ctx.fillText(project.title, 30, 116);
    // Mini interface sketch.
    ctx.fillStyle = "rgba(245,247,250,0.06)";
    roundRect(ctx, 30, 150, w - 60, h - 230, 12);
    ctx.fill();
    ctx.fillStyle = "rgba(245,247,250,0.16)";
    for (let i = 0; i < 4; i++) {
      roundRect(ctx, 52, 176 + i * 30, (w - 200) * (0.9 - i * 0.15), 12, 6);
      ctx.fill();
    }
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = project.accent;
    roundRect(ctx, w - 190, 176, 136, 110, 10);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.font = `400 20px ${mono}`;
    ctx.fillStyle = "rgba(139,145,156,0.9)";
    ctx.fillText(project.stack.map((s) => techById[s].name).join(" · "), 32, h - 40, w - 64);
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

  const painter = useMemo(() => panelPainter(project), [project]);
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
