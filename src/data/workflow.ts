import type { TechId } from "./technologies";

export interface WorkflowStage {
  id: string;
  label: string;
  /** Brand icon where the stage maps to a tool; otherwise a Lucide glyph. */
  icon: TechId | "idea" | "testing" | "deploy";
  description: string;
  /** The small piece of code/data that leaves this stage. */
  signal: string;
}

export const workflow: WorkflowStage[] = [
  { id: "idea", label: "Idea", icon: "idea", description: "Define the problem, the users and what success looks like.", signal: "problem → goal" },
  { id: "design", label: "Design", icon: "figma", description: "Flows, wireframes and a small component set in Figma.", signal: "24 frames · tokens.json" },
  { id: "frontend", label: "Frontend", icon: "react", description: "Typed React / Next.js screens, accessible and fast.", signal: "<ProjectGrid />" },
  { id: "api", label: "API", icon: "rest", description: "Versioned REST contracts shared by web and mobile.", signal: "GET /api/projects" },
  { id: "backend", label: "Backend", icon: "node", description: "Express services with validation, auth and clear errors.", signal: "app.listen(8080)" },
  { id: "database", label: "Database", icon: "mongodb", description: "MongoDB models and indexes shaped by real queries.", signal: "createIndex({ slug: 1 })" },
  { id: "mobile", label: "Mobile", icon: "flutter", description: "A Flutter app on the same API and data model.", signal: "flutter build apk" },
  { id: "testing", label: "Testing", icon: "testing", description: "API contracts, UI states and real devices checked.", signal: "✓ 128 passed" },
  { id: "deploy", label: "Deployment", icon: "deploy", description: "CI builds, environment config, monitoring and rollback.", signal: "deploy → production" },
];
