import { Braces, Database, ShieldCheck } from "lucide-react";
import { techById, type TechIconSource, type TechId } from "@/data/technologies";

const LUCIDE = { api: Braces, auth: ShieldCheck, database: Database } as const;

/** Brand colours that disappear on a dark background are shown in the foreground colour. */
export function brandColor(hex: string) {
  const n = parseInt(hex, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance < 0.22 ? "var(--color-fg)" : `#${hex}`;
}

export function iconColor(icon: TechIconSource) {
  return "path" in icon ? brandColor(icon.hex) : "var(--color-server)";
}

interface TechIconProps {
  id: TechId;
  size?: number;
  className?: string;
  /** Render in brand colour instead of currentColor. */
  colored?: boolean;
  /** Accessible name; omit when a visible label sits next to the icon. */
  title?: string;
}

/**
 * One icon component for the whole site: Simple Icons for brands,
 * Lucide for generic concepts (REST API, auth, database).
 */
export function TechIcon({ id, size = 18, className = "", colored = false, title }: TechIconProps) {
  const tech = techById[id];
  const icon = tech.icon;
  const color = colored ? iconColor(icon) : "currentColor";
  const a11y = title ? { role: "img", "aria-label": title } : { "aria-hidden": true };

  if ("lucide" in icon) {
    const Glyph = LUCIDE[icon.lucide];
    return <Glyph width={size} height={size} strokeWidth={1.75} color={color} className={className} {...a11y} />;
  }

  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill={color} className={className} {...a11y}>
      <path d={icon.path} />
    </svg>
  );
}
