import { Vector3 } from "three";
import { createRigSample } from "./rig";

/**
 * The current frame's resolved station state, written once per frame by
 * CameraRig (mounted first) and read by lighting, backdrop and grid, so the
 * whole environment shifts together without recomputing the interpolation.
 */
export const frameRig = createRigSample();

/** Where the camera is looking this frame (damped). */
export const rigLook = new Vector3();
