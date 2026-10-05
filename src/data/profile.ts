// Personal details. Replace the placeholder values with your own.
// Optional fields render only when set: nothing is shown that you did not provide.
export interface Profile {
  name: string;
  initials: string;
  role: string;
  /** Phrases cycled by the hero typewriter. */
  heroPhrases: readonly string[];
  specialty: string;
  message: string;
  intro: string;
  focus: string;
  email: string;
  github: string;
  linkedin: string;
  cvUrl: string;
  /** Path in /public, e.g. "/avatar.jpg". A monogram is shown when absent. */
  avatar?: string;
  yearsExperience?: number;
  location?: string;
  availability?: string;
  /** International format, e.g. "+970 59 123 4567". The WhatsApp link appears only when set. */
  whatsapp?: string;
  /** What you are open to, listed under the contact headline. */
  availableFor?: readonly string[];
}

export const profile: Profile = {
  name: "Mahmoud Saqallah",
  initials: "MS",
  role: "Full Stack Developer",
  heroPhrases: ["Full Stack Developer", "MERN Stack Developer", "Next.js Developer", "Flutter Developer", "I Turn Code Into Products"],
  specialty: "MERN Stack + Flutter Developer",
  message:
    "A Full Stack developer specialized in building professional web applications using MongoDB, Express, React, and Node.js. I focus on user experience, high performance, and clean code. I turn ideas into complete digital products.",
  intro:
    "From React and Next.js interfaces to Node.js and Express APIs on MongoDB, and Flutter apps that share the same backend.",
  focus: "Full stack web platforms with a companion Flutter app.",
  email: "adamsakallh@gmail.com",
  github: "https://github.com/MahmoudSaqallh",
  linkedin: "https://www.linkedin.com/in/mahmoudsaqallah",
  cvUrl: "/MahmoudSaqallh.pdf",
  avatar: "/profile.webp",
  whatsapp: "+972 59 966 3952",
  location: "Gaza, Palestine",
  // Shown in the contact section as the system status. Edit or remove as needed.
  availability: "Available for work",
  availableFor: ["MERN Stack", "Next.js", "Flutter", "Full Stack Development"],
};

export const navItems = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "stack", label: "Stack" },
  { id: "projects", label: "Projects" },
  { id: "experience", label: "Experience" },
  { id: "contact", label: "Contact" },
] as const;

export type NavId = (typeof navItems)[number]["id"];
