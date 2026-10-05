"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  BufferGeometry,
  Float32BufferAttribute,
  Line,
  LineBasicMaterial,
  MeshBasicMaterial,
  QuadraticBezierCurve3,
  SphereGeometry,
  Vector3,
  type Group,
} from "three";
import { world } from "@/lib/world";
import { useWorldConfig } from "../shared/config";
import { Glow } from "../shared/Glow";
import { IconNode, type NodeState } from "../shared/IconNode";
import { createGlowMaterial, PALETTE } from "../shared/materials";
import { smoothstep } from "../shared/pointer";
import { useDisposable } from "../shared/useDisposable";
import { CHAINS, EDGE_SHAPE, GRAPH_NODES, LANE_COLOR, LINKS, nodeByKey } from "./graph";

const SHELL = 1.45;
const POINTS = 48;
/** Fraction of each packet cycle spent travelling; the rest is a pause. */
const TRAVEL = 0.72;

interface Edge {
  from: string;
  to: string;
  color: string;
  faint: boolean;
  curve: QuadraticBezierCurve3;
  /** Intro reveal start (world.intro units). */
  start: number;
}

function makeCurve(from: string, to: string, faint: boolean) {
  const [bend, lift] = EDGE_SHAPE[`${from}>${to}`] ?? (faint ? [1.04, 0.2] : [1.14, 0.35]);
  const a = new Vector3(...nodeByKey[from].pos);
  const b = new Vector3(...nodeByKey[to].pos);
  const mid = a.clone().add(b).multiplyScalar(0.5 * bend);
  mid.z += lift;
  return new QuadraticBezierCurve3(a, mid, b);
}

function buildEdges(): Edge[] {
  const edges: Edge[] = [];
  const seen = new Set<string>();
  let order = 0;
  for (const chain of CHAINS) {
    chain.nodes.slice(0, -1).forEach((from, k) => {
      const to = chain.nodes[k + 1];
      const id = `${from}>${to}`;
      if (seen.has(id)) return;
      seen.add(id);
      edges.push({ from, to, color: PALETTE.fg, faint: false, curve: makeCurve(from, to, false), start: 0.32 + order * 0.05 });
      order++;
    });
  }
  for (const [from, to] of LINKS) {
    edges.push({ from, to, color: PALETTE.muted, faint: true, curve: makeCurve(from, to, true), start: 0.32 + order * 0.04 });
    order++;
  }
  return edges;
}

/**
 * Technology constellation: two lanes wired into the core, lines drawing in
 * during the intro, packets travelling each lane and lighting nodes as they
 * pass. `openness` comes from the station (open in the hero, faint at contact).
 */
export function Constellation({ openness }: { openness: { value: number } }) {
  const { reduced } = useWorldConfig();
  const packets = useRef<(Group | null)[]>([]);

  const edges = useMemo(() => buildEdges(), []);
  const appearAt = useMemo(() => {
    const at: Record<string, number> = {};
    for (const node of GRAPH_NODES) {
      const touching = edges.filter((e) => e.from === node.key || e.to === node.key);
      at[node.key] = Math.min(...touching.map((e) => (e.to === node.key ? e.start + 0.08 : e.start)));
    }
    return at;
  }, [edges]);
  const states = useMemo(
    () => Object.fromEntries(GRAPH_NODES.map((n) => [n.key, { appear: 0, lit: 0 } as NodeState])),
    [],
  );
  const tmp = useMemo(() => new Vector3(), []);

  const lines = useDisposable(() => {
    const items = edges.map((edge) => {
      const geometry = new BufferGeometry().setFromPoints(edge.curve.getPoints(POINTS));
      const material = new LineBasicMaterial({ color: edge.color, transparent: true, opacity: 0.5, depthWrite: false });
      return new Line(geometry, material);
    });
    return {
      items,
      dispose() {
        items.forEach((line) => {
          line.geometry.dispose();
          (line.material as LineBasicMaterial).dispose();
        });
      },
    };
  }, [edges]);

  // Every technology is wired back into the core.
  const spokeGeometry = useDisposable(() => {
    const pts: number[] = [];
    for (const node of GRAPH_NODES) {
      const dir = new Vector3(...node.pos).normalize();
      pts.push(dir.x * SHELL, dir.y * SHELL, dir.z * SHELL, ...node.pos);
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute(pts, 3));
    return geometry;
  }, []);
  const spokeMaterial = useDisposable(
    () => new LineBasicMaterial({ color: PALETTE.muted, transparent: true, opacity: 0.08, depthWrite: false }),
    [],
  );
  const packetGeometry = useDisposable(() => new SphereGeometry(0.06, 12, 12), []);
  const packetMaterial = useDisposable(() => new MeshBasicMaterial({ color: "#f2fbff", transparent: true }), []);
  const packetGlows = useDisposable(() => {
    const items = CHAINS.map((chain) => createGlowMaterial(chain.color, 1));
    return { items, dispose: () => items.forEach((m) => m.dispose()) };
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const open = openness.value;
    const intro = reduced ? 1 : world.intro;

    lines.items.forEach((line, i) => {
      const edge = edges[i];
      const reveal = reduced ? 1 : smoothstep(edge.start, edge.start + 0.12, intro);
      line.visible = open > 0.01;
      line.geometry.setDrawRange(0, Math.ceil((POINTS + 1) * reveal));
      (line.material as LineBasicMaterial).opacity = (edge.faint ? 0.26 : 0.6) * open;
    });
    spokeMaterial.opacity = 0.08 * smoothstep(0.3, 0.6, intro) * open;

    for (const node of GRAPH_NODES) {
      const s = states[node.key];
      s.appear = (reduced ? 1 : smoothstep(appearAt[node.key], appearAt[node.key] + 0.1, intro)) * open;
      s.lit = 0;
    }

    const live = reduced ? 0 : smoothstep(0.85, 1, intro) * open;
    CHAINS.forEach((chain, c) => {
      const packet = packets.current[c];
      const hops = chain.nodes.length - 1;
      const cycle = ((t + chain.offset) % chain.period) / chain.period;
      const travelling = cycle < TRAVEL && live > 0.01;
      const s = (cycle / TRAVEL) * hops;
      if (packet) {
        packet.visible = travelling;
        if (travelling) {
          const hop = Math.min(hops - 1, Math.floor(s));
          const edge = edges.find((e) => e.from === chain.nodes[hop] && e.to === chain.nodes[hop + 1]);
          edge?.curve.getPoint(s - hop, tmp);
          packet.position.copy(tmp);
          packet.scale.setScalar(live);
        }
      }
      if (travelling) {
        chain.nodes.forEach((key, k) => {
          states[key].lit = Math.max(states[key].lit, Math.max(0, 1 - Math.abs(s - k) * 1.4) * live);
        });
      }
    });
  });

  return (
    <group>
      <lineSegments geometry={spokeGeometry} material={spokeMaterial} />
      {lines.items.map((line, i) => (
        <primitive key={i} object={line} />
      ))}
      {CHAINS.map((chain, c) => (
        <group
          key={chain.lane}
          ref={(el) => {
            packets.current[c] = el;
          }}
          visible={false}
        >
          <mesh geometry={packetGeometry} material={packetMaterial} />
          <Glow material={packetGlows.items[c]} size={0.7} />
        </group>
      ))}
      {GRAPH_NODES.map((node) => (
        <IconNode key={node.key} icon={node.icon} label={node.label} color={LANE_COLOR[node.lane]} position={node.pos} state={states[node.key]} />
      ))}
    </group>
  );
}
