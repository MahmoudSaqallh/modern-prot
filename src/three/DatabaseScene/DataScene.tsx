"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  BufferGeometry,
  Line,
  LineDashedMaterial,
  MeshBasicMaterial,
  PlaneGeometry,
  QuadraticBezierCurve3,
  SphereGeometry,
  Vector3,
  type Group,
} from "three";
import { collections } from "@/data/architecture";
import { SCENE_ORIGIN, smoothstep, stationWeight } from "@/lib/stations";
import { world, worldIndex } from "@/lib/world";
import { fontStack, roundRect, useCanvasTexture, type Painter } from "../shared/canvasTexture";
import { useWorldConfig } from "../shared/config";
import { Glow } from "../shared/Glow";
import { createGlowMaterial, PALETTE } from "../shared/materials";
import { damp } from "../shared/pointer";
import { useDisposable } from "../shared/useDisposable";

const INDEX = worldIndex("database");
/** Query engine: where the core sits over the data (see STATIONS.database). */
const SOURCE = new Vector3(0, 2.9, -1.6);

const POSITIONS: Record<string, [number, number, number]> = {
  users: [-2.5, 0.75, 0],
  projects: [2.5, 0.75, 0],
  orders: [-2.5, -1.95, 0.3],
  messages: [2.5, -1.95, 0.3],
};

const RELATIONS: { from: string; to: string; key: string }[] = [
  { from: "orders", to: "users", key: "userId" },
  { from: "messages", to: "orders", key: "room" },
  { from: "projects", to: "users", key: "ownerId" },
];

const QUERIES: Record<string, string> = {
  users: 'db.users.find({ role: "customer" })',
  projects: 'db.projects.find({ status: "live" })',
  orders: 'db.orders.find({ status: "delivered" })',
  messages: 'db.messages.find({ room: "order:4821" })',
};

const CARD_W = 1.75;
const CARD_H = 1.08;
const QUERY_TIME = 1.1;
const HOLD = 1.6;
const RETURN = 0.9;
const TOTAL = QUERY_TIME + HOLD + RETURN;

function docPainter(name: string, count: number, sample: Record<string, string>): Painter {
  return (ctx, w, h) => {
    const mono = fontStack("mono");
    ctx.fillStyle = "rgba(9,14,12,0.95)";
    roundRect(ctx, 2, 2, w - 4, h - 4, 16);
    ctx.fill();
    ctx.strokeStyle = "rgba(52,211,153,0.45)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.font = `600 26px ${mono}`;
    ctx.fillStyle = PALETTE.data;
    ctx.fillText(name, 24, 42);
    ctx.font = `400 20px ${mono}`;
    ctx.fillStyle = "rgba(139,145,156,0.8)";
    ctx.textAlign = "right";
    ctx.fillText(`${count.toLocaleString("en-US")} docs`, w - 24, 42);
    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(245,247,250,0.08)";
    ctx.fillRect(2, 60, w - 4, 2);
    ctx.font = `400 21px ${mono}`;
    Object.entries(sample).forEach(([key, value], i) => {
      const y = 98 + i * 34;
      ctx.fillStyle = PALETTE.web;
      ctx.fillText(key, 28, y);
      const kw = ctx.measureText(`${key}: `).width;
      ctx.fillStyle = "#8a93a0";
      ctx.fillText(":", 28 + ctx.measureText(key).width, y);
      ctx.fillStyle = "#d7dce2";
      ctx.fillText(value, 28 + kw, y, w - 56 - kw);
    });
  };
}

const queryPainter =
  (text: string): Painter =>
  (ctx, w, h) => {
    ctx.fillStyle = "rgba(10,12,15,0.92)";
    roundRect(ctx, 2, 2, w - 4, h - 4, 14);
    ctx.fill();
    ctx.strokeStyle = "rgba(52,211,153,0.55)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.font = `500 26px ${fontStack("mono")}`;
    ctx.fillStyle = "#d7dce2";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 22, h / 2 + 1, w - 44);
  };

/**
 * MongoDB as documents in space: four collections, their relationships, and
 * a query that leaves the core, reaches the selected collection, lifts the
 * matching documents and returns with the result.
 */
export function DataScene() {
  const { reduced } = useWorldConfig();
  const root = useRef<Group>(null);
  const packet = useRef<Group>(null);
  const run = useRef({ start: -100, lastId: 0, lastAuto: 0, collection: "projects" });
  const point = useMemo(() => new Vector3(), []);
  const lift = useMemo(() => Object.fromEntries(collections.map((c) => [c.name, { value: 0 }])), []);
  const select = useMemo(() => Object.fromEntries(collections.map((c) => [c.name, { value: 0 }])), []);

  const queryCurves = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(POSITIONS).map(([name, pos]) => {
          const end = new Vector3(pos[0], pos[1] + CARD_H / 2 + 0.1, pos[2] + 0.4);
          const mid = SOURCE.clone().add(end).multiplyScalar(0.5);
          mid.z += 1.2;
          return [name, new QuadraticBezierCurve3(SOURCE.clone(), mid, end)];
        }),
      ),
    [],
  );

  const relations = useDisposable(() => {
    const items = RELATIONS.map(({ from, to }) => {
      const a = new Vector3(...POSITIONS[from]);
      const b = new Vector3(...POSITIONS[to]);
      const mid = a.clone().add(b).multiplyScalar(0.5);
      mid.x += Math.sign(mid.x || 1) * 1.1;
      mid.z -= 0.6;
      const geometry = new BufferGeometry().setFromPoints(new QuadraticBezierCurve3(a, mid, b).getPoints(40));
      const line = new Line(
        geometry,
        new LineDashedMaterial({ color: PALETTE.data, dashSize: 0.14, gapSize: 0.1, transparent: true, opacity: 0.35, depthWrite: false }),
      );
      line.computeLineDistances();
      return line;
    });
    return {
      items,
      dispose: () =>
        items.forEach((l) => {
          l.geometry.dispose();
          (l.material as LineDashedMaterial).dispose();
        }),
    };
  }, []);

  const packetGeometry = useDisposable(() => new SphereGeometry(0.07, 12, 12), []);
  const packetMaterial = useDisposable(() => new MeshBasicMaterial({ color: "#eafff3", transparent: true }), []);
  const packetGlow = useDisposable(() => createGlowMaterial(PALETTE.data, 1), []);

  useFrame((state, delta) => {
    const group = root.current;
    if (!group) return;
    const w = stationWeight(world.g, INDEX);
    group.visible = w > 0.001;
    if (!group.visible) return;
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    const r = run.current;

    if (world.queryId !== r.lastId) {
      r.lastId = world.queryId;
      r.start = t;
      r.collection = world.collection;
    } else if (!reduced && w > 0.6 && t - r.start > TOTAL + 1 && t - r.lastAuto > 6.5) {
      r.lastAuto = t;
      r.start = t;
      r.collection = world.collection;
    }
    const e = reduced ? QUERY_TIME + 0.1 : t - r.start;

    group.scale.setScalar(0.88 + 0.12 * w);
    group.rotation.y = -0.22 + (reduced ? 0 : (1 - w) * 0.5 + world.pointer.x * 0.08);

    let visible = false;
    if (e >= 0 && e < QUERY_TIME) {
      queryCurves[r.collection].getPoint(smoothstep(0, 1, e / QUERY_TIME), point);
      visible = true;
    } else if (e >= QUERY_TIME + HOLD && e < TOTAL) {
      queryCurves[r.collection].getPoint(1 - smoothstep(0, 1, (e - QUERY_TIME - HOLD) / RETURN), point);
      visible = true;
    }
    if (packet.current) {
      packet.current.visible = visible && !reduced;
      if (visible) packet.current.position.copy(point);
    }

    const matched = e >= QUERY_TIME - 0.05 && e < QUERY_TIME + HOLD + RETURN * 0.5;
    for (const c of collections) {
      const target = matched && c.name === r.collection ? 1 : 0;
      lift[c.name].value = reduced ? (c.name === world.collection ? 1 : 0) : damp(lift[c.name].value, target, 7, dt);
      select[c.name].value = reduced ? (c.name === world.collection ? 1 : 0) : damp(select[c.name].value, c.name === world.collection ? 1 : 0, 6, dt);
    }
    relations.items.forEach((line) => {
      (line.material as LineDashedMaterial).opacity = 0.35 * w;
    });
  });

  return (
    <group position={SCENE_ORIGIN.database}>
      <group ref={root}>
        {relations.items.map((line, i) => (
          <primitive key={i} object={line} />
        ))}
        {collections.map((c) => (
          <Collection key={c.name} name={c.name} count={c.count} sample={c.sample} lift={lift[c.name]} select={select[c.name]} />
        ))}
        {Object.keys(QUERIES).map((name) => (
          <QueryPlate key={name} name={name} />
        ))}
        <group ref={packet} visible={false}>
          <mesh geometry={packetGeometry} material={packetMaterial} />
          <Glow material={packetGlow} size={0.8} />
        </group>
      </group>
    </group>
  );
}

function Collection({
  name,
  count,
  sample,
  lift,
  select,
}: {
  name: string;
  count: number;
  sample: Record<string, string>;
  lift: { value: number };
  select: { value: number };
}) {
  const { tier } = useWorldConfig();
  const refs = useRef<(Group | null)[]>([]);
  const painter = useMemo(() => docPainter(name, count, sample), [name, count, sample]);
  const texture = useCanvasTexture(tier === "high" ? 560 : 400, tier === "high" ? 346 : 247, painter);
  const plane = useDisposable(() => new PlaneGeometry(CARD_W, CARD_H), []);
  const materials = useDisposable(() => {
    const list = [0, 1, 2].map(() => new MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, toneMapped: false }));
    return { list, dispose: () => list.forEach((m) => m.dispose()) };
  }, [texture]);
  const glow = useDisposable(() => createGlowMaterial(PALETTE.data, 0), []);
  const pos = POSITIONS[name];

  useFrame((state) => {
    const w = stationWeight(world.g, INDEX);
    const t = state.clock.elapsedTime;
    refs.current.forEach((g, i) => {
      if (!g) return;
      // Matching documents slide forward out of the stack.
      const out = i < 2 ? lift.value : 0;
      g.position.set(i * 0.08 + out * (i === 0 ? 0.25 : 0.55), -i * 0.1 + Math.sin(t * 0.6 + i + pos[0]) * 0.03, -i * 0.18 + out * (0.7 - i * 0.2));
      materials.list[i].opacity = (i === 0 ? 1 : 0.28 - i * 0.1 + out * 0.5) * w * (0.6 + 0.4 * Math.max(select.value, lift.value));
    });
    glow.uniforms.uOpacity.value = (0.2 * select.value + 0.6 * lift.value) * w;
  });

  return (
    <group position={pos}>
      <Glow material={glow} size={3.4} position={[0, 0, -0.4]} />
      {[2, 1, 0].map((i) => (
        <group
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
        >
          <mesh geometry={plane} material={materials.list[i]} renderOrder={4 - i} />
        </group>
      ))}
    </group>
  );
}

/** The query being executed, above the collections: one plate per collection. */
function QueryPlate({ name }: { name: string }) {
  const painter = useMemo(() => queryPainter(QUERIES[name]), [name]);
  const texture = useCanvasTexture(640, 72, painter);
  const plane = useDisposable(() => new PlaneGeometry(3.1, 0.35), []);
  const material = useDisposable(
    () => new MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, toneMapped: false }),
    [texture],
  );
  useFrame(() => {
    material.opacity = world.collection === name ? stationWeight(world.g, INDEX) : 0;
  });
  return <mesh geometry={plane} material={material} position={[0, 2.25, 0.4]} renderOrder={6} />;
}
