import { techById, type TechId } from "@/data/technologies";
import { iconColor, TechIcon } from "../ui/TechIcon";

/**
 * Stack icon row. Icons rest in a muted tone and take their brand colour
 * one after another when the parent card (`group/card`) is hovered or focused.
 */
export function StackIcons({ stack, size = 16, withNames = false }: { stack: TechId[]; size?: number; withNames?: boolean }) {
  return (
    <ul aria-label="Built with" className={`flex flex-wrap items-center ${withNames ? "gap-x-4 gap-y-2" : "gap-3"}`}>
      {stack.map((id, i) => {
        const tech = techById[id];
        return (
          <li
            key={id}
            title={tech.name}
            className="flex items-center gap-1.5 text-dim transition-[color,transform] duration-300 group-hover/card:-translate-y-px group-hover/card:text-[var(--icon)] group-focus-within/card:text-[var(--icon)]"
            style={{ ["--icon" as string]: iconColor(tech.icon), transitionDelay: `${i * 40}ms` }}
          >
            <TechIcon id={id} size={size} title={withNames ? undefined : tech.name} />
            {withNames && <span className="text-xs text-muted">{tech.name}</span>}
          </li>
        );
      })}
    </ul>
  );
}
