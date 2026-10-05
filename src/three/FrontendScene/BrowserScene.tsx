"use client";

import { useMemo, useRef } from "react";
import { ContactShadows } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import {
  BufferGeometry,
  Float32BufferAttribute,
  LineBasicMaterial,
  MeshBasicMaterial,
  PlaneGeometry,
  SphereGeometry,
  type Group,
  type LineSegments,
  type Mesh,
} from "three";
import { frontendLayers } from "@/data/architecture";
import type { TechId } from "@/data/technologies";
import { layerAtProgress, lerp, SCENE_ORIGIN, smoothstep, stationWeight } from "@/lib/stations";
import { hoveredLayer, sceneCursor, world, worldIndex } from "@/lib/world";
import { useCanvasTexture } from "../shared/canvasTexture";
import { useWorldConfig } from "../shared/config";
import { IconNode, type NodeState } from "../shared/IconNode";
import { PALETTE } from "../shared/materials";
import { damp } from "../shared/pointer";
import { NearStation } from "../shared/NearStation";
import { useDisposable } from "../shared/useDisposable";
import { LAYER_TEXTURE, layerPainter } from "./layerPainters";

const INDEX = worldIndex("frontend");
const W = 4.4;
const H = (W * LAYER_TEXTURE.height) / LAYER_TEXTURE.width;
const COUNT = frontendLayers.length;

const TECHS: { id: TechId; pos: [number, number, number] }[] = [
  { id: "react", pos: [-3.3, 1.5, -0.6] },
  { id: "nextjs", pos: [-3.0, -0.6, -1.4] },
  { id: "typescript", pos: [3.2, 1.2, -1.8] },
  { id: "tailwind", pos: [2.9, -1.2, 0.4] },
  { id: "gsap", pos: [0.4, 2.3, 0.6] },
];


/**
 * Frontend architecture as a 3D browser: the rendered page in front, and
 * behind it the component tree, state and API calls, separating in depth as
 * the chapter scrolls in. Layers are hoverable (raycast); the technologies
 * that own the hovered layer light up around the window.
 */
export function BrowserScene() {
  const { reduced } = useWorldConfig();
  const root = useRef<Group>(null);
  const connectors = useRef<LineSegments>(null);
  const pulse = useRef<Mesh>(null);
  const shared = useMemo(() => ({ spacing: 0.2, weight: 0, active: 0 }), []);
  const techStates = useMemo(
    () => Object.fromEntries(TECHS.map((t) => [t.id, { appear: 0, lit: 0 } as NodeState])) as Record<TechId, NodeState>,
    [],
  );

  const connectorGeometry = useDisposable(() => {
    const pts: number[] = [];
    for (const [x, y] of [
      [-W / 2, H / 2],
      [W / 2, H / 2],
      [-W / 2, -H / 2],
      [W / 2, -H / 2],
    ]) {
      pts.push(x, y, 0, x, y, -1);
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute(pts, 3));
    return geometry;
  }, []);
  const connectorMaterial = useDisposable(
    () => new LineBasicMaterial({ color: PALETTE.web, transparent: true, opacity: 0.2, depthWrite: false }),
    [],
  );
  const pulseGeometry = useDisposable(() => new SphereGeometry(0.07, 12, 12), []);
  const pulseMaterial = useDisposable(() => new MeshBasicMaterial({ color: "#bff3ff", transparent: true }), []);

  useFrame((state) => {
    const group = root.current;
    if (!group) return;
    const w = stationWeight(world.g, INDEX);
    group.visible = w > 0.001;
    if (!group.visible) return;

    const p = world.progress.frontend;
    const explode = reduced ? 1 : smoothstep(0.08, 0.45, p) * (0.4 + 0.6 * w);
    shared.spacing = lerp(0.12, 1.05, explode);
    shared.weight = w;
    const hovered = hoveredLayer.get();
    shared.active = hovered >= 0 ? hovered : layerAtProgress(p, COUNT);

    group.scale.setScalar(0.86 + 0.14 * w);
    group.rotation.y = -0.62 + (reduced ? 0 : (1 - w) * 0.6 + world.pointer.x * 0.1);
    group.rotation.x = 0.08 - (reduced ? 0 : world.pointer.y * 0.05);

    const depth = shared.spacing * (COUNT - 1);
    connectors.current?.scale.set(1, 1, Math.max(depth, 0.001));
    connectorMaterial.opacity = 0.22 * w;

    if (pulse.current) {
      // Data flows from the API layer forward to the rendered UI.
      const phase = reduced ? 1 : (state.clock.elapsedTime * 0.5) % 1;
      pulse.current.position.set(W / 2, -H / 2, -depth + depth * phase);
      pulseMaterial.opacity = Math.sin(phase * Math.PI) * w;
    }

    const owners = frontendLayers[shared.active]?.techs ?? [];
    for (const t of TECHS) {
      techStates[t.id].appear = smoothstep(0.4, 1, w);
      techStates[t.id].lit = owners.includes(t.id) ? 1 : 0;
    }
  });

  return (
    <group position={SCENE_ORIGIN.frontend}>
      <group ref={root}>
        <lineSegments ref={connectors} geometry={connectorGeometry} material={connectorMaterial} />
        <NearStation index={INDEX}>
          <ContactShadows position={[0, -2.1, -1.2]} opacity={0.4} scale={[7, 5]} blur={2.8} far={3} resolution={256} color="#000000" />
        </NearStation>
        <mesh ref={pulse} geometry={pulseGeometry} material={pulseMaterial} />
        {frontendLayers.map((layer, i) => (
          <Layer key={layer.id} index={i} shared={shared} />
        ))}
        {TECHS.map((t) => (
          <IconNode key={t.id} icon={t.id} label={null} color={PALETTE.web} position={t.pos} scale={0.75} state={techStates[t.id]} />
        ))}
      </group>
    </group>
  );
}

function Layer({ index, shared }: { index: number; shared: { spacing: number; weight: number; active: number } }) {
  const { reduced, tier } = useWorldConfig();
  const ref = useRef<Group>(null);
  const lift = useRef(0);
  const layer = frontendLayers[index];

  const painter = useMemo(() => layerPainter(layer, index), [layer, index]);
  const size = tier === "high" ? LAYER_TEXTURE : { width: 640, height: 400 };
  const texture = useCanvasTexture(size.width, size.height, painter);
  const plane = useDisposable(() => new PlaneGeometry(W, H), []);
  const material = useDisposable(
    () => new MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, toneMapped: false }),
    [texture],
  );

  useFrame((_, delta) => {
    const g = ref.current;
    if (!g) return;
    const focused = shared.active === index ? 1 : 0;
    lift.current = reduced ? focused : damp(lift.current, focused, 6, Math.min(delta, 0.05));
    g.position.z = -index * shared.spacing + lift.current * 0.35;
    g.position.x = lift.current * 0.2;
    material.opacity = (0.42 + 0.58 * Math.max(lift.current, index === 0 ? 0.55 : 0)) * shared.weight;
  });

  return (
    <group ref={ref}>
      <mesh
        geometry={plane}
        material={material}
        renderOrder={COUNT - index}
        onPointerOver={(event) => {
          event.stopPropagation();
          hoveredLayer.set(index);
          sceneCursor.set("interactive");
        }}
        onPointerOut={() => {
          if (hoveredLayer.get() === index) hoveredLayer.set(-1);
          sceneCursor.set("default");
        }}
      />
    </group>
  );
}
