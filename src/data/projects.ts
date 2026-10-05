import type { TechId } from "./technologies";

// Featured work. These are placeholder projects: replace titles, copy and links
// with your own. Put a screenshot in /public/projects and set `image` to use it
// instead of the generated interface preview.

export const projectFilters = ["All", "MERN", "Next.js", "Flutter", "Full Stack", "Frontend"] as const;
export type ProjectFilter = (typeof projectFilters)[number];

export type ProjectType =
  | "MERN Full Stack"
  | "Next.js Dashboard"
  | "Flutter Mobile App"
  | "REST API System"
  | "Admin Panel"
  | "Next.js Website";

export type PreviewKind = "logistics" | "commerce" | "dashboard" | "mobile" | "saas" | "api" | "admin";
export type DeviceKind = "laptop" | "browser" | "phone" | "desktop";

export interface Project {
  slug: string;
  title: string;
  type: ProjectType;
  /** Filter groups this project belongs to (besides "All"). */
  category: Exclude<ProjectFilter, "All">[];
  year: string;
  description: string;
  /** What you did on the project. */
  role: string;
  stack: TechId[];
  preview: PreviewKind;
  /** Device used for the featured layout and phone previews. */
  device: DeviceKind;
  image?: string;
  liveUrl?: string;
  githubUrl?: string;
  caseStudyUrl?: string;
  featured?: boolean;
  /** Short case study, shown for the featured project. */
  caseStudy?: { problem: string; solution: string; outcome: string };
  accent: string;
}

export const projects: Project[] = [
  {
    slug: "fleetline",
    title: "Fleetline",
    type: "MERN Full Stack",
    category: ["MERN", "Full Stack", "Flutter"],
    year: "2025",
    description:
      "Dispatch platform for a delivery company: order intake, driver assignment and live tracking for operators, drivers and customers.",
    role: "Lead developer — architecture, API, web console and driver app",
    stack: ["react", "node", "express", "mongodb", "socketio", "flutter"],
    preview: "logistics",
    device: "laptop",
    liveUrl: "https://example.com",
    githubUrl: "https://github.com/your-username/fleetline",
    featured: true,
    caseStudy: {
      problem: "Operators assigned drivers by phone; every order took around six minutes and nobody knew where a parcel was.",
      solution: "A React console and a Flutter driver app on one Express + MongoDB API, with Socket.IO pushing status and location live.",
      outcome: "Assignment under 30 seconds and live ETAs for every customer.",
    },
    accent: "#33d6ff",
  },
  {
    slug: "northwind",
    title: "Northwind Store",
    type: "MERN Full Stack",
    category: ["MERN", "Full Stack"],
    year: "2024",
    description: "Storefront with catalogue search, cart, Stripe checkout and an inventory API shared with the warehouse tools.",
    role: "Full stack developer — storefront, checkout and inventory API",
    stack: ["react", "express", "mongodb", "node", "tailwind"],
    preview: "commerce",
    device: "browser",
    liveUrl: "https://example.com",
    githubUrl: "https://github.com/your-username/northwind",
    caseStudy: {
      problem: "Checkout dropped carts on mobile and stock was edited by hand in two places.",
      solution: "A React storefront and Stripe checkout on an Express inventory API shared with the warehouse tools.",
      outcome: "One source of stock truth and a faster, simpler mobile checkout.",
    },
    accent: "#e8c07a",
  },
  {
    slug: "pulse",
    title: "Pulse Analytics",
    type: "Next.js Dashboard",
    category: ["Next.js", "Frontend"],
    year: "2024",
    description: "Revenue and operations dashboard with role-based access, exportable reports and server-rendered charts.",
    role: "Frontend lead — dashboard, charts and access control",
    stack: ["nextjs", "typescript", "tailwind", "node"],
    preview: "dashboard",
    device: "desktop",
    liveUrl: "https://example.com",
    githubUrl: "https://github.com/your-username/pulse",
    caseStudy: {
      problem: "Managers exported spreadsheets every Monday to see last week's numbers.",
      solution: "A Next.js dashboard with server-rendered charts, role-based access and scheduled exports.",
      outcome: "Live numbers for every role without manual reports.",
    },
    accent: "#5be37d",
  },
  {
    slug: "medora",
    title: "Medora",
    type: "Flutter Mobile App",
    category: ["Flutter"],
    year: "2024",
    description: "Clinic booking app: doctor search, appointment slots, push reminders and secure patient sign-in.",
    role: "Mobile developer — Flutter app and booking API",
    stack: ["flutter", "dart", "android", "rest", "node"],
    preview: "mobile",
    device: "phone",
    githubUrl: "https://github.com/your-username/medora",
    caseStudy: {
      problem: "Patients booked by phone and often missed appointments.",
      solution: "A Flutter app with doctor search, slot booking and Firebase push reminders on a Node.js API.",
      outcome: "Self-service booking and fewer missed appointments.",
    },
    accent: "#3b82f6",
  },
  {
    slug: "relay",
    title: "Relay API",
    type: "REST API System",
    category: ["MERN", "Full Stack"],
    year: "2023",
    description: "Versioned REST API with JWT auth, role permissions, rate limiting and generated docs, used by web and mobile clients.",
    role: "Backend developer — API design, auth and documentation",
    stack: ["node", "express", "mongodb", "rest", "postman"],
    preview: "api",
    device: "browser",
    githubUrl: "https://github.com/your-username/relay-api",
    caseStudy: {
      problem: "Three clients each talked to the database in their own way.",
      solution: "One versioned REST API with JWT auth, role permissions, rate limiting and generated docs.",
      outcome: "Web and mobile clients share a single, documented contract.",
    },
    accent: "#5be37d",
  },
  {
    slug: "atlas",
    title: "Atlas Admin",
    type: "Admin Panel",
    category: ["MERN", "Frontend"],
    year: "2023",
    description: "Back-office panel for content, users and orders with an audit log for every change.",
    role: "Full stack developer — admin UI and audit log",
    stack: ["react", "typescript", "express", "mongodb"],
    preview: "admin",
    device: "browser",
    liveUrl: "https://example.com",
    caseStudy: {
      problem: "Support staff edited production data through raw database tools.",
      solution: "A React admin panel on Express with scoped permissions and an audit log for every change.",
      outcome: "Safer operations with a full history of who changed what.",
    },
    accent: "#c9a7ff",
  },
  {
    slug: "launchpad",
    title: "Launchpad",
    type: "Next.js Website",
    category: ["Next.js", "Frontend"],
    year: "2023",
    description: "Marketing site and documentation for a developer tool, statically generated with incremental revalidation.",
    role: "Developer — build, content model and performance",
    stack: ["nextjs", "typescript", "tailwind", "gsap"],
    preview: "saas",
    device: "browser",
    liveUrl: "https://example.com",
    githubUrl: "https://github.com/your-username/launchpad",
    caseStudy: {
      problem: "Docs and marketing lived in different tools and drifted apart.",
      solution: "A statically generated Next.js site with MDX docs and incremental revalidation.",
      outcome: "Docs ship with the product and pages load instantly.",
    },
    accent: "#f08a6c",
  },
];
