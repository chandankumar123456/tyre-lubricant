import { useExperienceStore } from "../state/experienceStore";
import { dataDirector } from "../core/DataDirector";
import { annotationRef } from "../core/AnnotationRegistry";
import { seedEncoderReadout } from "../core/EncoderReadout";
import styles from "./TechnicalAnnotations.module.css";
const evidence = dataDirector.evidenceLocation;
const referenceTheta = Math.round(evidence.u * 360).toString();
const invalidExample = dataDirector.referenceExamples.find(
  (example) => example.decision.disposition === "INVALID",
);
const registerAngle = annotationRef("encoder-angle");
const registerCoverage = annotationRef("encoder-coverage");
const angleRef = (element: HTMLElement | null) => {
  registerAngle(element);
  if (element) seedEncoderReadout();
};
const coverageRef = (element: HTMLElement | null) => {
  registerCoverage(element);
  if (element) seedEncoderReadout();
};
/** Encoder angle and coverage are written by the R3F frame loop through the annotation registry. */
export function TechnicalAnnotations() {
  const index = useExperienceStore((s) => s.sceneIndex),
    beat = useExperienceStore((s) => s.beatId);
  const trace = dataDirector.traceSample(evidence.u, evidence.v);
  if (index === 0) return null;
  return (
    <aside className={styles.annotations} aria-label="Technical evidence">
      {index === 1 && (
        <div className={styles.encoder}>
          <div className={styles.label}>
            Encoder-linked angular acquisition{" "}
            <span ref={angleRef} />
          </div>
          <div className={styles.coverage}>
            <div ref={coverageRef} />
            <i style={{ left: `${evidence.u * 100}%` }} />
          </div>
          <div className={styles.ticks}>
            <span>0°</span>
            <span>θ ≈ {referenceTheta}°</span>
            <span>360°</span>
          </div>
          <p>
            Fixed sensing position · rotating tyre
            <br />
            Illustrative inspection configuration
          </p>
        </div>
      )}
      {index === 2 && (
        <>
          {(beat.includes("profile") ||
            beat.includes("coordinates") ||
            beat.includes("grid")) && (
            <svg
              className={styles.profile}
              viewBox="0 0 300 100"
              role="img"
              aria-label="s follows the curved bead-to-bead inner surface profile"
            >
              <path
                d="M25 25 C70 88 220 88 270 25"
                fill="none"
                stroke="#d2ac72"
                strokeWidth="2"
              />
              <circle cx="215" cy="65" r="4" fill="#d2ac72" />
              <text x="25" y="16">
                Upper bead
              </text>
              <text x="209" y="16">
                Lower bead
              </text>
              <text x="103" y="95">
                s · curved profile
              </text>
            </svg>
          )}
          {(beat.includes("correspondence") ||
            beat.includes("normalized") ||
            beat.includes("observation") ||
            beat.includes("confidence") ||
            beat.includes("validity") ||
            beat.includes("insufficient") ||
            beat.includes("traceability")) && (
            <div className={styles.axes}>
              <span>θ · around the circumference</span>
              <div>
                <span>0°</span>
                <span>{referenceTheta}° · same region</span>
                <span>360°</span>
              </div>
              <p>s · bead-to-bead profile distance</p>
              <p>O: observation &nbsp; C: confidence &nbsp; M: validity</p>
            </div>
          )}
          {beat.includes("insufficient") && invalidExample && (
            <div className={styles.evidence}>
              <span>Measurement validity comes first</span>
              <p>
                {invalidExample.label}: {invalidExample.decision.disposition} →{" "}
                reinspect. No product judgement is made from an unusable scan.
              </p>
              <small>
                {invalidExample.decision.reasons
                  .filter((reason) => reason.code === "MEASUREMENT_ISSUE")
                  .map((reason) => reason.text)
                  .join(" ")}
              </small>
            </div>
          )}
          {beat.includes("traceability") && (
            <div className={styles.evidence}>
              <span>
                Selected region → acquisition record → source observation
              </span>
              <p>
                Generated evidence view{" "}
                {trace.acquisition.thetaStart.toFixed(0)}°–
                {trace.acquisition.thetaEnd.toFixed(0)}°
              </p>
              <svg
                viewBox="0 0 240 36"
                role="img"
                aria-label="Synthetic optical response around the selected location"
              >
                <polyline
                  points={Array.from({ length: 32 }, (_, i) => {
                    const t = dataDirector.traceSample(
                      evidence.u + (i - 16) / 128,
                      evidence.v,
                    );
                    return `${i * 7.5},${32 - t.observation * 30}`;
                  }).join(" ")}
                  fill="none"
                  stroke="#94bfd2"
                  strokeWidth="1.5"
                />
              </svg>
              <small>Synthetic source observation; no plant camera data.</small>
            </div>
          )}
        </>
      )}
    </aside>
  );
}
