import { useEffect, useRef, useState, Component } from "react";
import type { ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ProductionWorld } from "../experience/world/ProductionWorld";
import { experienceClock } from "../experience/core/ExperienceClock";
import { scenes } from "../experience/core/SceneRegistry";
import { sceneRange } from "../experience/core/JourneyController";
import { directStory } from "../experience/core/StoryDirector";
import { useExperienceStore } from "../experience/state/experienceStore";
import { qualityProfile } from "../experience/core/QualityController";
import styles from "./App.module.css";
import { TechnicalAnnotations } from "../experience/overlays/TechnicalAnnotations";
import { IntelligenceAnnotations } from "../experience/overlays/IntelligenceAnnotations";
import { ProjectedCaptions } from "../experience/overlays/ProjectedCaptions";
import { StaticEvidence } from "../experience/overlays/StaticEvidence";
import { DebugTools } from "../experience/overlays/DebugTools";
gsap.registerPlugin(ScrollTrigger);
class CanvasBoundary extends Component<
  { children: ReactNode; onFailure: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFailure();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
function canRender() {
  try {
    const c = document.createElement("canvas");
    return !!c.getContext("webgl2");
  } catch {
    return false;
  }
}
export function App() {
  const journey = useRef<HTMLElement>(null);
  const sceneIndex = useExperienceStore((s) => s.sceneIndex),
    beatId = useExperienceStore((s) => s.beatId),
    reducedMotion = useExperienceStore((s) => s.reducedMotion),
    webgl = useExperienceStore((s) => s.webglAvailable),
    lowPower = useExperienceStore((s) => s.lowPower);
  const [width, setWidth] = useState(window.innerWidth);
  const candidateNozzle = useExperienceStore((s) => s.candidateNozzle);
  const candidateFlow = useExperienceStore((s) => s.candidateFlow);
  const scene = scenes[sceneIndex],
    beat = scene.beats.find((b) => b.id === beatId) ?? scene.beats[0];
  const staticMode = reducedMotion || !webgl;
  const quality = qualityProfile(width, lowPower);
  useEffect(() => {
    const store = useExperienceStore.getState();
    store.setWebgl(
      canRender() && !new URLSearchParams(location.search).has("fallback"),
    );
    const query = matchMedia("(prefers-reduced-motion: reduce)");
    store.setReducedMotion(query.matches);
    const change = () =>
      useExperienceStore.getState().setReducedMotion(query.matches);
    query.addEventListener("change", change);
    const resize = () => setWidth(innerWidth);
    window.addEventListener("resize", resize);
    return () => {
      query.removeEventListener("change", change);
      window.removeEventListener("resize", resize);
    };
  }, []);
  useEffect(() => {
    if (staticMode) return;
    const trigger = ScrollTrigger.create({
      trigger: journey.current,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => experienceClock.setTarget(self.progress),
      invalidateOnRefresh: true,
    });
    experienceClock.setTarget(trigger.progress);
    return () => trigger.kill();
  }, [staticMode]);
  const jump = (index: number) => {
    const [start, end] = sceneRange(index);
    if (staticMode) {
      document.getElementById("static-" + scenes[index].id)?.scrollIntoView();
      return;
    }
    if (journey.current) {
      const max = journey.current.offsetHeight - innerHeight;
      window.scrollTo({
        top: (start + (end - start) * 0.02) * max,
        behavior: "instant",
      });
    }
  };
  return (
    <>
      <a className={styles.skip} href="#engineering">
        Skip to engineering reality
      </a>
      <header className={styles.header}>
        <a href="#" className={styles.brand} aria-label="Tyre Lubricant home">
          <span className={styles.mark} aria-hidden="true">
            ◉
          </span>
          <span>
            Tyre Lubricant<small>Manufacturing intelligence</small>
          </span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#engineering">Engineering reality</a>
          <button
            className={styles.qualityButton}
            aria-pressed={lowPower}
            onClick={() => useExperienceStore.getState().setLowPower(!lowPower)}
          >
            Simpler visuals
          </button>
          <button
            onClick={() =>
              useExperienceStore.getState().setReducedMotion(!reducedMotion)
            }
          >
            {reducedMotion ? "Cinematic story" : "Read the story"}
          </button>
        </nav>
      </header>
      {!staticMode ? (
        <section
          ref={journey}
          className={styles.journey}
          aria-label="Continuous inspection story"
        >
          <div className={styles.stage}>
            <CanvasBoundary
              onFailure={() => useExperienceStore.getState().setWebgl(false)}
            >
              <Canvas
                className={styles.canvas}
                shadows={quality.shadows}
                dpr={quality.dpr}
                camera={{ position: [7, 5.2, 9], fov: 42 }}
                gl={{
                  antialias: !lowPower,
                  alpha: true,
                  powerPreference: lowPower ? "low-power" : "high-performance",
                }}
              >
                <ProductionWorld />
              </Canvas>
            </CanvasBoundary>
            <div className={styles.shade} />
            <ProjectedCaptions />
            <div className={styles.layout}>
              <div className={styles.narrative}>
                <article
                  className={styles.copy}
                  style={{ "--accent": scene.accent } as React.CSSProperties}
                  aria-live="polite"
                  aria-atomic="true"
                >
                  <p className={styles.chapter}>
                    {String(sceneIndex).padStart(2, "0")} / {scene.title}
                  </p>
                  <h1>{beat.title}</h1>
                  <p className={styles.body}>{beat.body}</p>
                  <p className={styles.detail}>{beat.detail}</p>
                </article>
                <IntelligenceAnnotations
                  candidateNozzle={candidateNozzle}
                  candidateFlow={candidateFlow}
                  onCandidateChange={
                    useExperienceStore.getState().setCandidateNozzle
                  }
                  onFlowChange={useExperienceStore.getState().setCandidateFlow}
                />
              </div>
              <div className={styles.technical}>
                <TechnicalAnnotations />
              </div>
              <div
                className={styles.scroll}
                style={{ display: sceneIndex >= 3 ? "none" : undefined }}
              >
                Scroll to follow the tyre <span aria-hidden="true">↓</span>
              </div>
              <div className={styles.context}>
                <span>One tyre. One surface. One data lineage.</span>
                <span>Illustrative prototype data</span>
              </div>
              <nav className={styles.rail} aria-label="Journey chapters">
                {scenes.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => jump(i)}
                    aria-current={i === sceneIndex ? "step" : undefined}
                  >
                    <span>{String(i).padStart(2, "0")}</span>
                    <span>{s.title}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </section>
      ) : (
        <main className={styles.staticStory}>
          <p className={styles.staticIntro}>
            {reducedMotion
              ? "A still-frame engineering story."
              : "The complete engineering story, available without WebGL."}{" "}
            Illustrative prototype data.
          </p>
          {scenes.map((s, i) => (
            <section id={"static-" + s.id} key={s.id}>
              <p>
                {String(i).padStart(2, "0")} / {s.title}
              </p>
              <StaticEvidence sceneIndex={i} />
              {s.beats.map((b) => (
                <article key={b.id}>
                  <h2>{b.title}</h2>
                  <p>{b.body}</p>
                  <p className={styles.detail}>{b.detail}</p>
                </article>
              ))}
            </section>
          ))}
        </main>
      )}
      {import.meta.env.DEV &&
        new URLSearchParams(location.search).get("debug") === "1" && (
          <DebugTools jump={jump} />
        )}
      <section id="engineering" className={styles.engineering}>
        <p className={styles.chapter}>Engineering reality</p>
        <h2>
          A clear architecture.
          <br />A deliberate validation path.
        </h2>
        <p className={styles.lead}>
          This experience explains a proposed manufacturing system. Its
          surfaces, process relationships and production history are
          deterministic illustrations, not client measurements.
        </p>
        <div className={styles.engineeringGrid}>
          <article>
            <h3>Architecturally defined</h3>
            <p>
              Controlled inspection, angular registration, a canonical surface
              with confidence and validity, variant-specific normality,
              process-conditioned expectations and time-aligned history.
            </p>
          </article>
          <article>
            <h3>Illustrative implementation</h3>
            <p>
              The unbranded panoramic head, tyre geometry, optical response,
              process state, statistical models and drift examples demonstrate
              the concept. They require material-specific validation.
            </p>
          </article>
          <article>
            <h3>Open engineering decisions</h3>
            <p>
              Camera count and placement, area-scan or line-scan, optics and
              wavelength, available machine signals, model family, cycle time
              and production limits remain open.
            </p>
          </article>
          <article>
            <h3>Pilot and validation</h3>
            <p>
              Test optical contrast on actual materials. Establish traceable
              ground truth, validate registration and coverage, approve
              acceptable populations, then evaluate predictions and warnings in
              shadow mode.
            </p>
          </article>
          <article>
            <h3>Production integration</h3>
            <p>
              A future factory-edge system would connect tyre identity and
              process timestamps, govern model updates, retain raw evidence and
              enforce secure plant integration.
            </p>
          </article>
          <article>
            <h3>Engineer-led decisions</h3>
            <p>
              Associated factors guide investigation. What-if predictions
              support review. Neither correlation nor model agreement
              establishes root cause or authorizes autonomous machine
              correction.
            </p>
          </article>
        </div>
        <footer>
          <span>Measure precisely. Understand deeply. Act earlier.</span>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}
          >
            Return to the tyre ↑
          </button>
        </footer>
      </section>
    </>
  );
}
