"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshBasicMaterial, PlaneGeometry, type Group, type Mesh } from "three";
import { codeSnippets } from "@/data/architecture";
import { clamp01 } from "@/lib/stations";
import { world } from "@/lib/world";
import { useCanvasTexture } from "../shared/canvasTexture";
import { useWorldConfig } from "../shared/config";
import { PALETTE } from "../shared/materials";
import { useDisposable } from "../shared/useDisposable";
import { CODE_LINE, CODE_TEXTURE, codePainter } from "./codePainter";

const EXTRA = [
  {
    id: "next",
    file: "app/api/projects/route.ts",
    lines: ["export async function GET() {", "  const projects = await getProjects();", "  return Response.json(projects);", "}"],
  },
  {
    id: "types",
    file: "types/project.ts",
    lines: ["interface Project {", "  title: string;", '  stack: ("MERN" | "Flutter")[];', "  liveUrl?: string;", "}"],
  },
];

const PANELS = [
  ...codeSnippets.map((s) => ({ id: s.id, file: s.file, lines: s.lines })),
  ...EXTRA,
].map((panel, i) => ({
  ...panel,
  accent: [PALETTE.web, PALETTE.server, PALETTE.server, PALETTE.mobile, PALETTE.web, PALETTE.muted][i],
}));

/** Placement across the hero and the programmer-intro stations (world space). */
const LAYOUT: { pos: [number, number, number]; rot: number; scale: number }[] = [
  { pos: [-9.4, -6.4, -7], rot: 0.35, scale: 0.95 },
  { pos: [9.6, -3.6, -8], rot: -0.4, scale: 1 },
  { pos: [-5.8, -10.2, -3.5], rot: 0.3, scale: 0.9 },
  { pos: [5.6, -13.6, -2.5], rot: -0.32, scale: 0.95 },
  { pos: [-7.4, -15.2, -6], rot: 0.4, scale: 0.85 },
  { pos: [6.8, -8.6, -6.5], rot: -0.35, scale: 0.85 },
];

const W = 3.4;
const H = (W * CODE_TEXTURE.height) / CODE_TEXTURE.width;

/**
 * Floating editor panels with real code (React, Express, MongoDB, Flutter,
 * Next.js route, TypeScript type). A highlight steps down the lines like a
 * cursor executing them. Visible around the hero and the intro, then fades.
 */
export function CodeField() {
  const root = useRef<Group>(null);

  useFrame(() => {
    const group = root.current;
    if (!group) return;
    // Full in the hero and intro (g ≤ 1), gone by the frontend station.
    group.visible = world.g < 2;
  });

  return (
    <group ref={root}>
      {PANELS.map((panel, i) => (
        <CodePanel key={panel.id} index={i} file={panel.file} lines={panel.lines} accent={panel.accent} />
      ))}
    </group>
  );
}

function CodePanel({ index, file, lines, accent }: { index: number; file: string; lines: string[]; accent: string }) {
  const { reduced, tier } = useWorldConfig();
  const ref = useRef<Group>(null);
  const highlight = useRef<Mesh>(null);
  const layout = LAYOUT[index];

  const painter = useMemo(() => codePainter(file, lines, accent), [file, lines, accent]);
  const texture = useCanvasTexture(tier === "high" ? CODE_TEXTURE.width : 640, tier === "high" ? CODE_TEXTURE.height : 350, painter);
  const plane = useDisposable(() => new PlaneGeometry(W, H), []);
  const material = useDisposable(
    () => new MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, toneMapped: false }),
    [texture],
  );
  const barGeometry = useDisposable(() => new PlaneGeometry(W * 0.94, (H * CODE_LINE.height) / CODE_TEXTURE.height), []);
  const barMaterial = useDisposable(
    () => new MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.12, depthWrite: false, toneMapped: false }),
    [accent],
  );

  useFrame((state) => {
    const g = ref.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const fade = clamp01(2 - world.g) * (0.35 + 0.65 * clamp01(world.intro * 1.4 - 0.3));
    material.opacity = fade * 0.9;
    barMaterial.opacity = fade * 0.14;
    if (!reduced) {
      g.position.y = layout.pos[1] + Math.sin(t * 0.4 + index * 1.3) * 0.12;
      g.rotation.y = layout.rot + Math.sin(t * 0.2 + index) * 0.04;
    }
    // Line activation: step through lines like an executing cursor.
    const bar = highlight.current;
    if (bar) {
      const line = reduced ? 0 : Math.floor(t * 1.6 + index * 2) % lines.length;
      const y = CODE_LINE.top + line * CODE_LINE.height;
      bar.position.y = H / 2 - (y / CODE_TEXTURE.height) * H;
    }
  });

  return (
    <group ref={ref} position={layout.pos} rotation-y={layout.rot} scale={layout.scale}>
      <mesh geometry={plane} material={material} renderOrder={1} />
      <mesh ref={highlight} geometry={barGeometry} material={barMaterial} position-z={0.005} renderOrder={2} />
    </group>
  );
}
