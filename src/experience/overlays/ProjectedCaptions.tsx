import { useExperienceStore } from "../state/experienceStore";
import { createPortal } from "react-dom";
import { dataDirector } from "../core/DataDirector";
import { annotationRef } from "../core/AnnotationRegistry";
import styles from "./ProjectedCaptions.module.css";
const caption = { anchor: "translate(-50%,-100%)", display: "block" };
const legend = { anchor: "translate(-50%,0)", display: "flex" };
export function ProjectedCaptions({
  compact = false,
  legendContainer = null,
}: {
  compact?: boolean;
  legendContainer?: HTMLElement | null;
}) {
  const scene = useExperienceStore((s) => s.sceneIndex),
    beat = useExperienceStore((s) => s.beatId);
  if (scene < 2) return null;
  const deviation =
    scene === 3 &&
    [
      "normal.deviationVisible",
      "normal.regionLocalized",
      "normal.knownPattern",
      "normal.unknownPossible",
      "normal.processRequested",
    ].includes(beat);
  const residual =
    scene >= 4 &&
    !(
      scene === 4 &&
      [
        "process.currentDeviation",
        "process.contextRequested",
        "process.timeAligned",
        "process.geometryVisible",
        "process.inputsVisible",
        "process.stateFormed",
        "process.constraintsVisible",
        "process.expectationReady",
        "process.twoExpectations",
        "process.comparingObserved",
      ].includes(beat)
    );
  const legendContent = scene < 5 && (deviation || residual) && (
    <div
      id="deviation-legend"
      ref={compact ? undefined : annotationRef("deviation-legend", legend)}
      className={`${styles.legend} ${compact ? styles.flowLegend : ""}`}
    >
      <i />
      <span>Lower than expected</span>
      <span>Expected</span>
      <span>Higher than expected</span>
    </div>
  );
  return (
    <div className={styles.captions} aria-label="Surface evidence labels">
      <span
        id="caption-normal-mean"
        ref={annotationRef("caption-normal-mean", caption)}
        className={styles.caption}
      >
        Historical normal · μ
      </span>
      <span
        id="caption-normal-variation"
        ref={annotationRef("caption-normal-variation", caption)}
        className={styles.caption}
      >
        Natural variation · σ
      </span>
      <span
        id="caption-process-expectation"
        ref={annotationRef("caption-process-expectation", caption)}
        className={styles.caption}
      >
        {scene === 5
          ? "Candidate predicted response"
          : "Process-conditioned expectation"}
      </span>
      <span
        id="caption-hero-measurement-shell"
        ref={annotationRef("caption-hero-measurement-shell", caption)}
        className={styles.caption}
      >
        {scene === 5
          ? `${dataDirector.hero.id} · same record`
          : residual
            ? "Unexplained residual"
            : deviation
              ? "Deviation from normal"
              : beat === "canonical.confidence"
                ? "Confidence · C"
                : beat === "canonical.validity" ||
                    beat === "canonical.insufficientEvidence"
                  ? "Validity · M"
                  : `${dataDirector.hero.id} · observation O`}
      </span>
      {compact
        ? legendContainer && createPortal(legendContent, legendContainer)
        : legendContent}
    </div>
  );
}
