import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  width: 16,
  height: 16,
  viewBox: "0 0 16 16",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function ArrowUpRight(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4.5 11.5 11.5 4.5M5.5 4.5h6v6" />
    </svg>
  );
}

export function ArrowDown(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M8 3v10M3.5 8.5 8 13l4.5-4.5" />
    </svg>
  );
}

export function GithubIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6 13.5c-3 .9-3-1.5-4.2-1.8M10 15v-2.3c0-.7.1-1.2-.3-1.6 1.9-.2 3.8-.9 3.8-4.1 0-.9-.3-1.7-.9-2.3.3-.8.2-1.6-.1-2.4 0 0-.7-.2-2.4.9a8 8 0 0 0-4.2 0C4.2 2.1 3.5 2.3 3.5 2.3c-.3.8-.4 1.6-.1 2.4-.6.6-.9 1.4-.9 2.3 0 3.2 1.9 3.9 3.8 4.1-.4.4-.4.9-.3 1.6V15" />
    </svg>
  );
}

export function CopyIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" />
      <path d="M10.5 5.5V3.5A1 1 0 0 0 9.5 2.5h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m3 8.5 3 3 7-7" />
    </svg>
  );
}
