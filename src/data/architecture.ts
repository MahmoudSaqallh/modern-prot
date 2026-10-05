import type { TechId } from "./technologies";

// Content for the architecture visuals (MERN flow, API demo, database,
// Flutter flow). Components render from this data only.

export interface FlowStage {
  id: string;
  name: string;
  /** Technologies shown as icons on the stage. Empty = generic icon. */
  icons: TechId[];
  generic?: "request" | "response";
  role: string;
  description: string;
}

/** A request's round trip through a MERN application. */
export const mernFlow: FlowStage[] = [
  { id: "ui", name: "React / Next.js UI", icons: ["react", "nextjs"], role: "Interactive user interfaces", description: "The user filters projects; the component asks the API for data and shows a loading state." },
  { id: "request", name: "API Request", icons: [], generic: "request", role: "HTTP + JSON", description: "A typed client sends GET /api/projects with the user's access token." },
  { id: "node", name: "Node.js", icons: ["node"], role: "Server-side runtime", description: "Runs the API process, connection pools and background jobs." },
  { id: "express", name: "Express", icons: ["express"], role: "API and routing layer", description: "Routes the request, validates input and checks permissions in middleware." },
  { id: "mongo", name: "MongoDB", icons: ["mongodb"], role: "Application data", description: "An indexed query returns only the fields the UI needs." },
  { id: "response", name: "Response", icons: [], generic: "response", role: "Back to the UI", description: "200 OK with JSON; the UI caches it and renders the list." },
];

/** The same backend, consumed by the Flutter app. */
export const flutterFlow: { id: string; name: string; note: string; icon: TechId }[] = [
  { id: "app", name: "Flutter App", note: "Dart · Riverpod", icon: "flutter" },
  { id: "api", name: "REST API", note: "JSON over HTTPS", icon: "rest" },
  { id: "server", name: "Node.js Backend", note: "Express routes", icon: "node" },
  { id: "db", name: "MongoDB", note: "Shared data", icon: "mongodb" },
];

export const mobileFeatures = [
  "Cross-platform UI",
  "REST API integration",
  "State management",
  "Push notifications",
  "Secure authentication",
  "Responsive layouts",
];

export const mobileScreens = [
  { id: "auth", label: "Sign in" },
  { id: "home", label: "Home" },
  { id: "booking", label: "Booking" },
];

/** Sample collections for the database visual. */
export const collections: { name: string; count: number; sample: Record<string, string> }[] = [
  { name: "users", count: 1284, sample: { _id: 'ObjectId("66f1…a3")', name: '"Sara Haddad"', role: '"customer"', createdAt: 'ISODate("2025-03-02")' } },
  { name: "projects", count: 42, sample: { _id: 'ObjectId("66f2…7c")', title: '"Fleetline"', stack: '["MERN", "Flutter"]', status: '"live"' } },
  { name: "orders", count: 9631, sample: { _id: 'ObjectId("66f3…19")', userId: 'ObjectId("66f1…a3")', total: "148.5", status: '"delivered"' } },
  { name: "messages", count: 20417, sample: { _id: 'ObjectId("66f4…e0")', room: '"order:4821"', body: '"On my way"', sentAt: 'ISODate("2025-03-02")' } },
];

export const apiResponse = `{
  "data": [
    { "title": "Fleetline", "stack": ["MERN", "Flutter"] },
    { "title": "Pulse Analytics", "stack": ["Next.js"] }
  ],
  "total": 42
}`;

/** Frontend architecture layers shown in the 3D browser (front to back). */
export interface FrontendLayer {
  id: string;
  name: string;
  techs: TechId[];
  description: string;
  fragment: string[];
}

export const frontendLayers: FrontendLayer[] = [
  { id: "ui", name: "UI", techs: ["tailwind", "gsap"], description: "Responsive layouts, motion and 3D where it explains something.", fragment: [] },
  {
    id: "components",
    name: "Components",
    techs: ["react", "nextjs"],
    description: "Small, typed components composed into routes and layouts.",
    fragment: ["<App>", "  <Header />", "  <ProjectGrid>", "    <ProjectCard />", "  </ProjectGrid>"],
  },
  {
    id: "state",
    name: "State",
    techs: ["react", "typescript"],
    description: "Server state cached, UI state local, nothing duplicated.",
    fragment: ["const [filter, setFilter] =", "  useState<Filter>('All');", "const { data } = useProjects(filter);"],
  },
  {
    id: "api",
    name: "API Calls",
    techs: ["typescript", "nextjs"],
    description: "One typed client per resource; errors handled in one place.",
    fragment: ["GET  /api/projects     200  48ms", "GET  /api/user        200  31ms", "POST /api/contact     201  92ms"],
  },
];

/** Realistic snippets for the code visuals (typed panel and 3D fragments). */
export const codeSnippets: { id: string; label: string; file: string; tech: TechId; lines: string[] }[] = [
  {
    id: "react",
    label: "React",
    file: "Experience.tsx",
    tech: "react",
    lines: [
      "export function Experience() {",
      "  const { data, isLoading } = useProjects();",
      "  if (isLoading) return <Skeleton />;",
      "  return <ProjectGrid items={data} />;",
      "}",
    ],
  },
  {
    id: "node",
    label: "Node / Express",
    file: "routes/projects.js",
    tech: "express",
    lines: [
      'app.get("/api/projects", auth, async (req, res) => {',
      '  const projects = await Project.find({ status: "live" })',
      "    .select({ title: 1, stack: 1 });",
      "  res.json({ data: projects });",
      "});",
    ],
  },
  {
    id: "mongodb",
    label: "MongoDB",
    file: "mongosh",
    tech: "mongodb",
    lines: ['db.projects.find(', '  { stack: "MERN" },', "  { title: 1, stack: 1 }", ").sort({ createdAt: -1 }).limit(6)"],
  },
  {
    id: "flutter",
    label: "Flutter",
    file: "project_list.dart",
    tech: "flutter",
    lines: [
      "@override",
      "Widget build(BuildContext context) {",
      "  final projects = ref.watch(projectsProvider);",
      "  return ListView.builder(",
      "    itemCount: projects.length,",
      "    itemBuilder: (_, i) => ProjectTile(projects[i]),",
      "  );",
      "}",
    ],
  },
];

/** Backend scene: the path a request takes, and the path its response takes back. */
export const requestPath = ["client", "api", "node", "express", "auth", "express", "mongodb"];
export const responsePath = ["mongodb", "express", "node", "api", "client"];
