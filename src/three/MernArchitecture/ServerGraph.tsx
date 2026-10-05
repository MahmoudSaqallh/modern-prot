"use client";

import { useCallback, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  BufferGeometry,
  Line,
  LineBasicMaterial,
  MeshBasicMaterial,
  PlaneGeometry,
  QuadraticBezierCurve3,
  SphereGeometry,
  Vector3,
  type Group,
} from "three";
import { apiResponse, requestPath, responsePath } from "@/data/architecture";
import { useThreeInteraction } from "@/hooks/useThreeInteraction";
import { SCENE_ORIGIN, smoothstep, stationWeight } from "@/lib/stations";
import { SYNTAX_COLORS, tokenize } from "@/lib/syntax";
import { world, worldIndex } from "@/lib/world";
import { fontStack, roundRect, useCanvasTexture, type Painter } from "../shared/canvasTexture";
import { useWorldConfig } from "../shared/config";
import { Glow } from "../shared/Glow";
import type { PlateIcon } from "../shared/iconPlate";
import { IconNode, type NodeState } from "../shared/IconNode";
import { createGlowMaterial, PALETTE } from "../shared/materials";
import { damp } from "../shared/pointer";
import { useDisposable } from "../shared/useDisposable";

const INDEX = worldIndex("backend");

const NODES: Record<string, { icon: PlateIcon; label: string; pos: [number, number, number]; color: string }> = {
  client: { icon: "browser", label: "Client", pos: [-2.6, 2.3, 0.2], color: PALETTE.web },
  api: { icon: "api", label: "API", pos: [-0.2, 2.75, 0.4], color: PALETTE.fg },
  node: { icon: "node", label: "Node.js", pos: [2.4, 1.6, 0.1], color: PALETTE.server },
  express: { icon: "express", label: "Express", pos: [1.25, -0.35, 0.5], color: PALETTE.server },
  auth: { icon: "auth", label: "Auth", pos: [-1.6, -0.1, -0.2], color: PALETTE.fg },
  mongodb: { icon: "mongodb", label: "MongoDB", pos: [0.4, -2.55, 0.2], color: PALETTE.server },
};

/** Shown on hover: what each part of the request path is responsible for. */
const ROLES: Record<string, string> = {
  client: "UI layer · React / Next.js",
  api: "API layer · REST + JSON",
  node: "Server runtime",
  express: "Routing · middleware",
  auth: "JWT · roles",
  mongodb: "Database",
};

const STATIC_EDGES: [string, string][] = [
  ["client", "api"],
  ["api", "node"],
  ["node", "express"],
  ["express", "auth"],
  ["express", "mongodb"],
];

const HOP_REQ = 0.42;
const HOP_RES = 0.38;
const HOLD = 0.3;
const SHOW = 2.6;
const REQ_TIME = (requestPath.length - 1) * HOP_REQ;
const RES_TIME = (responsePath.length - 1) * HOP_RES;
const TOTAL = REQ_TIME + HOLD + RES_TIME + SHOW;
const AUTO_EVERY = 7.5;

function curve(a: string, b: string) {
  const p = new Vector3(...NODES[a].pos);
  const q = new Vector3(...NODES[b].pos);
  const mid = p.clone().add(q).multiplyScalar(0.5);
  mid.z += 0.5;
  return new QuadraticBezierCurve3(p, mid, q);
}

const labelPainter =
  (text: string, color: string): Painter =>
  (ctx, w, h) => {
    ctx.fillStyle = "rgba(10,12,15,0.9)";
    roundRect(ctx, 2, 2, w - 4, h - 4, 14);
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.6;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.font = `500 30px ${fontStack("mono")}`;
    ctx.fillStyle = color;
    ctx.textBaseline = "middle";
    ctx.fillText(text, 24, h / 2 + 1);
  };

const jsonPainter: Painter = (ctx, w, h) => {
  const mono = fontStack("mono");
  ctx.fillStyle = "rgba(10,12,15,0.94)";
  roundRect(ctx, 2, 2, w - 4, h - 4, 16);
  ctx.fill();
  ctx.strokeStyle = "rgba(91,227,125,0.5)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.font = `600 22px ${mono}`;
  ctx.fillStyle = PALETTE.server;
  ctx.fillText("200 OK · application/json", 24, 40);
  ctx.font = `400 22px ${mono}`;
  apiResponse.split("\n").forEach((line, i) => {
    let x = 24;
    for (const token of tokenize(line)) {
      ctx.fillStyle = SYNTAX_COLORS[token.kind];
      ctx.fillText(token.text, x, 84 + i * 32);
      x += ctx.measureText(token.text).width;
    }
  });
};

/**
 * Backend architecture. Every few seconds (or when the visitor presses
 * "Send request") a request travels Client → API → Node.js → Express → Auth
 * → MongoDB; the response returns along the same path, then `200 OK` and the
 * JSON body appear beside the client. Capabilities hovered in the DOM light
 * their nodes.
 */
export function ServerGraph() {
  const { reduced } = useWorldConfig();
  const root = useRef<Group>(null);
  // Hovered node (raycast); read every frame, so kept out of React state.
  const hover = useMemo<{ key: string | null }>(() => ({ key: null }), []);
  const bind = useThreeInteraction<string>(
    useCallback((key) => {
      hover.key = key;
    }, [hover]),
  );
  const packet = useRef<Group>(null);
  const reqLabel = useRef<Group>(null);
  const result = useRef<Group>(null);
  const run = useRef({ start: -100, lastId: 0, lastAuto: 0 });

  const states = useMemo(() => Object.fromEntries(Object.keys(NODES).map((k) => [k, { appear: 0, lit: 0 } as NodeState])), []);
  const curves = useMemo(() => {
    const map = new Map<string, QuadraticBezierCurve3>();
    for (const [a, b] of STATIC_EDGES) map.set(`${a}>${b}`, curve(a, b));
    return map;
  }, []);
  const point = useMemo(() => new Vector3(), []);

  const lines = useDisposable(() => {
    const items = STATIC_EDGES.map(([a, b]) => {
      const geometry = new BufferGeometry().setFromPoints(curves.get(`${a}>${b}`)!.getPoints(36));
      return new Line(geometry, new LineBasicMaterial({ color: PALETTE.muted, transparent: true, opacity: 0.35, depthWrite: false }));
    });
    return {
      items,
      dispose: () =>
        items.forEach((l) => {
          l.geometry.dispose();
          (l.material as LineBasicMaterial).dispose();
        }),
    };
  }, [curves]);

  const packetGeometry = useDisposable(() => new SphereGeometry(0.07, 12, 12), []);
  const packetMaterial = useDisposable(() => new MeshBasicMaterial({ color: "#f2fbff", transparent: true }), []);
  const packetGlow = useDisposable(() => createGlowMaterial(PALETTE.web, 1), []);

  const reqTexture = useCanvasTexture(512, 80, useMemo(() => labelPainter("GET /api/projects", PALETTE.web), []));
  const jsonTexture = useCanvasTexture(560, 340, jsonPainter);
  const labelPlane = useDisposable(() => new PlaneGeometry(2.0, 0.31), []);
  const jsonPlane = useDisposable(() => new PlaneGeometry(2.3, 1.4), []);
  const reqMaterial = useDisposable(() => new MeshBasicMaterial({ map: reqTexture, transparent: true, depthWrite: false, toneMapped: false }), [reqTexture]);
  const jsonMaterial = useDisposable(() => new MeshBasicMaterial({ map: jsonTexture, transparent: true, depthWrite: false, toneMapped: false }), [jsonTexture]);

  /** Position along a hop, using the static edge in either direction. */
  const along = (a: string, b: string, t: number) => {
    const forward = curves.get(`${a}>${b}`);
    if (forward) return forward.getPoint(t, point);
    return curves.get(`${b}>${a}`)!.getPoint(1 - t, point);
  };

  useFrame((state) => {
    const group = root.current;
    if (!group) return;
    const w = stationWeight(world.g, INDEX);
    group.visible = w > 0.001;
    if (!group.visible) return;
    const t = state.clock.elapsedTime;
    const r = run.current;

    // Start a run on request, or automatically while the scene is in focus.
    if (world.requestId !== r.lastId) {
      r.lastId = world.requestId;
      r.start = t;
    } else if (!reduced && w > 0.6 && t - r.start > TOTAL + 0.8 && t - r.lastAuto > AUTO_EVERY) {
      r.lastAuto = t;
      r.start = t;
    }
    const e = reduced ? REQ_TIME + HOLD + RES_TIME + 0.1 : t - r.start;

    group.scale.setScalar(0.88 + 0.12 * w);
    group.rotation.y = 0.25 + (reduced ? 0 : (1 - w) * -0.5 + world.pointer.x * 0.08);

    for (const key of Object.keys(states)) {
      states[key].appear = smoothstep(0.35, 1, w);
      states[key].lit = world.backendFocus.includes(key) || hover.key === key ? 1 : 0;
    }

    let showPacket = false;
    if (e >= 0 && e < REQ_TIME) {
      const s = e / HOP_REQ;
      const hop = Math.floor(s);
      along(requestPath[hop], requestPath[hop + 1], s - hop);
      showPacket = true;
      packetGlow.uniforms.uColor.value.set(PALETTE.web);
      requestPath.forEach((key, k) => {
        states[key].lit = Math.max(states[key].lit, Math.max(0, 1 - Math.abs(s - k) * 1.3));
      });
    } else if (e >= REQ_TIME + HOLD && e < REQ_TIME + HOLD + RES_TIME) {
      const s = (e - REQ_TIME - HOLD) / HOP_RES;
      const hop = Math.floor(s);
      along(responsePath[hop], responsePath[hop + 1], s - hop);
      showPacket = true;
      packetGlow.uniforms.uColor.value.set(PALETTE.server);
      responsePath.forEach((key, k) => {
        states[key].lit = Math.max(states[key].lit, Math.max(0, 1 - Math.abs(s - k) * 1.3));
      });
    } else if (e >= REQ_TIME && e < REQ_TIME + HOLD) {
      states.mongodb.lit = 1;
    }

    if (packet.current) {
      packet.current.visible = showPacket;
      if (showPacket) packet.current.position.copy(point);
    }
    const showResult = e > REQ_TIME + HOLD + RES_TIME - 0.1 && e < TOTAL;
    const resultFade = reduced ? 1 : showResult ? Math.min(1, (e - (REQ_TIME + HOLD + RES_TIME - 0.1)) * 3, (TOTAL - e) * 2) : 0;
    jsonMaterial.opacity = resultFade * w;
    if (result.current) result.current.visible = resultFade > 0.01;
    reqMaterial.opacity = (e >= 0 && e < REQ_TIME + 0.4 ? 1 : 0.35) * w;
    lines.items.forEach((line) => {
      (line.material as LineBasicMaterial).opacity = 0.35 * w;
    });
  });

  return (
    <group position={SCENE_ORIGIN.backend}>
      <group ref={root}>
        {lines.items.map((line, i) => (
          <primitive key={i} object={line} />
        ))}
        {Object.entries(NODES).map(([key, n]) => (
          <group key={key}>
            <IconNode icon={n.icon} label={n.label} color={n.color} position={n.pos} scale={0.85} state={states[key]} {...bind(key)} />
            <RoleTag nodeKey={key} hover={hover} />
          </group>
        ))}
        <group ref={packet} visible={false}>
          <mesh geometry={packetGeometry} material={packetMaterial} />
          <Glow material={packetGlow} size={0.8} />
        </group>
        <group ref={reqLabel} position={[-2.6, 3.35, 0.3]}>
          <mesh geometry={labelPlane} material={reqMaterial} renderOrder={5} />
        </group>
        <group ref={result} position={[-3.1, 0.55, 0.9]} visible={false}>
          <mesh geometry={jsonPlane} material={jsonMaterial} renderOrder={5} />
        </group>
      </group>
    </group>
  );
}

const rolePainter =
  (text: string): Painter =>
  (ctx, w, h) => {
    ctx.fillStyle = "rgba(10,12,15,0.92)";
    roundRect(ctx, 2, 2, w - 4, h - 4, 12);
    ctx.fill();
    ctx.strokeStyle = "rgba(51,214,255,0.6)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.font = `500 24px ${fontStack("mono")}`;
    ctx.fillStyle = "#f5f7fa";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text.toUpperCase(), w / 2, h / 2 + 1, w - 24);
  };

/** Role tag under a node, faded in while that node is hovered. */
function RoleTag({ nodeKey, hover }: { nodeKey: string; hover: { key: string | null } }) {
  const painter = useMemo(() => rolePainter(ROLES[nodeKey] ?? nodeKey), [nodeKey]);
  const texture = useCanvasTexture(420, 64, painter);
  const plane = useDisposable(() => new PlaneGeometry(1.75, 0.27), []);
  const material = useDisposable(
    () => new MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, toneMapped: false, opacity: 0 }),
    [texture],
  );
  const shown = useRef(0);
  const pos = NODES[nodeKey].pos;

  useFrame((_, delta) => {
    shown.current = damp(shown.current, hover.key === nodeKey ? 1 : 0, 10, Math.min(delta, 0.05));
    material.opacity = shown.current;
  });

  return <mesh geometry={plane} material={material} position={[pos[0], pos[1] - 0.95, pos[2] + 0.3]} renderOrder={7} />;
}
