"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { BufferGeometry, Float32BufferAttribute, LineBasicMaterial, LineLoop, MeshBasicMaterial, SphereGeometry, type Group } from "three";
import { techById, type TechCategory, type TechId } from "@/data/technologies";
import { SCENE_ORIGIN, smoothstep, stationWeight } from "@/lib/stations";
import { hoveredTech, sceneCursor, world, worldIndex } from "@/lib/world";
import { useWorldConfig } from "../shared/config";
import { IconNode, type NodeState } from "../shared/IconNode";
import { PALETTE } from "../shared/materials";
import { damp } from "../shared/pointer";
import { useDisposable } from "../shared/useDisposable";

const INDEX = worldIndex("stack");

const ORBITS: { category: TechCategory; radius: number; tilt: number; color: string; techs: TechId[]; phase: number }[] = [
  { category: "frontend", radius: 2.1, tilt: 0.05, color: PALETTE.web, techs: ["react", "nextjs", "typescript", "tailwind", "gsap", "threejs"], phase: 0.2 },
  { category: "backend", radius: 2.9, tilt: -0.08, color: PALETTE.server, techs: ["node", "express", "mongodb"], phase: 1.1 },
  { category: "mobile", radius: 3.65, tilt: 0.1, color: PALETTE.mobile, techs: ["flutter", "dart"], phase: 2.4 },
  { category: "tools", radius: 4.4, tilt: -0.04, color: PALETTE.muted, techs: ["git", "github", "postman", "figma"], phase: 0.7 },
];

const SEGMENTS = 160;

/**
 * 3D skills ecosystem around the Developer Core. Slow, controlled rotation;
 * the visitor can drag to turn it, and hover a technology (raycast) to
 * inspect it — the DOM panel shows its capability.
 */
export function TechUniverse() {
  const { reduced, tier } = useWorldConfig();
  const root = useRef<Group>(null);
  const spin = useRef<Group>(null);
  const drag = useRef({ active: false, lastX: 0, pending: 0, velocity: 0 });
  const states = useMemo(
    () => Object.fromEntries(ORBITS.flatMap((o) => o.techs).map((id) => [id, { appear: 0, lit: 0 } as NodeState])) as Record<string, NodeState>,
    [],
  );

  const loops = useDisposable(() => {
    const items = ORBITS.map((o) => {
      const pts: number[] = [];
      for (let i = 0; i < SEGMENTS; i++) {
        const a = (i / SEGMENTS) * Math.PI * 2;
        pts.push(Math.cos(a) * o.radius, 0, Math.sin(a) * o.radius);
      }
      const geometry = new BufferGeometry();
      geometry.setAttribute("position", new Float32BufferAttribute(pts, 3));
      const loop = new LineLoop(geometry, new LineBasicMaterial({ color: o.color, transparent: true, opacity: 0.3, depthWrite: false }));
      loop.rotation.z = o.tilt;
      return loop;
    });
    return {
      items,
      dispose: () =>
        items.forEach((l) => {
          l.geometry.dispose();
          (l.material as LineBasicMaterial).dispose();
        }),
    };
  }, []);

  const hitGeometry = useDisposable(() => new SphereGeometry(4.8, 24, 16), []);
  const hitMaterial = useDisposable(() => new MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false }), []);

  // Drag to rotate: track the pointer on the window once a drag starts on the universe.
  useEffect(() => {
    const d = drag.current;
    const onMove = (event: PointerEvent) => {
      if (!d.active) return;
      const dx = event.clientX - d.lastX;
      d.lastX = event.clientX;
      d.velocity = dx * 0.006;
      d.pending += d.velocity;
    };
    const onUp = () => {
      d.active = false;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  useFrame((_, delta) => {
    const group = root.current;
    if (!group) return;
    const w = stationWeight(world.g, INDEX);
    group.visible = w > 0.001;
    if (!group.visible) return;
    const dt = Math.min(delta, 0.05);
    const d = drag.current;

    if (spin.current) {
      // Slow auto rotation, plus whatever the visitor dragged, with a little inertia.
      spin.current.rotation.y += (reduced ? 0 : dt * 0.035) + d.pending;
      d.pending = 0;
      if (!d.active && !reduced) {
        spin.current.rotation.y += d.velocity;
        d.velocity = damp(d.velocity, 0, 4, dt);
      }
    }
    group.rotation.x = 0.32 - (reduced ? 0 : world.pointer.y * 0.08);
    group.rotation.z = reduced ? 0 : world.pointer.x * -0.04;
    group.scale.setScalar(0.85 + 0.15 * w);

    const hovered = hoveredTech.get();
    const hoveredCategory = hovered ? techById[hovered].category : null;
    ORBITS.forEach((o, oi) => {
      (loops.items[oi].material as LineBasicMaterial).opacity = (hoveredCategory === o.category ? 0.6 : 0.26) * w;
      o.techs.forEach((id, k) => {
        const st = states[id];
        st.appear = smoothstep(0.3 + oi * 0.08 + k * 0.02, 0.8 + oi * 0.05, w) * (hoveredCategory && hoveredCategory !== o.category ? 0.55 : 1);
        st.lit = hovered === id ? 1 : hoveredCategory === o.category ? 0.3 : 0;
      });
    });
  });

  return (
    <group position={SCENE_ORIGIN.stack}>
      <group ref={root}>
        <mesh
          geometry={hitGeometry}
          material={hitMaterial}
          onPointerDown={(event) => {
            drag.current.active = true;
            drag.current.lastX = event.nativeEvent.clientX;
          }}
          onPointerOver={() => {
            if (!hoveredTech.get()) sceneCursor.set("drag");
          }}
          onPointerOut={() => sceneCursor.set("default")}
        />
        <group ref={spin}>
          {loops.items.map((loop, i) => (
            <primitive key={i} object={loop} />
          ))}
          {ORBITS.map((o) =>
            o.techs.map((id, k) => {
              const a = o.phase + (k / o.techs.length) * Math.PI * 2;
              // Same rotation as the ring (about z by its tilt).
              const pos: [number, number, number] = [
                Math.cos(a) * o.radius * Math.cos(o.tilt),
                Math.cos(a) * o.radius * Math.sin(o.tilt),
                Math.sin(a) * o.radius,
              ];
              return (
                <IconNode
                  key={id}
                  icon={id}
                  label={tier === "high" ? techById[id].name : null}
                  color={o.color}
                  position={pos}
                  scale={0.78}
                  state={states[id]}
                  onPointerOver={(event) => {
                    event.stopPropagation();
                    hoveredTech.set(id);
                    sceneCursor.set("interactive");
                  }}
                  onPointerOut={() => {
                    if (hoveredTech.get() === id) hoveredTech.set(null);
                    sceneCursor.set("drag");
                  }}
                />
              );
            }),
          )}
        </group>
      </group>
    </group>
  );
}
