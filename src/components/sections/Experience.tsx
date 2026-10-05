"use client";

import { buildExperience } from "@/animations/experience";
import { experience } from "@/data/experience";
import { useGSAPScene } from "@/hooks/useGSAPScene";
import { StackIcons } from "../projects/StackIcons";
import { ChapterHeading } from "../ui/ChapterHeading";

export function Experience() {
  const scope = useGSAPScene<HTMLElement>((conditions, root) => buildExperience(root, conditions));

  return (
    <section ref={scope} id="experience" data-world="experience" data-nav="experience" aria-labelledby="experience-title" className="relative py-28 lg:py-40">
      <div className="container-x relative grid gap-14 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-4">
          <div data-experience-heading className="lg:sticky lg:top-32">
            <ChapterHeading id="experience-title" index="10" label="Experience" title="Where the work happened.">
              Product teams, studios and independent clients. The common thread: owning features from the database to
              the screen.
            </ChapterHeading>
          </div>
        </div>

        <div data-timeline className="relative lg:col-span-7 lg:col-start-6">
          <div aria-hidden="true" className="absolute bottom-0 left-0 top-0 w-px bg-line">
            <div data-timeline-fill className="h-full w-full origin-top bg-gradient-to-b from-web via-server to-mobile" />
          </div>
          <ol>
            {experience.map((entry) => (
              <li key={`${entry.company}-${entry.period}`} data-entry className="group/card relative pb-16 pl-8 last:pb-0 sm:pl-12">
                <span
                  aria-hidden="true"
                  className="absolute -left-[5px] top-1 h-[11px] w-[11px] rounded-full border border-fg bg-fg transition-colors duration-500 group-data-[lit=false]/card:border-line-strong group-data-[lit=false]/card:bg-bg"
                />
                <div data-entry-body>
                  <p className="eyebrow">{entry.period}</p>
                  <h3 className="mt-3 text-2xl font-semibold tracking-tight sm:text-[2rem] sm:leading-tight">
                    {entry.role}
                    <span className="font-normal text-muted"> — {entry.company}</span>
                  </h3>
                  <p className="mt-4 max-w-xl text-pretty leading-relaxed text-muted">{entry.description}</p>
                  <div className="mt-5">
                    <StackIcons stack={entry.stack} size={15} withNames />
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
