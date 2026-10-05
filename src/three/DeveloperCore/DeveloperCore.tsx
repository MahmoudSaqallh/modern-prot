"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { stationWeight } from "@/lib/stations";
import { world, worldIndex } from "@/lib/world";
import { useWorldConfig } from "../shared/config";
import { damp, easeOutCubic } from "../shared/pointer";
import { createRigSample, dampVec, sampleRig } from "../shared/rig";
import { Constellation } from "./Constellation";
import { Core } from "./Core";

/**
 * The Developer Core is present in every chapter. It travels with the
 * camera and changes role per station: centrepiece of the hero, engine under
 * the browser, the server inside the backend graph, the query engine over
 * the database, the phone's backlight, the centre of the tech universe, and
 * finally the calm core of the contact scene. It reacts to the pointer
 * (constellation tilt), scroll (position/scale) and section (energy).
 */
const HERO = worldIndex("hero");
const CONTACT = worldIndex("contact");

export function DeveloperCore() {
  const { reduced } = useWorldConfig();
  const anchor = useRef<Group>(null);
  const tilt = useRef<Group>(null);
  const sample = useMemo(() => createRigSample(), []);
  const scale = useRef(0.35);
  const placed = useRef(false);
  const openness = useMemo(() => ({ value: 1 }), []);
  const energy = useMemo(() => ({ value: 1 }), []);
  const portrait = useMemo(() => ({ value: 0 }), []);

  useFrame((state, delta) => {
    const group = anchor.current;
    if (!group) return;
    const dt = Math.min(delta, 1 / 20);
    const { size, clock } = state;
    sampleRig(world.g, size.width < 1024, size.width / size.height, sample);

    const intro = reduced ? 1 : easeOutCubic(world.intro);
    const targetScale = sample.coreScale * (0.4 + 0.6 * intro);
    if (reduced || !placed.current) {
      group.position.copy(sample.corePos);
      scale.current = targetScale;
      placed.current = true;
    } else {
      dampVec(group.position, sample.corePos, 3.4, dt);
      scale.current = damp(scale.current, targetScale, 3.4, dt);
    }
    group.scale.setScalar(scale.current);
    openness.value = sample.rings;
    energy.value = 1 - sample.calm * 0.7;
    // The developer appears inside the core in the opening and closing scenes.
    portrait.value = Math.max(stationWeight(world.g, HERO), stationWeight(world.g, CONTACT));

    const t = tilt.current;
    if (t && !reduced) {
      t.rotation.y = damp(t.rotation.y, world.pointer.x * 0.22 + Math.sin(clock.elapsedTime * 0.15) * 0.05, 2.5, dt);
      t.rotation.x = damp(t.rotation.x, -world.pointer.y * 0.12, 2.5, dt);
    }
  });

  return (
    <group ref={anchor}>
      <Core energy={energy} portrait={portrait} />
      <group ref={tilt}>
        <Constellation openness={openness} />
      </group>
    </group>
  );
}
