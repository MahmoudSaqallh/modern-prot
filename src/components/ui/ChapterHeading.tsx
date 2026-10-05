import type { ReactNode } from "react";

interface ChapterHeadingProps {
  index: string;
  label: string;
  title: ReactNode;
  id: string;
  children?: ReactNode;
  size?: "lg" | "md";
  className?: string;
}

/**
 * Chapter opener: technical index, title, intro. Animation hooks are data
 * attributes so each section can choose its own entrance.
 */
export function ChapterHeading({ index, label, title, id, children, size = "md", className = "" }: ChapterHeadingProps) {
  return (
    <header className={className}>
      <p data-reveal="eyebrow" className="eyebrow flex items-center gap-3">
        <span className="text-fg">{index}</span>
        <span aria-hidden="true" className="h-px w-8 bg-line-strong" />
        <span>{label}</span>
      </p>
      <h2 id={id} data-reveal="title" className={`mt-5 text-balance ${size === "lg" ? "display-lg" : "display-md"}`}>
        {title}
      </h2>
      {children && (
        <p data-reveal="intro" className="mt-5 max-w-[34rem] text-pretty text-base leading-relaxed text-muted sm:text-[1.0625rem]">
          {children}
        </p>
      )}
    </header>
  );
}
