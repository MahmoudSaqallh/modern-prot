"use client";

import { useMemo, useRef } from "react";
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
  type PointLight,
} from "three";
import { channels, type ChannelId } from "@/data/contact";
import { SCENE_ORIGIN, smoothstep, stationWeight } from "@/lib/stations";
import { world, worldIndex } from "@/lib/world";
import { fontStack, roundRect, useCanvasTexture, type Painter } from "../shared/canvasTexture";
import { useWorldConfig } from "../shared/config";
import { Glow } from "../shared/Glow";
import type { PlateIcon } from "../shared/iconPlate";
import { IconNode, type NodeState } from "../shared/IconNode";
import { createGlowMaterial, PALETTE } from "../shared/materials";
import { damp } from "../shared/pointer";
import { useDisposable } from "../shared/useDisposable";

const INDEX = worldIndex("contact");
const RX = 2.5;
const RY = 1.35;
/** Where the wires meet the core (core shell radius at this station). */
const CORE_R = 0.62;
const POINTS = 40;

const ICONS: Record<ChannelId, PlateIcon> = {
  email: "mail",
  github: "github",
  linkedin: "linkedin",
  whatsapp: "whatsapp",
  cv: "doc",
};

// Channels spread evenly around the core, starting at the top.
const layout = channels.map((c, i) => {
  const a = Math.PI / 2 + (i / channels.length) * Math.PI * 2;
  const pos = new Vector3(Math.cos(a) * RX, Math.sin(a) * RY, -Math.sin(a) * 0.5);
  const end = pos.clone().normalize().multiplyScalar(CORE_R);
  const mid = pos.clone().add(end).multiplyScalar(0.5);
  mid.z += 0.55;
  return { ...c, index: i, pos, curve: new QuadraticBezierCurve3(pos, mid, end) };
});

const labelPainter =
  (text: string): Painter =>
  (ctx, w, h) => {
    ctx.fillStyle = "rgba(10,12,15,0.92)";
    roundRect(ctx, 2, 2, w - 4, h - 4, 12);
    ctx.fill();
    ctx.strokeStyle = "rgba(51,214,255,0.6)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.font = `500 26px ${fontStack("mono")}`;
    ctx.fillStyle = "#f5f7fa";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text.toUpperCase(), w / 2, h / 2 + 1, w - 20);
  };

/**
 * The closing scene: the developer (the portrait core) as a communication
 * node, with every contact channel wired into it. Data pulses flow inward slowly;
 * the channel focused in the DOM (link hover or keyboard focus) pulses
 * faster, brightens, shows its label and pulls the accent light toward it.
 */
export function CommNode() {
  const { reduced } = useWorldConfig();
  const root = useRef<Group>(null);
  const light = useRef<PointLight>(null);
  const pulses = useRef<(Group | null)[]>([]);
  const states = useMemo(() => Object.fromEntries(layout.map((c) => [c.id, { appear: 0, lit: 0 } as NodeState])), []);
  const focusAmount = useMemo(() => Object.fromEntries(layout.map((c) => [c.id, { value: 0 }])), []);
  const phase = useMemo(() => layout.map((_, i) => i / layout.length), []);
  const point = useMemo(() => new Vector3(), []);

  const lines = useDisposable(() => {
    const items = layout.map(
      (c) =>
        new Line(
          new BufferGeometry().setFromPoints(c.curve.getPoints(POINTS)),
          new LineBasicMaterial({ color: PALETTE.web, transparent: true, opacity: 0.3, depthWrite: false }),
        ),
    );
    return {
      items,
      dispose: () =>
        items.forEach((l) => {
          l.geometry.dispose();
          (l.material as LineBasicMaterial).dispose();
        }),
    };
  }, []);
  const pulseGeometry = useDisposable(() => new SphereGeometry(0.05, 10, 10), []);
  const pulseMaterial = useDisposable(() => new MeshBasicMaterial({ color: "#effbff", transparent: true }), []);
  const pulseGlow = useDisposable(() => createGlowMaterial(PALETTE.web, 1), []);

  useFrame((state, delta) => {
    const group = root.current;
    if (!group) return;
    const w = stationWeight(world.g, INDEX);
    group.visible = w > 0.001;
    if (!group.visible) return;
    const dt = Math.min(delta, 0.05);
    const intro = reduced ? 1 : world.contactIntro;
    const focus = world.contactFocus;

    let lightTarget: Vector3 | null = null;
    layout.forEach((c, i) => {
      const f = focusAmount[c.id];
      f.value = reduced ? (focus === c.id ? 1 : 0) : damp(f.value, focus === c.id ? 1 : 0, 7, dt);
      // Sequence: channels appear one after another, then their wires connect.
      const appear = smoothstep(0.15 + i * 0.07, 0.35 + i * 0.07, intro) * w;
      const wire = smoothstep(0.45 + i * 0.06, 0.62 + i * 0.06, intro);
      states[c.id].appear = appear;
      states[c.id].lit = f.value;

      const line = lines.items[i];
      line.geometry.setDrawRange(0, Math.ceil((POINTS + 1) * wire));
      (line.material as LineBasicMaterial).opacity = (0.22 + 0.6 * f.value) * w;

      // Pulses flow toward the core; the focused wire runs faster.
      const speed = reduced ? 0 : 0.28 + 0.9 * f.value;
      phase[i] = (phase[i] + dt * speed) % 1;
      const p = pulses.current[i];
      if (p) {
        p.visible = !reduced && wire > 0.99 && w > 0.3;
        if (p.visible) {
          c.curve.getPoint(phase[i], point);
          p.position.copy(point);
          p.scale.setScalar((0.6 + 0.8 * f.value) * Math.sin(phase[i] * Math.PI));
        }
      }
      if (f.value > 0.5) lightTarget = c.pos;
    });

    const l = light.current;
    if (l) {
      if (lightTarget) l.position.lerp(lightTarget as Vector3, 1 - Math.exp(-6 * dt));
      l.intensity = damp(l.intensity, lightTarget ? 7 : 0, 5, dt);
    }
    if (!reduced) group.rotation.y = damp(group.rotation.y, world.pointer.x * 0.12, 2, dt);
  });

  return (
    <group position={SCENE_ORIGIN.contact}>
      <group ref={root}>
        <pointLight ref={light} color={PALETTE.web} intensity={0} distance={5} decay={2} />
        {lines.items.map((line, i) => (
          <primitive key={i} object={line} />
        ))}
        {layout.map((c, i) => (
          <group key={c.id}>
            <IconNode icon={ICONS[c.id]} label={null} color={PALETTE.web} position={[c.pos.x, c.pos.y, c.pos.z]} scale={0.62} state={states[c.id]} />
            <ChannelLabel text={c.label} position={[c.pos.x, c.pos.y - 0.52, c.pos.z + 0.1]} focus={focusAmount[c.id]} />
            <group
              ref={(el) => {
                pulses.current[i] = el;
              }}
              visible={false}
            >
              <mesh geometry={pulseGeometry} material={pulseMaterial} />
              <Glow material={pulseGlow} size={0.55} />
            </group>
          </group>
        ))}
      </group>
    </group>
  );
}

function ChannelLabel({ text, position, focus }: { text: string; position: [number, number, number]; focus: { value: number } }) {
  const painter = useMemo(() => labelPainter(text), [text]);
  const texture = useCanvasTexture(300, 64, painter);
  const plane = useDisposable(() => new PlaneGeometry(1.2, 0.26), []);
  const material = useDisposable(
    () => new MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, toneMapped: false, opacity: 0 }),
    [texture],
  );
  useFrame(() => {
    material.opacity = focus.value;
  });
  return <mesh geometry={plane} material={material} position={position} renderOrder={7} />;
}
