"use client";

import { buildHeroExit, buildHeroIntro } from "@/animations/hero";
import { bootStatus } from "@/animations/code";
import { gsap } from "@/animations/gsap";
import { profile } from "@/data/profile";
import { techById, type TechId } from "@/data/technologies";
import { useGSAPScene } from "@/hooks/useGSAPScene";
import { world } from "@/lib/world";
import { ActionLink } from "../ui/ActionLink";
import AnimatedText from "../ui/AnimatedText";
import { TechIcon } from "../ui/TechIcon";
import { StatusLine } from "./Chapter";

const LANES: { label: string; color: string; chain: TechId[] }[] = [
  { label: "Web", color: "var(--color-web)", chain: ["react", "nextjs", "rest", "node", "express", "mongodb"] },
  { label: "Mobile", color: "var(--color-mobile)", chain: ["flutter", "rest", "node", "mongodb"] },
];

/** The 3D developer core lives in the persistent world behind this section. */
export function Hero() {
  const scope = useGSAPScene<HTMLElement>(({ motion }, root) => {
    if (!motion) {
      world.intro = 1;
      return;
    }
    buildHeroExit(root);
    const stopIntro = buildHeroIntro(root);
    const status = gsap.utils.selector(root)("[data-status]")[0] as HTMLElement | undefined;
    const stopStatus = bootStatus(status ?? null, root);
    return () => {
      stopIntro?.();
      stopStatus();
    };
  });

  return (
    <section ref={scope} id="home" data-world="hero" data-nav="home" aria-labelledby="hero-title" className="relative">
      <div data-hero-content className="container-x relative flex min-h-svh flex-col justify-end pb-8 pt-28 lg:pb-12">
        <div className="max-w-[46rem]">
          <p data-hero-fade className="eyebrow mb-6 flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="text-fg">{profile.name}</span>
            <span aria-hidden="true" className="h-px w-6 bg-line-strong" />
            <span>Programmer · Web &amp; Mobile</span>
          </p>

          <h1 id="hero-title" className="display-md">
            {/* Static name for assistive tech; the typewriter is visual only. */}
            <span className="sr-only">
              {profile.name}, {profile.role}
            </span>
            {/* Two lines reserved so typing never shifts the layout. */}
            <span aria-hidden="true" className="block min-h-[1.8em]">
              <AnimatedText phrases={profile.heroPhrases} />
            </span>
          </h1>

          <p data-hero-fade className=" max-w-xl text-pretty text-base leading-relaxed text-muted sm:text-lg">
            {profile.message}
          </p>
          <div data-hero-fade>
            <StatusLine text="whoami → full-stack developer · building web & mobile systems" />
          </div>

          <div data-hero-fade className="mt-8 flex flex-wrap gap-3">
            <ActionLink href="#projects" hint="cd ~/projects">
              View Projects
            </ActionLink>
            <ActionLink href="#contact" variant="ghost" hint="./contact.sh">
              Contact Me
            </ActionLink>
          </div>
        </div>

        <div className="mt-14 grid gap-3 border-t border-line pt-5 sm:grid-cols-2 lg:max-w-[48rem]">
          {LANES.map((lane) => (
            <div key={lane.label} data-hero-lane className="flex items-center gap-3">
              <span className="eyebrow w-14 flex-none" style={{ color: lane.color }}>
                {lane.label}
              </span>
              <ol className="flex items-center gap-1.5 text-muted" aria-label={`${lane.label} request path`}>
                {lane.chain.map((id, i) => (
                  <li key={`${id}-${i}`} className="flex items-center gap-1.5">
                    <span title={techById[id].name} className="grid h-7 w-7 place-items-center rounded-full border border-line-strong bg-bg/70">
                      <TechIcon id={id} size={13} title={techById[id].name} />
                    </span>
                    {i < lane.chain.length - 1 && <span aria-hidden="true" className="h-px w-3 bg-line-strong" />}
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
