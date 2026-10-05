import { siGithubactions, siNpm, siVercel, siWhatsapp } from "simple-icons";
import { techById, type TechId } from "@/data/technologies";
import { fontStack, type Painter } from "./canvasTexture";

/** Non-brand glyphs drawn with canvas primitives. */
export type Glyph = "browser" | "api" | "auth" | "check" | "npm" | "vercel" | "actions" | "mail" | "linkedin" | "code" | "phone" | "whatsapp" | "doc";
export type PlateIcon = TechId | Glyph;

const EXTRA_BRANDS: Partial<Record<Glyph, { path: string; hex: string }>> = {
  npm: siNpm,
  vercel: siVercel,
  actions: siGithubactions,
  whatsapp: siWhatsapp,
};

/** Readable mark colour on a dark plate (near-black brand colours become light). */
export function markColor(hex: string) {
  const n = parseInt(hex, 16);
  const lum = (0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255;
  return lum < 0.22 ? "#f5f7fa" : `#${hex}`;
}

function brandFor(icon: PlateIcon) {
  if (icon in techById) {
    const source = techById[icon as TechId].icon;
    return "path" in source ? source : null;
  }
  return EXTRA_BRANDS[icon as Glyph] ?? null;
}

function drawGlyph(ctx: CanvasRenderingContext2D, glyph: PlateIcon, cx: number, cy: number) {
  ctx.lineWidth = 7;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#f5f7fa";
  ctx.fillStyle = "#f5f7fa";
  if (glyph === "browser") {
    ctx.beginPath();
    ctx.roundRect(cx - 42, cy - 32, 84, 64, 10);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - 42, cy - 14);
    ctx.lineTo(cx + 42, cy - 14);
    ctx.stroke();
    [0, 1, 2].forEach((i) => {
      ctx.beginPath();
      ctx.arc(cx - 31 + i * 11, cy - 23, 3.5, 0, Math.PI * 2);
      ctx.fill();
    });
  } else if (glyph === "auth") {
    ctx.beginPath();
    ctx.moveTo(cx, cy - 40);
    ctx.lineTo(cx + 32, cy - 28);
    ctx.lineTo(cx + 32, cy + 2);
    ctx.quadraticCurveTo(cx + 30, cy + 30, cx, cy + 42);
    ctx.quadraticCurveTo(cx - 30, cy + 30, cx - 32, cy + 2);
    ctx.lineTo(cx - 32, cy - 28);
    ctx.closePath();
    ctx.strokeStyle = "#5be37d";
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - 13, cy + 1);
    ctx.lineTo(cx - 3, cy + 12);
    ctx.lineTo(cx + 15, cy - 9);
    ctx.stroke();
  } else if (glyph === "check") {
    ctx.strokeStyle = "#5be37d";
    ctx.beginPath();
    ctx.arc(cx, cy, 36, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - 16, cy + 1);
    ctx.lineTo(cx - 4, cy + 14);
    ctx.lineTo(cx + 18, cy - 12);
    ctx.stroke();
  } else if (glyph === "mail") {
    ctx.beginPath();
    ctx.roundRect(cx - 40, cy - 28, 80, 56, 8);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - 36, cy - 22);
    ctx.lineTo(cx, cy + 4);
    ctx.lineTo(cx + 36, cy - 22);
    ctx.stroke();
  } else if (glyph === "linkedin") {
    ctx.beginPath();
    ctx.roundRect(cx - 34, cy - 34, 68, 68, 12);
    ctx.fillStyle = "#3b82f6";
    ctx.fill();
    ctx.fillStyle = "#f5f7fa";
    ctx.font = `700 46px ${fontStack("sans")}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("in", cx + 1, cy + 3);
  } else if (glyph === "code") {
    ctx.fillStyle = "#33d6ff";
    ctx.font = `600 52px ${fontStack("mono")}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("</>", cx, cy + 2);
  } else if (glyph === "doc") {
    ctx.beginPath();
    ctx.moveTo(cx - 26, cy - 38);
    ctx.lineTo(cx + 12, cy - 38);
    ctx.lineTo(cx + 28, cy - 22);
    ctx.lineTo(cx + 28, cy + 38);
    ctx.lineTo(cx - 26, cy + 38);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, cy - 12);
    ctx.lineTo(cx, cy + 20);
    ctx.moveTo(cx - 11, cy + 9);
    ctx.lineTo(cx, cy + 20);
    ctx.lineTo(cx + 11, cy + 9);
    ctx.stroke();
  } else if (glyph === "phone") {
    ctx.beginPath();
    ctx.roundRect(cx - 22, cy - 38, 44, 76, 10);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy + 26, 4, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // "api" and anything unknown: braces.
    ctx.fillStyle = "#5be37d";
    ctx.font = `600 64px ${fontStack("mono")}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("{ }", cx, cy + 2);
  }
}

export const PLATE_TEXTURE = { width: 256, height: 320 } as const;
/** World height of a plate; the circle centre sits 15% above the plane centre. */
export const PLATE_H = 1.15;
export const PLATE_W = (PLATE_H * PLATE_TEXTURE.width) / PLATE_TEXTURE.height;
export const PLATE_OFFSET = -PLATE_H * 0.15;

/**
 * Technology plate: dark disc, Simple Icons mark (or glyph), ring in the
 * lane colour, and an optional label underneath.
 */
export function platePainter(icon: PlateIcon, label: string | null, ring: string): Painter {
  return (ctx, w) => {
    const cx = w / 2;
    const cy = 112;

    ctx.beginPath();
    ctx.arc(cx, cy, 84, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(11,14,19,0.94)";
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = ring;
    ctx.globalAlpha = 0.8;
    ctx.stroke();
    ctx.globalAlpha = 1;

    const brand = brandFor(icon);
    if (brand) {
      const size = 92;
      ctx.save();
      ctx.translate(cx - size / 2, cy - size / 2);
      ctx.scale(size / 24, size / 24);
      ctx.fillStyle = markColor(brand.hex);
      ctx.fill(new Path2D(brand.path));
      ctx.restore();
    } else {
      drawGlyph(ctx, icon, cx, cy);
    }

    if (label) {
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = "#f5f7fa";
      ctx.font = `600 38px ${fontStack("sans")}`;
      ctx.fillText(label, cx, 270, w - 12);
    }
  };
}
