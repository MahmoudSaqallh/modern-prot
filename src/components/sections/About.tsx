"use client";

import { gsap } from "@/animations/gsap";
import { bootStatus } from "@/animations/code";
import { maskChars, rise } from "@/animations/reveal";
import { profile } from "@/data/profile";
import type { TechId } from "@/data/technologies";
import { useGSAPScene } from "@/hooks/useGSAPScene";
import { useCardTilt } from "@/hooks/useCardTilt";
import { CodeTyper } from "../ui/CodeTyper";
import { PortraitPanel } from "../ui/PortraitPanel";
import { TechIcon } from "../ui/TechIcon";
import { StatusLine } from "./Chapter";

const IDENTITY: { label: string; detail: string; icon: TechId }[] = [
  { label: "Full Stack Developer", detail: "Interface to database", icon: "node" },
  { label: "MERN Stack", detail: "MongoDB · Express · React · Node", icon: "mongodb" },
  { label: "Next.js", detail: "Server rendering, routes, dashboards", icon: "nextjs" },
  { label: "Flutter", detail: "Cross-platform mobile apps", icon: "flutter" },
  { label: "APIs", detail: "REST, auth, realtime", icon: "rest" },
  { label: "UI Engineering", detail: "Motion, 3D, accessibility", icon: "react" },
];

/** Programmer intro: who, in one line — then proof in code. */
export function About() {
  const depth = useCardTilt<HTMLDivElement>();
  const scope = useGSAPScene<HTMLElement>(({ motion }, root) => {
    if (!motion) return;
    const q = gsap.utils.selector(root);
    const hello = maskChars(q("[data-hello]")[0] ?? null);
    if (hello) {
      gsap.from(hello.chars, {
        yPercent: 110,
        duration: 1,
        stagger: 0.025,
        ease: "expo.out",
        scrollTrigger: { trigger: root, start: "top 65%", once: true },
      });
    }
    rise(q("[data-reveal='fade']"), { trigger: root, start: "top 60%", delay: 0.3 }, 0.08);
    gsap.from(q("[data-identity]"), {
      y: 20,
      rotateX: -20,
      transformPerspective: 800,
      autoAlpha: 0,
      duration: 0.8,
      stagger: 0.07,
      ease: "power3.out",
      scrollTrigger: { trigger: q("[data-identities]")[0] ?? root, start: "top 85%", once: true },
    });
    gsap.from(q("[data-editor]"), {
      y: 60,
      rotateY: -14,
      transformPerspective: 1400,
      autoAlpha: 0,
      duration: 1.3,
      ease: "expo.out",
      scrollTrigger: { trigger: root, start: "top 55%", once: true },
    });
    // Portrait: masked reveal from the bottom, the photo settles from a slight zoom.
    const portrait = q("[data-portrait-frame]")[0];
    if (portrait) {
      gsap
        .timeline({ scrollTrigger: { trigger: portrait, start: "top 80%", once: true } })
        .fromTo(portrait, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.2, ease: "expo.inOut", clearProps: "clipPath" })
        .from(q("[data-portrait-image]"), { scale: 1.14, duration: 1.6, ease: "expo.out" }, 0.1)
        .from(q("[data-portrait-stack] > span:not([aria-hidden])"), { scale: 0.5, autoAlpha: 0, duration: 0.5, stagger: 0.05, ease: "back.out(2)" }, 0.7);
    }
    return bootStatus(q<HTMLElement>("[data-status]")[0] ?? null, root);
  });

  return (
    <section ref={scope} id="about" data-world="about" data-nav="about" aria-labelledby="about-title" className="relative py-28 lg:py-40">
      <div className="container-x grid items-center gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-6">
          <p data-reveal="fade" className="eyebrow flex items-center gap-3">
            <span className="text-fg">01</span>
            <span aria-hidden="true" className="h-px w-8 bg-line-strong" />
            <span>About</span>
          </p>
          <h2 id="about-title" data-hello className="display-lg mt-5 text-balance">
            Hi, I&apos;m {profile.name}.
          </h2>
          <p data-reveal="fade" className="mt-6 max-w-[36rem] text-pretty text-lg leading-relaxed text-muted">
            I&apos;m a <span className="text-fg">Full Stack Developer</span> focused on building modern web and mobile
            products. {profile.intro}
          </p>
          <StatusLine text="$ npm run dev · ready in 1.2s · watching for changes" />

          <ul data-identities className="mt-10 grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-2">
            {IDENTITY.map((item) => (
              <li key={item.label} data-identity className="group flex items-center gap-3 bg-bg px-4 py-3.5">
                <span className="grid h-9 w-9 flex-none place-items-center rounded-[5px] border border-line-strong text-muted transition-colors group-hover:border-white/30 group-hover:text-fg">
                  <TechIcon id={item.icon} size={16} />
                </span>
                <span>
                  <span className="block text-[0.9375rem] font-medium text-fg">{item.label}</span>
                  <span className="block text-xs text-muted">{item.detail}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-6">
          {/* Portrait behind, code in front: layered with subtle pointer depth. */}
          <div ref={depth} className="relative">
            <PortraitPanel className="w-[64%] sm:w-[46%] lg:w-[44%]" />
            <div data-editor className="relative z-10 mt-6 ml-auto w-full sm:-mt-28 sm:w-[74%] lg:-mt-36 lg:w-[70%]">
              <div data-depth="6">
                <CodeTyper />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
