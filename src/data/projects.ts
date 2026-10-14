import type { TechId } from "./technologies";

// Selected work. Screenshots live in /public/projects; every project links to
// its live deployment where one exists.

export const projectFilters = ["All", "HTML / CSS / JS", "Next.js / React", "Three.js"] as const;
export type ProjectFilter = (typeof projectFilters)[number];

export type ProjectType =
  | "Warehouse SaaS"
  | "Admin Dashboard"
  | "Logistics Platform"
  | "Restaurant Website"
  | "3D Virtual Mall"
  | "Collaboration App"
  | "Healthcare Website"
  | "E-commerce Store"
  | "Travel Website"
  | "Agency Website"
  | "E-learning Platform"
  | "School Website";

export type PreviewKind = "logistics" | "commerce" | "dashboard" | "mobile" | "saas" | "api" | "admin";
export type DeviceKind = "laptop" | "browser" | "phone" | "desktop";

export interface Project {
  slug: string;
  title: string;
  type: ProjectType;
  /** Filter group this project belongs to (besides "All"). */
  category: Exclude<ProjectFilter, "All">[];
  year?: string;
  description: string;
  /** What you did on the project (shown with the case study). */
  role?: string;
  stack: TechId[];
  /** Interface language: Arabic sites are right-to-left. */
  lang: "en" | "ar";
  /** Generated interface shown when there is no screenshot. */
  preview?: PreviewKind;
  /** Device used for the featured layout and the project view. */
  device: DeviceKind;
  /** Screenshot in /public/projects. */
  image?: string;
  /** Several screens: shown as a slider in the card and the project view. */
  gallery?: readonly { src: string; caption: string }[];
  liveUrl?: string;
  githubUrl?: string;
  caseStudyUrl?: string;
  featured?: boolean;
  caseStudy?: { problem: string; solution: string; outcome: string };
  accent: string;
}

const STATIC: TechId[] = ["html", "css", "javascript"];
const NEXT: TechId[] = ["nextjs", "react", "tailwind"];

export const projects: Project[] = [
  {
    slug: "dqq",
    title: "Dqq",
    type: "Warehouse SaaS",
    category: ["Next.js / React"],
    description:
      "Smart system for warehouses and online stores that speeds up order preparation, cuts picking errors and lowers costs. Bilingual Arabic / English site with web dashboard and mobile previews.",
    stack: NEXT,
    lang: "ar",
    device: "laptop",
    image: "/projects/dqq.png",
    liveUrl: "https://dqq-rco3.vercel.app/",
    featured: true,
    accent: "#2fbf5b",
  },
  {
    slug: "dqq-dashboard",
    title: "Dqq Dashboard",
    type: "Admin Dashboard",
    category: ["Next.js / React"],
    description:
      "Admin dashboard for the Dqq warehouse system: order status overview, picking lists, waybills and shipments, wallet and transactions, returns, reports and a delay-management system with on-time shipment rate.",
    stack: NEXT,
    lang: "en",
    device: "desktop",
    image: "/dashboard/dqq-dashboard-1.webp",
    gallery: [
      { src: "/dashboard/dqq-dashboard-1.webp", caption: "Dashboard overview" },
      { src: "/dashboard/dqq-dashboard-2.webp", caption: "Waybills & shipments" },
      { src: "/dashboard/dqq-dashboard-3.webp", caption: "Reports" },
      { src: "/dashboard/dqq-dashboard-4.webp", caption: "Delay management" },
    ],
    accent: "#34c26b",
  },
  {
    slug: "logisphere",
    title: "Logisphere",
    type: "Logistics Platform",
    category: ["Next.js / React"],
    description:
      "Delivery and logistics operations platform: fleet management, shipment tracking and delivery optimisation, with a real-time 3D truck model and the shipment → dispatch → driver → delivery flow.",
    stack: NEXT,
    lang: "en",
    device: "browser",
    image: "/projects/logisphere.webp",
    liveUrl: "https://dilivery-tau.vercel.app/",
    accent: "#ff8a3d",
  },
  {
    slug: "jamra",
    title: "Jamra",
    type: "Restaurant Website",
    category: ["Next.js / React"],
    description: "Arabic restaurant website with menu, offers, favourites and cart, opening hours and an order-now flow from the first click.",
    stack: NEXT,
    lang: "ar",
    device: "browser",
    image: "/projects/jamra.webp",
    liveUrl: "https://resturent-steel.vercel.app/",
    accent: "#e8552b",
  },
  {
    slug: "orvena",
    title: "Orvena",
    type: "E-commerce Store",
    category: ["Next.js / React"],
    description: "Modern fashion store with product search, wishlist and cart, a seasonal hero slider and a first-purchase signup.",
    stack: NEXT,
    lang: "en",
    device: "browser",
    image: "/projects/orvena.png",
    liveUrl: "https://fastidious-shortbread-cb638e.netlify.app/",
    accent: "#f2c94c",
  },
  {
    slug: "public-service-association",
    title: "Public Service Association",
    type: "Healthcare Website",
    category: ["Next.js / React"],
    description: "Arabic site for a hospital group: clinics, appointment booking and a patient portal in one place.",
    stack: NEXT,
    lang: "ar",
    device: "browser",
    image: "/projects/public-service-association.png",
    liveUrl: "https://scintillating-bombolone-86d1be.netlify.app/",
    accent: "#4caf50",
  },
  {
    slug: "travelor",
    title: "Travelor",
    type: "Travel Website",
    category: ["Next.js / React"],
    description: "Tourism site for discovering destinations and tours, with a bold editorial hero and offers.",
    stack: NEXT,
    lang: "en",
    device: "browser",
    image: "/projects/travelor.png",
    liveUrl: "https://travelor-pjsm.vercel.app/",
    accent: "#8bd400",
  },
  {
    slug: "mallverse",
    title: "MallVerse",
    type: "3D Virtual Mall",
    category: ["Three.js"],
    description:
      "An explorable 3D shopping mall in the browser: walk an avatar through the atrium and six boutiques, inspect products in 3D and fill a demo cart, with a minimap, floor levels, day/night mode and an assistant.",
    stack: ["threejs", "react", "nextjs"],
    lang: "en",
    device: "laptop",
    image: "/projects/mallverse.webp",
    liveUrl: "https://moal-zeta.vercel.app/",
    featured: true,
    accent: "#d9a35f",
  },
  {
    slug: "smartboard",
    title: "Smartboard",
    type: "Collaboration App",
    category: ["Next.js / React"],
    description: "Collaborative whiteboard for lessons: pen, shapes, text and sticky notes, keyboard shortcuts, pages and shared sessions.",
    stack: NEXT,
    lang: "en",
    device: "browser",
    image: "/projects/smartboard.png",
    liveUrl: "https://smart-board-5m6t.vercel.app/board",
    accent: "#2563eb",
  },
  {
    slug: "lilia",
    title: "Lilia",
    type: "Agency Website",
    category: ["HTML / CSS / JS"],
    description: "Digital agency website presenting services, portfolio, team and blog.",
    stack: STATIC,
    lang: "en",
    device: "browser",
    image: "/projects/lilia.png",
    liveUrl: "https://incredible-bubblegum-63ecb1.netlify.app/",
    accent: "#f7914f",
  },
  {
    slug: "for-education",
    title: "For Education",
    type: "E-learning Platform",
    category: ["HTML / CSS / JS"],
    description: "Online learning platform for finding courses and learning new skills.",
    stack: STATIC,
    lang: "en",
    device: "browser",
    image: "/projects/for-education.png",
    liveUrl: "https://cozy-gumdrop-c02ca5.netlify.app/",
    accent: "#f5c400",
  },
  {
    slug: "shoop",
    title: "ShoOp",
    type: "E-commerce Store",
    category: ["HTML / CSS / JS"],
    description: "Fashion e-commerce storefront with an elegant, editorial interface.",
    stack: STATIC,
    lang: "en",
    device: "browser",
    image: "/projects/shop.png",
    liveUrl: "https://melodious-meringue-9b35d0.netlify.app/",
    accent: "#e0306f",
  },
  {
    slug: "amiri-schools",
    title: "Al-Amiri Schools",
    type: "School Website",
    category: ["HTML / CSS / JS"],
    description: "Arabic school website with activities, news and a parents' section.",
    stack: STATIC,
    lang: "ar",
    device: "browser",
    image: "/projects/amiri-schools.png",
    liveUrl: "https://dazzling-gumption-8ce4ae.netlify.app/",
    accent: "#5bc8bc",
  },
  {
    slug: "pixora-media",
    title: "Pixora Media",
    type: "Agency Website",
    category: ["HTML / CSS / JS"],
    description: "Arabic marketing agency website with services, customer care and a free-consultation call to action.",
    stack: STATIC,
    lang: "ar",
    device: "browser",
    image: "/projects/pixora-media.png",
    accent: "#e5242f",
  },
];
