"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, Fog, Vector3, type PerspectiveCamera } from "three";
import { stationWeight } from "@/lib/stations";
import { activeProject, world, worldIndex } from "@/lib/world";
import { useWorldConfig } from "./config";
import { damp, easeOutCubic } from "./pointer";
import { createRigSample, dampVec, sampleRig } from "./rig";
import { frameRig, rigLook } from "./rigState";

const PROJECTS = worldIndex("projects");

/**
 * Drives the single camera through the stations. Damped so scroll reads as
 * a dolly; snapped with reduced motion. Publishes the resolved station state
 * (colours, look target) for the lighting and background systems.
 */
export function CameraRig() {
  const { reduced } = useWorldConfig();
  const sample = useMemo(() => createRigSample(), []);
  const look = useRef(new Vector3());
  const ready = useRef(false);
  const focus = useRef(0);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 20);
    const { camera, size, scene } = state;
    const compact = size.width < 1024;
    sampleRig(world.g, compact, size.width / size.height, sample);

    // Opening a project pulls the camera toward the project panels.
    const target = activeProject.get() ? 1 : 0;
    focus.current = reduced ? target : damp(focus.current, target, 3, dt);
    sample.cameraPos.z -= focus.current * 5 * stationWeight(world.g, PROJECTS);

    if (!reduced) {
      const push = (1 - easeOutCubic(world.intro)) * stationWeight(world.g, 0);
      sample.cameraPos.z += push * 5;
      sample.cameraPos.y += push * 0.9;
      if (!compact) {
        sample.cameraPos.x += world.pointer.x * 0.5;
        sample.cameraPos.y += world.pointer.y * 0.3;
      }
    }

    // Past the last anchor, move with the page so the final scene scrolls like content.
    if (world.tail > 0) {
      const distance = sample.cameraPos.distanceTo(sample.cameraTarget);
      const visible = 2 * Math.tan(((camera as PerspectiveCamera).fov * Math.PI) / 360) * distance;
      sample.cameraPos.y -= world.tail * visible;
      sample.cameraTarget.y -= world.tail * visible;
    }

    if (reduced || !ready.current) {
      camera.position.copy(sample.cameraPos);
      look.current.copy(sample.cameraTarget);
      ready.current = true;
    } else {
      dampVec(camera.position, sample.cameraPos, 3.2, dt);
      dampVec(look.current, sample.cameraTarget, 3.6, dt);
    }
    camera.lookAt(look.current);

    if (scene.background instanceof Color) scene.background.copy(sample.tint);
    if (scene.fog instanceof Fog) scene.fog.color.copy(sample.tint);

    // Publish the frame state for lighting, backdrop and grid.
    frameRig.coreScale = sample.coreScale;
    frameRig.calm = sample.calm;
    frameRig.rings = sample.rings;
    frameRig.keyIntensity = sample.keyIntensity;
    frameRig.tint.copy(sample.tint);
    frameRig.key.copy(sample.key);
    frameRig.rim.copy(sample.rim);
    frameRig.accent.copy(sample.accent);
    rigLook.copy(look.current);
  });

  return null;
}
