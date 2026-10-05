"use client";

import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";

/**
 * Lightweight post-processing for capable desktops only: a mip-mapped bloom
 * that lets emissive lines and packets glow, and a soft vignette.
 */
export default function Effects() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom mipmapBlur luminanceThreshold={0.62} luminanceSmoothing={0.2} intensity={0.55} radius={0.6} />
      <Vignette offset={0.32} darkness={0.55} />
    </EffectComposer>
  );
}
