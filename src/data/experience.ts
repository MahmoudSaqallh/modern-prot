import type { TechId } from "./technologies";

// Placeholder career history. Replace with your own roles.
export interface ExperienceEntry {
  company: string;
  role: string;
  period: string;
  description: string;
  stack: TechId[];
}

export const experience: ExperienceEntry[] = [
  {
    company: "Independent",
    role: "Full Stack & Flutter Developer",
    period: "2024 — Present",
    description:
      "Complete products for small teams: web console, API and mobile app from one shared data model, including live dispatch and tracking.",
    stack: ["nextjs", "node", "express", "mongodb", "flutter", "socketio"],
  },
  {
    company: "Brightlane Studio",
    role: "Frontend Developer",
    period: "2022 — 2024",
    description:
      "Built the component library used across client sites and introduced typed API clients, removing a class of production bugs.",
    stack: ["react", "typescript", "tailwind", "gsap"],
  },
  {
    company: "Corelink Systems",
    role: "Junior MERN Developer",
    period: "2021 — 2022",
    description: "Maintained admin tools and REST services; rewrote slow reporting queries as aggregation pipelines.",
    stack: ["express", "mongodb", "react", "postman"],
  },
];
