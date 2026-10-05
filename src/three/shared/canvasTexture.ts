"use client";

import { useEffect, useMemo } from "react";
import { CanvasTexture, SRGBColorSpace } from "three";

export type Painter = (ctx: CanvasRenderingContext2D, width: number, height: number) => void;

/**
 * Text and UI drawn with the 2D canvas API and uploaded as a texture.
 * Avoids loading font atlases over the network and keeps the page's own
 * typefaces. Repaints once web fonts are ready. Disposed on unmount.
 *
 * `paint` must be referentially stable (module-level or memoised).
 */
export function useCanvasTexture(width: number, height: number, paint: Painter) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const tex = new CanvasTexture(canvas);
    tex.colorSpace = SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  }, [width, height]);

  useEffect(() => {
    let alive = true;
    const draw = () => {
      const canvas = texture.image as HTMLCanvasElement;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      paint(ctx, width, height);
      texture.needsUpdate = true;
    };
    draw();
    document.fonts?.ready.then(() => {
      if (alive) draw();
    });
    return () => {
      alive = false;
    };
  }, [texture, paint, width, height]);

  useEffect(() => () => texture.dispose(), [texture]);

  return texture;
}

/** Resolve the page font stacks (set by next/font) for canvas drawing. */
export function fontStack(kind: "sans" | "mono") {
  if (typeof document === "undefined") return kind === "mono" ? "monospace" : "sans-serif";
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(kind === "mono" ? "--font-geist-mono" : "--font-geist-sans")
    .trim();
  return value ? `${value}, ${kind === "mono" ? "monospace" : "sans-serif"}` : kind === "mono" ? "monospace" : "sans-serif";
}

export function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}
