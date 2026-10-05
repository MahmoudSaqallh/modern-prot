import type { FrontendLayer } from "@/data/architecture";
import { techById } from "@/data/technologies";
import { SYNTAX_COLORS, tokenize } from "@/lib/syntax";
import { fontStack, roundRect, type Painter } from "../shared/canvasTexture";
import { PALETTE } from "../shared/materials";

export const LAYER_TEXTURE = { width: 1024, height: 640 } as const;

function frame(ctx: CanvasRenderingContext2D, w: number, h: number, alpha: number) {
  ctx.fillStyle = `rgba(10,13,18,${alpha})`;
  roundRect(ctx, 3, 3, w - 6, h - 6, 24);
  ctx.fill();
  ctx.strokeStyle = "rgba(51,214,255,0.5)";
  ctx.lineWidth = 3;
  ctx.stroke();
}

function badge(ctx: CanvasRenderingContext2D, layer: FrontendLayer, index: number, w: number, y: number) {
  const mono = fontStack("mono");
  ctx.textBaseline = "alphabetic";
  ctx.font = `500 24px ${mono}`;
  ctx.fillStyle = "rgba(139,145,156,0.9)";
  ctx.fillText(`0${index + 1}`, 40, y);
  ctx.font = `600 40px ${fontStack("sans")}`;
  ctx.fillStyle = "#f5f7fa";
  ctx.fillText(layer.name, 86, y + 2);
  ctx.font = `500 22px ${mono}`;
  ctx.fillStyle = PALETTE.web;
  ctx.textAlign = "right";
  ctx.fillText(layer.techs.map((t) => techById[t].name.toUpperCase()).join(" · "), w - 40, y);
  ctx.textAlign = "left";
}

/** Front layer: the rendered page inside browser chrome. */
function uiPainter(): Painter {
  return (ctx, w, h) => {
    frame(ctx, w, h, 0.96);
    const mono = fontStack("mono");
    ctx.fillStyle = "rgba(245,247,250,0.25)";
    [0, 1, 2].forEach((i) => {
      ctx.beginPath();
      ctx.arc(40 + i * 26, 38, 8, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = "rgba(245,247,250,0.06)";
    roundRect(ctx, 150, 18, w - 300, 40, 20);
    ctx.fill();
    ctx.font = `400 22px ${mono}`;
    ctx.fillStyle = "rgba(245,247,250,0.7)";
    ctx.textBaseline = "middle";
    ctx.fillText("localhost:3000/projects", 180, 39);
    ctx.fillStyle = "rgba(245,247,250,0.08)";
    ctx.fillRect(3, 74, w - 6, 2);

    // Page: nav, hero, filters, cards.
    ctx.fillStyle = "rgba(245,247,250,0.2)";
    roundRect(ctx, 48, 104, 120, 18, 9);
    ctx.fill();
    [0, 1, 2].forEach((i) => {
      roundRect(ctx, w - 360 + i * 100, 104, 70, 18, 9);
      ctx.fill();
    });
    ctx.fillStyle = "rgba(51,214,255,0.85)";
    roundRect(ctx, 48, 160, 470, 38, 8);
    ctx.fill();
    ctx.fillStyle = "rgba(245,247,250,0.3)";
    roundRect(ctx, 48, 214, 340, 20, 8);
    ctx.fill();
    ["All", "MERN", "Flutter"].forEach((_, i) => {
      ctx.fillStyle = i === 0 ? "rgba(245,247,250,0.9)" : "rgba(245,247,250,0.12)";
      roundRect(ctx, 48 + i * 104, 262, 92, 30, 15);
      ctx.fill();
    });
    const cw = (w - 96 - 48) / 3;
    for (let i = 0; i < 3; i++) {
      const x = 48 + i * (cw + 24);
      ctx.fillStyle = "rgba(245,247,250,0.05)";
      roundRect(ctx, x, 318, cw, h - 360, 14);
      ctx.fill();
      ctx.fillStyle = [`rgba(51,214,255,0.28)`, `rgba(91,227,125,0.28)`, `rgba(59,130,246,0.28)`][i];
      roundRect(ctx, x + 14, 332, cw - 28, 130, 10);
      ctx.fill();
      ctx.fillStyle = "rgba(245,247,250,0.4)";
      roundRect(ctx, x + 14, 480, cw * 0.6, 16, 8);
      ctx.fill();
      ctx.fillStyle = "rgba(245,247,250,0.15)";
      roundRect(ctx, x + 14, 508, cw * 0.8, 12, 6);
      ctx.fill();
    }
  };
}

/** Components: the React tree as connected modules. */
function componentsPainter(layer: FrontendLayer, index: number): Painter {
  return (ctx, w, h) => {
    frame(ctx, w, h, 0.9);
    badge(ctx, layer, index, w, 64);
    const mono = fontStack("mono");
    const box = (label: string, x: number, y: number, bw: number, hot = false) => {
      ctx.fillStyle = hot ? "rgba(51,214,255,0.16)" : "rgba(245,247,250,0.05)";
      roundRect(ctx, x - bw / 2, y, bw, 64, 12);
      ctx.fill();
      ctx.strokeStyle = hot ? PALETTE.web : "rgba(245,247,250,0.25)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = hot ? "#f5f7fa" : "#c9d1d9";
      ctx.font = `500 26px ${mono}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, x, y + 33);
      ctx.textAlign = "left";
    };
    const link = (x1: number, y1: number, x2: number, y2: number) => {
      ctx.strokeStyle = "rgba(51,214,255,0.45)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.bezierCurveTo(x1, (y1 + y2) / 2, x2, (y1 + y2) / 2, x2, y2);
      ctx.stroke();
    };
    const cx = w / 2;
    link(cx, 194, cx - 240, 270);
    link(cx, 194, cx + 200, 270);
    [-180, 0, 180].forEach((dx) => link(cx + 200, 334, cx + 200 + dx * 0.9, 420));
    box("<App />", cx, 130, 200, true);
    box("<Header />", cx - 240, 270, 230);
    box("<ProjectGrid />", cx + 200, 270, 290, true);
    [-180, 0, 180].forEach((dx) => box("<Card />", cx + 200 + dx * 0.9, 420, 150));
    box("<Nav />", cx - 240, 420, 150);
    link(cx - 240, 334, cx - 240, 420);
    ctx.font = `400 22px ${mono}`;
    ctx.fillStyle = "rgba(139,145,156,0.8)";
    ctx.fillText("props ↓   events ↑", 48, h - 48);
  };
}

/** State and API layers: code / network rows. */
function codeLayerPainter(layer: FrontendLayer, index: number, network: boolean): Painter {
  return (ctx, w, h) => {
    frame(ctx, w, h, 0.86);
    badge(ctx, layer, index, w, 64);
    const mono = fontStack("mono");
    ctx.font = `400 30px ${mono}`;
    ctx.textBaseline = "alphabetic";
    layer.fragment.forEach((line, i) => {
      const y = 170 + i * 62;
      if (network) {
        const [method, path, status, time] = line.split(/\s+/);
        ctx.fillStyle = "rgba(245,247,250,0.04)";
        roundRect(ctx, 40, y - 40, w - 80, 54, 10);
        ctx.fill();
        ctx.fillStyle = method === "GET" ? PALETTE.server : PALETTE.web;
        ctx.fillText(method, 60, y);
        ctx.fillStyle = "#d7dce2";
        ctx.fillText(path, 180, y);
        ctx.fillStyle = PALETTE.server;
        ctx.fillText(status, w - 260, y);
        ctx.fillStyle = "rgba(139,145,156,0.8)";
        ctx.fillText(time, w - 160, y);
        return;
      }
      let x = 48;
      for (const token of tokenize(line)) {
        ctx.fillStyle = SYNTAX_COLORS[token.kind];
        ctx.fillText(token.text, x, y);
        x += ctx.measureText(token.text).width;
      }
    });
    if (!network) {
      ctx.fillStyle = "rgba(91,227,125,0.1)";
      roundRect(ctx, 48, h - 150, 420, 90, 12);
      ctx.fill();
      ctx.font = `400 24px ${mono}`;
      ctx.fillStyle = PALETTE.server;
      ctx.fillText("filter: 'All'", 72, h - 112);
      ctx.fillText("projects: Project[7]", 72, h - 78);
    }
  };
}

export function layerPainter(layer: FrontendLayer, index: number): Painter {
  if (layer.id === "ui") return uiPainter();
  if (layer.id === "components") return componentsPainter(layer, index);
  return codeLayerPainter(layer, index, layer.id === "api");
}
