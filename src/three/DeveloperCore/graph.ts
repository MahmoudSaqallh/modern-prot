import type { PlateIcon } from "../shared/iconPlate";
import { PALETTE } from "../shared/materials";

export type Lane = "web" | "server" | "mobile" | "typed";

export interface GraphNode {
  key: string;
  icon: PlateIcon;
  label: string;
  pos: [number, number, number];
  lane: Lane;
}

/**
 * The hero constellation around the core. Clients on the left, the API
 * boundary above/below, the server and data on the right:
 *   React   → Next.js → API → Node.js → Express → MongoDB
 *   Flutter → REST API → Node.js → MongoDB
 */
export const GRAPH_NODES: GraphNode[] = [
  { key: "react", icon: "react", label: "React", pos: [-3.1, 1.3, 0.4], lane: "web" },
  { key: "nextjs", icon: "nextjs", label: "Next.js", pos: [-1.8, 2.7, 0.6], lane: "web" },
  { key: "typescript", icon: "typescript", label: "TypeScript", pos: [0, 3.25, -0.5], lane: "typed" },
  { key: "javascript", icon: "javascript", label: "JavaScript", pos: [-3.45, -0.05, 0.2], lane: "typed" },
  { key: "api", icon: "api", label: "API", pos: [1.9, 2.55, 0.6], lane: "web" },
  { key: "node", icon: "node", label: "Node.js", pos: [3.25, 0.75, 0.4], lane: "server" },
  { key: "express", icon: "express", label: "Express", pos: [3.15, -1.15, 0.4], lane: "server" },
  { key: "mongodb", icon: "mongodb", label: "MongoDB", pos: [1.8, -2.65, 0.5], lane: "server" },
  { key: "flutter", icon: "flutter", label: "Flutter", pos: [-3.1, -1.45, 0.4], lane: "mobile" },
  { key: "dart", icon: "dart", label: "Dart", pos: [-1.8, -2.75, 0.6], lane: "mobile" },
  { key: "rest", icon: "rest", label: "REST API", pos: [0.1, -3.2, 0.6], lane: "mobile" },
];

export interface Chain {
  lane: "web" | "mobile";
  nodes: string[];
  color: string;
  period: number;
  offset: number;
}

/** Packets travel each chain from first to last node. */
export const CHAINS: Chain[] = [
  { lane: "web", nodes: ["react", "nextjs", "api", "node", "express", "mongodb"], color: PALETTE.web, period: 6, offset: 0 },
  { lane: "mobile", nodes: ["flutter", "rest", "node", "mongodb"], color: PALETTE.mobile, period: 5.4, offset: 2.7 },
];

/** Secondary relationships, drawn faintly. */
export const LINKS: [string, string][] = [
  ["nextjs", "typescript"],
  ["typescript", "api"],
  ["javascript", "react"],
  ["dart", "flutter"],
];

export const LANE_COLOR: Record<Lane, string> = {
  web: PALETTE.web,
  server: PALETTE.server,
  mobile: PALETTE.mobile,
  typed: PALETTE.muted,
};

export const nodeByKey = Object.fromEntries(GRAPH_NODES.map((n) => [n.key, n])) as Record<string, GraphNode>;

/** Per-edge curve shaping: [bend factor from origin, z lift]. Long hops arc around the core. */
export const EDGE_SHAPE: Record<string, [number, number]> = {
  // Next.js → API dips under the TypeScript node instead of crossing it.
  "nextjs>api": [0.9, 0.7],
  "flutter>rest": [1.18, 0.4],
  "rest>node": [0.6, 1.7],
  "node>mongodb": [0.7, 1.2],
};
