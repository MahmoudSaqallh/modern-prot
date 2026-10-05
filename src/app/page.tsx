import { CommandPalette } from "@/components/layout/CommandPalette";
import { Cursor } from "@/components/layout/Cursor";
import { Loader } from "@/components/layout/Loader";
import { Nav } from "@/components/layout/Nav";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { WorldStage } from "@/components/layout/WorldStage";
import { Projects } from "@/components/projects/Projects";
import { About } from "@/components/sections/About";
import { BackendSection } from "@/components/sections/BackendSection";
import { Console } from "@/components/sections/Console";
import { Contact } from "@/components/sections/Contact";
import { DatabaseSection } from "@/components/sections/DatabaseSection";
import { Experience } from "@/components/sections/Experience";
import { FlutterSection } from "@/components/sections/FlutterSection";
import { FrontendSection } from "@/components/sections/FrontendSection";
import { Hero } from "@/components/sections/Hero";
import { Skills } from "@/components/sections/Skills";
import { StackUniverse } from "@/components/sections/StackUniverse";
import { Workflow } from "@/components/sections/Workflow";

/**
 * Page order follows the camera's path through the 3D system:
 * hero → intro → frontend → backend → database → flutter → tech universe
 * → skills → projects → workflow → experience → terminal → contact.
 */
export default function Home() {
  return (
    <>
      <Loader />
      <Nav />
      <main id="main" tabIndex={-1} className="relative z-10 outline-none">
        <Hero />
        <About />
        <FrontendSection />
        <BackendSection />
        <DatabaseSection />
        <FlutterSection />
        <StackUniverse />
        <Skills />
        <Projects />
        <Workflow />
        <Experience />
        <Console />
        <Contact year={new Date().getFullYear()} />
      </main>
      {/* After <main>: the camera director measures sections once they exist. */}
      <WorldStage />
      <SmoothScroll />
      <CommandPalette />
      <Cursor />
    </>
  );
}
