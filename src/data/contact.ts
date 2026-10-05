import { profile } from "./profile";

export type ChannelId = "email" | "github" | "linkedin" | "whatsapp" | "cv";

export interface ContactLink {
  id: ChannelId;
  label: string;
  /** Shown under the label (address, handle, number). */
  value: string;
  href: string;
  external: boolean;
  download?: boolean;
  /** Accessible name for the action. */
  ariaLabel: string;
}

const strip = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

/**
 * Direct contact actions, built from the profile. Links that are not set
 * (e.g. WhatsApp) are simply left out — the list and the 3D node both adapt.
 * Every action is a plain anchor, so it works without JavaScript.
 */
export const contactLinks: ContactLink[] = [
  {
    id: "email",
    label: "Email",
    value: profile.email,
    href: `mailto:${profile.email}`,
    external: false,
    ariaLabel: `Email ${profile.name} at ${profile.email}`,
  },
  {
    id: "github",
    label: "GitHub",
    value: strip(profile.github),
    href: profile.github,
    external: true,
    ariaLabel: `${profile.name} on GitHub (opens in a new tab)`,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    value: strip(profile.linkedin),
    href: profile.linkedin,
    external: true,
    ariaLabel: `${profile.name} on LinkedIn (opens in a new tab)`,
  },
  ...(profile.whatsapp
    ? [
        {
          id: "whatsapp" as const,
          label: "WhatsApp",
          value: profile.whatsapp,
          href: `https://wa.me/${profile.whatsapp.replace(/\D/g, "")}`,
          external: true,
          ariaLabel: `Message ${profile.name} on WhatsApp (opens in a new tab)`,
        },
      ]
    : []),
  {
    id: "cv",
    label: "Download CV",
    value: "PDF",
    href: profile.cvUrl,
    external: false,
    download: true,
    ariaLabel: `Download ${profile.name}'s CV (PDF)`,
  },
];

/** Channels wired into the 3D communication node (same order as the list). */
export const channels: { id: ChannelId; label: string }[] = contactLinks.map((l) => ({
  id: l.id,
  label: l.id === "cv" ? "CV" : l.label,
}));
