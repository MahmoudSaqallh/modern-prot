"use client";

import { useMemo, useRef } from "react";
import { ContactShadows } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import {
  BufferGeometry,
  Line,
  LineBasicMaterial,
  MeshBasicMaterial,
  QuadraticBezierCurve3,
  SphereGeometry,
  Vector3,
  type Group,
} from "three";
import { SCENE_ORIGIN, smoothstep, stationWeight } from "@/lib/stations";
import { world, worldIndex } from "@/lib/world";
import { useWorldConfig } from "../shared/config";
import { Glow } from "../shared/Glow";
import type { PlateIcon } from "../shared/iconPlate";
import { IconNode, type NodeState } from "../shared/IconNode";
import { createGlowMaterial, PALETTE } from "../shared/materials";
import { NearStation } from "../shared/NearStation";
import { useDisposable } from "../shared/useDisposable";
import { Phone } from "./Phone";

const INDEX = worldIndex("flutter");

const SATELLITES: { key: string; icon: PlateIcon; label: string; pos: [number, number, number]; color: string }[] = [
  { key: "flutter", icon: "flutter", label: "Flutter", pos: [-2.1, 1.6, 0.5], color: PALETTE.mobile },
  { key: "dart", icon: "dart", label: "Dart", pos: [-2.4, -0.4, 0.2], color: PALETTE.mobile },
  { key: "android", icon: "android", label: "Android", pos: [-1.8, -2.3, 0.6], color: PALETTE.mobile },
  { key: "rest", icon: "rest", label: "REST API", pos: [2.2, 1.3, 0.3], color: PALETTE.server },
  { key: "node", icon: "node", label: "Node.js", pos: [2.7, -1.0, -0.2], color: PALETTE.server },
];

/** Mobile → backend: from the phone's top edge, through the REST API, to Node.js. */
const FLOW = [new Vector3(0.9, 1.7, 0.2), new Vector3(...SATELLITES[3].pos), new Vector3(...SATELLITES[4].pos)];
const PACKETS = 3;

/**
 * The Flutter chapter: a detailed phone running the Flutter UI, its toolchain
 * around it, and requests leaving the app for the shared Node.js backend.
 */
export function FlutterScene() {
  const { reduced, tier } = useWorldConfig();
  const root = useRef<Group>(null);
  const packets = useRef<(Group | null)[]>([]);
  const presence = useMemo(() => ({ value: 0 }), []);
  const states = useMemo(() => Object.fromEntries(SATELLITES.map((s) => [s.key, { appear: 0, lit: 0 } as NodeState])), []);
  const point = useMemo(() => new Vector3(), []);

  const curves = useMemo(
    () =>
      FLOW.slice(0, -1).map((a, i) => {
        const b = FLOW[i + 1];
        const mid = a.clone().add(b).multiplyScalar(0.5);
        mid.z += 0.6;
        mid.x += 0.3;
        return new QuadraticBezierCurve3(a, mid, b);
      }),
    [],
  );
  const lines = useDisposable(() => {
    const items = curves.map(
      (c) => new Line(new BufferGeometry().setFromPoints(c.getPoints(32)), new LineBasicMaterial({ color: PALETTE.mobile, transparent: true, opacity: 0.45, depthWrite: false })),
    );
    return {
      items,
      dispose: () =>
        items.forEach((l) => {
          l.geometry.dispose();
          (l.material as LineBasicMaterial).dispose();
        }),
    };
  }, [curves]);
  const packetGeometry = useDisposable(() => new SphereGeometry(0.055, 10, 10), []);
  const packetMaterial = useDisposable(() => new MeshBasicMaterial({ color: "#eef1ff", transparent: true }), []);
  const packetGlow = useDisposable(() => createGlowMaterial(PALETTE.mobile, 1), []);

  useFrame((state) => {
    const group = root.current;
    if (!group) return;
    const w = stationWeight(world.g, INDEX);
    group.visible = w > 0.001;
    if (!group.visible) return;
    const t = state.clock.elapsedTime;
    presence.value = smoothstep(0.2, 1, w);
    group.scale.setScalar(0.9 + 0.1 * w);

    SATELLITES.forEach((s, i) => {
      const st = states[s.key];
      st.appear = smoothstep(0.45 + i * 0.06, 0.8 + i * 0.04, w);
      st.lit = 0;
    });
    lines.items.forEach((l) => {
      (l.material as LineBasicMaterial).opacity = 0.45 * presence.value;
    });

    packets.current.forEach((p, k) => {
      if (!p) return;
      p.visible = !reduced && presence.value > 0.5;
      if (!p.visible) return;
      const s = ((t * 0.45 + k / PACKETS) % 1) * curves.length;
      const hop = Math.min(curves.length - 1, Math.floor(s));
      curves[hop].getPoint(s - hop, point);
      p.position.copy(point);
      // Light the REST API and Node.js nodes as packets arrive.
      if (s > 0.85 && s < 1.15) states.rest.lit = Math.max(states.rest.lit, 1 - Math.abs(s - 1) * 6);
      if (s > 1.85) states.node.lit = Math.max(states.node.lit, (s - 1.85) * 6.6);
    });
  });

  return (
    <group position={SCENE_ORIGIN.flutter}>
      <group ref={root}>
        <Phone presence={presence} />
        {/* Soft grounding shadow under the phone (only rendered near this station). */}
        <NearStation index={INDEX}>
          <ContactShadows position={[0, -2.35, 0]} opacity={0.55} scale={6} blur={2.4} far={3.5} resolution={tier === "high" ? 512 : 256} color="#000000" />
        </NearStation>
        {lines.items.map((line, i) => (
          <primitive key={i} object={line} />
        ))}
        {Array.from({ length: PACKETS }, (_, k) => (
          <group
            key={k}
            ref={(el) => {
              packets.current[k] = el;
            }}
            visible={false}
          >
            <mesh geometry={packetGeometry} material={packetMaterial} />
            <Glow material={packetGlow} size={0.6} />
          </group>
        ))}
        {SATELLITES.map((s) => (
          <IconNode key={s.key} icon={s.icon} label={s.label} color={s.color} position={s.pos} scale={0.72} state={states[s.key]} />
        ))}
      </group>
    </group>
  );
}
