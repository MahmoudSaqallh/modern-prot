import {
  siAndroid,
  siCss,
  siDart,
  siExpress,
  siFigma,
  siFlutter,
  siGit,
  siGithub,
  siGsap,
  siHtml5,
  siJavascript,
  siMongodb,
  siNextdotjs,
  siNodedotjs,
  siPostman,
  siReact,
  siSocketdotio,
  siTailwindcss,
  siThreedotjs,
  siTypescript,
} from "simple-icons";

export type TechCategory = "frontend" | "backend" | "mobile" | "tools";

/** Brand marks come from Simple Icons; generic concepts use Lucide (see TechIcon). */
export type TechIconSource = { path: string; hex: string } | { lucide: "api" | "auth" | "database" };

export interface Technology {
  id: TechId;
  name: string;
  category: TechCategory;
  icon: TechIconSource;
  /** Short capability label shown under the name. */
  capability: string;
  description: string;
  /** Technologies this one is usually built with (drives relationship highlights). */
  related: TechId[];
  /** Foundations are listed compactly rather than as full skill items. */
  foundation?: boolean;
}

export type TechId =
  | "react"
  | "nextjs"
  | "typescript"
  | "javascript"
  | "html"
  | "css"
  | "tailwind"
  | "gsap"
  | "threejs"
  | "node"
  | "express"
  | "mongodb"
  | "rest"
  | "socketio"
  | "auth"
  | "flutter"
  | "dart"
  | "android"
  | "git"
  | "github"
  | "postman"
  | "figma";

const brand = (icon: { path: string; hex: string }) => ({ path: icon.path, hex: icon.hex });

export const technologies: Technology[] = [
  { id: "react", name: "React", category: "frontend", icon: brand(siReact), capability: "Component Architecture", description: "Composable, typed components and predictable state for data-heavy interfaces.", related: ["nextjs", "typescript", "tailwind"] },
  { id: "nextjs", name: "Next.js", category: "frontend", icon: brand(siNextdotjs), capability: "Full Stack Web Applications", description: "App Router, server components, ISR and route handlers for fast, indexable products.", related: ["react", "typescript", "node"] },
  { id: "typescript", name: "TypeScript", category: "frontend", icon: brand(siTypescript), capability: "Typed contracts", description: "Shared types between API and client so breaking changes fail at build time.", related: ["react", "nextjs", "node"] },
  { id: "tailwind", name: "Tailwind", category: "frontend", icon: brand(siTailwindcss), capability: "Utility-first UI", description: "Consistent spacing, type and colour from a small token set.", related: ["react", "nextjs"] },
  { id: "gsap", name: "GSAP", category: "frontend", icon: brand(siGsap), capability: "Advanced Motion", description: "Timelines and scroll-driven sequences with proper cleanup in React.", related: ["threejs", "react"] },
  { id: "threejs", name: "Three.js", category: "frontend", icon: brand(siThreedotjs), capability: "Interactive 3D Web", description: "React Three Fiber scenes where depth explains something.", related: ["gsap", "react"] },
  { id: "javascript", name: "JavaScript", category: "frontend", icon: brand(siJavascript), capability: "Language of the web", description: "Modern ES modules everywhere: browser, server and tooling.", related: ["typescript", "react", "node"] },
  { id: "html", name: "HTML", category: "frontend", icon: brand(siHtml5), capability: "Semantics", description: "Accessible, semantic markup first.", related: ["css"], foundation: true },
  { id: "css", name: "CSS", category: "frontend", icon: brand(siCss), capability: "Layout", description: "Grid, container queries and motion that respects user settings.", related: ["tailwind"], foundation: true },

  { id: "node", name: "Node.js", category: "backend", icon: brand(siNodedotjs), capability: "Backend Services", description: "Services, jobs and integrations running on the same language as the client.", related: ["express", "mongodb", "rest"] },
  { id: "express", name: "Express", category: "backend", icon: brand(siExpress), capability: "REST APIs", description: "Layered routes, validation, auth middleware and consistent errors.", related: ["node", "rest", "mongodb"] },
  { id: "mongodb", name: "MongoDB", category: "backend", icon: brand(siMongodb), capability: "Database Modeling", description: "Schemas, indexes and aggregation pipelines shaped by real queries.", related: ["express", "node"] },
  { id: "rest", name: "REST APIs", category: "backend", icon: { lucide: "api" }, capability: "API design", description: "Versioned resources consumed by both the web app and the Flutter app.", related: ["express", "flutter", "postman"] },
  { id: "auth", name: "Authentication", category: "backend", icon: { lucide: "auth" }, capability: "JWT, sessions, roles", description: "Access and refresh tokens, hashed credentials and role checks in middleware.", related: ["express", "node", "rest"] },
  { id: "socketio", name: "Socket.IO", category: "backend", icon: brand(siSocketdotio), capability: "Realtime", description: "Live tracking, chat and presence with rooms and acknowledgements.", related: ["node", "react", "flutter"] },

  { id: "flutter", name: "Flutter", category: "mobile", icon: brand(siFlutter), capability: "Cross-platform Mobile Apps", description: "One codebase, native feel, custom design system.", related: ["dart", "android", "rest"] },
  { id: "dart", name: "Dart", category: "mobile", icon: brand(siDart), capability: "Typed app logic", description: "Models, repositories and state management with null safety.", related: ["flutter"] },
  { id: "android", name: "Android", category: "mobile", icon: brand(siAndroid), capability: "Platform releases", description: "Play Store builds, push notifications and device APIs.", related: ["flutter"] },

  { id: "git", name: "Git", category: "tools", icon: brand(siGit), capability: "Version control", description: "Small commits, clean history, reviewable changes.", related: ["github"] },
  { id: "github", name: "GitHub", category: "tools", icon: brand(siGithub), capability: "CI & reviews", description: "Pull requests and Actions pipelines for every project.", related: ["git"] },
  { id: "postman", name: "Postman", category: "tools", icon: brand(siPostman), capability: "API testing", description: "Collections and environments that document every endpoint.", related: ["rest", "express"] },
  { id: "figma", name: "Figma", category: "tools", icon: brand(siFigma), capability: "UI handoff", description: "Wireframes, prototypes and component specs before code.", related: ["react", "flutter"] },
];

export const techById = Object.fromEntries(technologies.map((t) => [t.id, t])) as Record<TechId, Technology>;

export const categoryMeta: Record<TechCategory, { label: string; color: string; description: string }> = {
  frontend: { label: "Frontend", color: "var(--color-web)", description: "Interfaces, motion and rendering" },
  backend: { label: "Backend", color: "var(--color-server)", description: "APIs, data and realtime" },
  mobile: { label: "Mobile", color: "var(--color-mobile)", description: "Native-feeling apps from one codebase" },
  tools: { label: "Tools", color: "var(--color-muted)", description: "Design, testing and delivery" },
};

export const techCategories: TechCategory[] = ["frontend", "backend", "mobile", "tools"];
