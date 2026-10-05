import { SYNTAX_COLORS, tokenize } from "@/lib/syntax";
import { fontStack, roundRect, type Painter } from "../shared/canvasTexture";

export const CODE_TEXTURE = { width: 1024, height: 560 } as const;
export const CODE_LINE = { top: 118, height: 52 } as const;

/** Editor panel: window chrome, file tab, numbered lines with syntax colours. */
export function codePainter(file: string, lines: string[], accent: string): Painter {
  return (ctx, w, h) => {
    const mono = fontStack("mono");
    ctx.fillStyle = "rgba(10,12,15,0.94)";
    roundRect(ctx, 2, 2, w - 4, h - 4, 22);
    ctx.fill();
    ctx.strokeStyle = "rgba(245,247,250,0.14)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Title bar.
    ctx.fillStyle = "rgba(245,247,250,0.18)";
    [0, 1, 2].forEach((i) => {
      ctx.beginPath();
      ctx.arc(40 + i * 26, 40, 8, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = "rgba(245,247,250,0.06)";
    roundRect(ctx, 140, 20, 300, 40, 8);
    ctx.fill();
    ctx.fillStyle = accent;
    ctx.fillRect(140, 58, 300, 3);
    ctx.font = `500 22px ${mono}`;
    ctx.fillStyle = "#f5f7fa";
    ctx.textBaseline = "middle";
    ctx.fillText(file, 160, 41);
    ctx.fillStyle = "rgba(245,247,250,0.08)";
    ctx.fillRect(2, 80, w - 4, 2);

    ctx.font = `400 28px ${mono}`;
    lines.forEach((line, i) => {
      const y = CODE_LINE.top + i * CODE_LINE.height;
      if (y > h - 20) return;
      ctx.fillStyle = "rgba(139,145,156,0.45)";
      ctx.textAlign = "right";
      ctx.fillText(String(i + 1), 66, y);
      ctx.textAlign = "left";
      let x = 92;
      for (const token of tokenize(line)) {
        ctx.fillStyle = SYNTAX_COLORS[token.kind];
        ctx.fillText(token.text, x, y);
        x += ctx.measureText(token.text).width;
      }
    });
  };
}
