import { useId } from "react";
import { dataDirector } from "../core/DataDirector";
import { detectDrift } from "../intelligence/DriftModel";
import { describeAssociation } from "../intelligence/AssociationModel";
import { surfaceIndex, type SurfaceField } from "../surface/SurfaceField";
import { ACTION_LABELS, type DecisionResult } from "../intelligence/DecisionEngine";
import { SIGNATURE_LABELS } from "../intelligence/DefectCharacterization";
import styles from "./StaticEvidence.module.css";

const hero = dataDirector.hero.surface;
const evidence = dataDirector.evidenceLocation;
const evidenceTheta = Math.round(evidence.u * 360);
const evidenceS = evidence.v.toFixed(2);

function Decision({ title, decision }: { title: string; decision: DecisionResult }) {
  const candidate = decision.defectCandidate;
  return (
    <div className={styles.review}>
      <p>
        <strong>{title}</strong>
        <br />
        {decision.disposition} · {ACTION_LABELS[decision.recommendedAction]}
        {candidate &&
          ` · ${SIGNATURE_LABELS[candidate.signature]} · ${decision.severity} severity`}
      </p>
      <p>{decision.reasons.at(-1)?.text}</p>
    </div>
  );
}
const clamp = (n: number) => Math.min(1, Math.max(0, n));
const mix = (a: number[], b: number[], t: number) =>
  `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(",")})`;
function color(value: number, signed = false, range = 1) {
  if (signed) {
    const t = clamp(Math.abs(value) / range);
    return mix([42, 55, 60], value < 0 ? [79, 139, 163] : [184, 100, 78], t);
  }
  const t = clamp(value / range);
  return t < 0.5
    ? mix([36, 65, 80], [95, 151, 153], t * 2)
    : mix([95, 151, 153], [207, 173, 107], (t - 0.5) * 2);
}
interface MapProps {
  label: string;
  values: ArrayLike<number>;
  field?: SurfaceField;
  signed?: boolean;
  range?: number;
  validityOnly?: boolean;
  marker?: boolean;
}
function SurfaceMap({
  label,
  values,
  field = hero,
  signed = false,
  range = 1,
  validityOnly = false,
  marker = false,
}: MapProps) {
  const hatch = `invalid-${useId().replace(/:/g, "")}`;
  return (
    <figure className={styles.map}>
      <figcaption>{label}</figcaption>
      <svg
        viewBox="0 0 370 182"
        role="img"
        aria-label={`${label}. Illustrative normalized surface on angular and profile coordinates; hatched cells mean invalid evidence.${marker ? ` Marker indicates the detected region near ${evidenceTheta} degrees, normalized profile ${evidenceS}.` : ""}`}
      >
        <defs>
          <pattern
            id={hatch}
            width="6"
            height="6"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M-1 1L1 -1M0 6L6 0M5 7L7 5"
              stroke="#84959a"
              strokeWidth="1"
            />
            <rect width="6" height="6" fill="#23323a" opacity=".25" />
          </pattern>
        </defs>
        {Array.from({ length: 384 }, (_, j) => {
          const x = j % 32,
            y = Math.floor(j / 32);
          const index = surfaceIndex(field, (x + 0.5) / 32, (y + 0.5) / 12);
          const valid = Boolean(field.validity[index]);
          return (
            <rect
              key={j}
              x={26 + x * 10}
              y={18 + y * 10}
              width="10.15"
              height="10.15"
              fill={
                !valid
                  ? `url(#${hatch})`
                  : validityOnly
                    ? "#88ada2"
                    : color(values[index], signed, range)
              }
            />
          );
        })}
        <rect
          x="26"
          y="18"
          width="320"
          height="120"
          fill="none"
          stroke="#8da6ae"
          opacity=".3"
        />
        {[0, 90, 180, 270, 360].map((theta) => (
          <text
            key={theta}
            x={26 + (theta / 360) * 320}
            y="153"
            textAnchor="middle"
          >
            {theta}°
          </text>
        ))}
        <text x="186" y="174" textAnchor="middle">
          θ · circumferential position
        </text>
        <text x="12" y="80" transform="rotate(-90 12 80)" textAnchor="middle">
          s · normalized profile
        </text>
        {marker && (
          <>
            <circle
              cx={26 + evidence.u * 320}
              cy={18 + evidence.v * 120}
              r="6"
              stroke="#f2ede0"
              strokeWidth="1.4"
              fill="none"
            />
            <path
              d={`M${26 + evidence.u * 320 - 10} ${18 + evidence.v * 120} h20`}
              stroke="#f2ede0"
              opacity=".5"
            />
          </>
        )}
      </svg>
      <p className={styles.legend}>
        {validityOnly
          ? "Valid evidence / hatched invalid evidence"
          : signed
            ? "Blue: below expectation · red: above expectation"
            : "Low → high normalized response"}{" "}
        · illustrative data
      </p>
    </figure>
  );
}
function Physical({ inspection = false }: { inspection?: boolean }) {
  return (
    <figure className={styles.physical}>
      <svg
        viewBox="0 0 700 265"
        role="img"
        aria-label={
          inspection
            ? "Illustrative inspection concept: horizontal tyre rotates around its vertical axis. The central deployed sensing head remains fixed. Encoder angle registers observation around the circumference."
            : "Illustrative horizontal tyre moving on an X-axis roller conveyor toward a controlled inspection station."
        }
      >
        <path d="M40 207H660M40 227H660" stroke="#7b919a" strokeWidth="3" />
        {Array.from({ length: 21 }, (_, i) => (
          <ellipse
            key={i}
            cx={50 + i * 30}
            cy="217"
            rx="12"
            ry="10"
            fill="#293a44"
            stroke="#657b83"
          />
        ))}
        <path
          d="M65 229V251M240 229V251M470 229V251M635 229V251"
          stroke="#687c84"
          strokeWidth="5"
        />
        <path
          d="M457 202V34H649V202M450 32H655"
          fill="none"
          stroke="#8a9da2"
          strokeWidth="5"
        />
        <path d="M475 63V168M633 63V168" stroke="#c3d0cb" strokeWidth="3" />
        <g transform={inspection ? "translate(200 0)" : ""}>
          <ellipse
            cx="345"
            cy="174"
            rx="100"
            ry="32"
            fill="#17252c"
            stroke="#65787e"
            strokeWidth="2"
          />
          <path d="M245 141V174M445 141V174" stroke="#617278" strokeWidth="2" />
          <ellipse
            cx="345"
            cy="141"
            rx="100"
            ry="32"
            fill="#28373d"
            stroke="#8a999b"
            strokeWidth="2"
          />
          <ellipse
            cx="345"
            cy="141"
            rx="53"
            ry="18"
            fill="#101d25"
            stroke="#667b83"
          />
          <ellipse
            cx="345"
            cy="142"
            rx="82"
            ry="25"
            fill="none"
            stroke="#485b60"
          />
          {Array.from({ length: 18 }, (_, i) => {
            const a = (i / 18) * Math.PI * 2;
            return (
              <path
                key={i}
                d={`M${345 + Math.cos(a) * 87} ${141 + Math.sin(a) * 27}l${Math.cos(a) * 10} ${Math.sin(a) * 3}`}
                stroke="#a2ada8"
                opacity=".4"
              />
            );
          })}
          {inspection && (
            <>
              <path d="M345 195V130" stroke="#b9c3bf" strokeWidth="7" />
              <rect
                x="333"
                y="112"
                width="24"
                height="20"
                rx="4"
                fill="#a2b0b0"
              />
              <ellipse
                cx="345"
                cy="111"
                rx="12"
                ry="5"
                fill="#324b58"
                stroke="#c8d7d7"
              />
              <path
                d="M269 90Q341 50 422 91l-9 -2m9 2l-4 -9"
                fill="none"
                stroke="#a9c6c1"
                strokeWidth="2"
              />
            </>
          )}
        </g>
        {inspection ? (
          <>
            <text x="546" y="57" textAnchor="middle">
              TYRE ROTATES
            </text>
            <path d="M550 118L448 102" stroke="#879da6" />
            <text x="307" y="98">
              FIXED SENSING HEAD
            </text>
            <text x="45" y="47">
              ENCODER → ANGULAR POSITION θ
            </text>
            <text x="45" y="69">
              0° → 360° then coverage validation
            </text>
          </>
        ) : (
          <>
            <path d="M118 102H253l-9 -5m9 5l-9 5" stroke="#b0c4c4" />
            <text x="120" y="83">
              TRANSLATION
            </text>
            <text x="484" y="24">
              INSPECTION DATUM
            </text>
          </>
        )}
      </svg>
      <figcaption>
        Independent illustrative configuration · final optics, camera count and
        line geometry remain open.
      </figcaption>
    </figure>
  );
}
function HistoryEvidence() {
  const records = dataDirector.history.records;
  const values = records.map((record) => record.deviation);
  const local = records.map((record) => {
    const i = surfaceIndex(record.surface, evidence.u, evidence.v);
    return record.surface.validity[i] ? record.surface.observation[i] : null;
  });
  const max = Math.max(
    ...values,
    ...local.filter((n): n is number => n !== null),
    0.1,
  );
  const toPath = (signal: (number | null)[]) =>
    signal
      .map((value, i) =>
        value === null
          ? ""
          : `${i === 0 || signal[i - 1] === null ? "M" : "L"}${35 + (i / (signal.length - 1)) * 620} ${130 - (value / max) * 95}`,
      )
      .join(" ");
  const isolated = detectDrift(values.slice(0, 7));
  const health = dataDirector.healthAt();
  const lineage = dataDirector.lineage();
  const factors = dataDirector.associations
    .filter((value) => value.samples >= 3)
    .map(describeAssociation);
  return (
    <div className={styles.history}>
      <svg
        viewBox="0 0 700 177"
        role="img"
        aria-label={`Illustrative history from the same tyre records. The early isolated anomaly is followed by stable tyres; later persistent spatial deviations increase. A second line follows optical response at the detected region near theta ${evidenceTheta} degrees and profile ${evidenceS}. Letters above each point give the prototype tyre disposition; the lower strip gives the separate process health status.`}
      >
        <path d="M35 22V130H655" fill="none" stroke="#6d868e" />
        <path d={toPath(values)} stroke="#87b698" strokeWidth="2" fill="none" />
        <path
          d={toPath(local)}
          stroke="#c7a674"
          strokeWidth="1.5"
          fill="none"
          strokeDasharray="5 3"
        />
        {values.map((v, i) => (
          <g key={i}>
            <circle
              cx={35 + (i / (values.length - 1)) * 620}
              cy={130 - (v / max) * 95}
              r="3"
              fill="#87b698"
            />
            <text
              x={35 + (i / (values.length - 1)) * 620}
              y={122 - (v / max) * 95}
              textAnchor="middle"
              fontSize="9"
            >
              {records[i].decision?.disposition[0]}
            </text>
            <rect
              x={35 + (i / (values.length - 1)) * 620 - 6}
              y="134"
              width="12"
              height="5"
              fill={
                { STABLE: "#5f8f74", WARNING: "#c7a674", CRITICAL: "#b8644e" }[
                  dataDirector.healthAt(i).state
                ]
              }
            />
          </g>
        ))}
        <text x="35" y="151">
          Earlier tyres
        </text>
        <text x="655" y="151" textAnchor="end">
          Later tyres
        </text>
        <text x="35" y="170">
          Green: spatial deviation · amber: response at the detected patch ·
          letters: P pass, R review, F fail · strip: process health
        </text>
      </svg>
      <p>
        First seven records:{" "}
        {isolated.persistent
          ? "persistent change"
          : "isolated event, no persistent drift"}
        . Full history:{" "}
        {dataDirector.drift.persistent
          ? "persistent change appears"
          : "no persistent drift established"}
        .
      </p>
      <div className={styles.review}>
        <p>
          <strong>Tyre disposition (this tyre)</strong>
          <br />
          {dataDirector.heroDecision.disposition} ·{" "}
          {ACTION_LABELS[dataDirector.heroDecision.recommendedAction]}
        </p>
        <p>
          <strong>Illustrative process health indicator (the line)</strong>
          <br />
          {health.state} · index {Math.round(health.index)} / 100 ·{" "}
          {health.reasons.slice(0, 2).join(", ") || "no persistent signal"}
        </p>
      </div>
      <div className={styles.review}>
        <p>
          <strong>Associated factors</strong>
          <br />
          {factors.map((f) => `${f.label}: ${f.strength}`).join(" · ")}
        </p>
        <p>
          <strong>Engineer review</strong>
          <br />
          Inspect evidence → evaluate a predicted what-if → validate a candidate
          action.
        </p>
      </div>
      <p className={styles.note}>
        Lineage: {lineage.tyreId} · {lineage.sprayStation} → {lineage.acquisition?.inspectionStationId} ·
        trace {lineage.processTrace?.samples ?? 0} samples · {lineage.models.processModelVersion} ·{" "}
        {lineage.models.decisionPolicyVersion} · review {lineage.review?.status ?? "not required"}.
      </p>
      <p className={styles.note}>
        All records, associations, disposition and health thresholds are
        illustrative and unvalidated. Correlation is not proof of cause.
        Predictions support investigation; no machine command is issued.
      </p>
    </div>
  );
}

export function StaticEvidence({ sceneIndex }: { sceneIndex: number }) {
  const trace = dataDirector.traceSample(evidence.u, evidence.v);
  const prediction = dataDirector.processPrediction;
  const explanation = dataDirector.explanation();
  const examples = dataDirector.referenceExamples;
  return (
    <div className={styles.plate}>
      <p className={styles.kicker}>ILLUSTRATIVE TECHNICAL EVIDENCE</p>
      {sceneIndex < 2 && <Physical inspection={sceneIndex === 1} />}
      {sceneIndex === 2 && (
        <>
          <div className={styles.maps}>
            <SurfaceMap
              label="Observation O(θ,s)"
              values={hero.observation}
              marker
            />
            <SurfaceMap label="Confidence C(θ,s)" values={hero.confidence} />
            <SurfaceMap
              label="Validity M(θ,s)"
              values={hero.validity}
              validityOnly
            />
          </div>
          <p className={styles.note}>
            The detected region near θ={evidenceTheta}°, normalized s=
            {evidenceS} maps to generated acquisition view {trace.viewId}.
            Raw-evidence lineage is illustrative. No data is not the same as no
            lubricant.
          </p>
          {examples
            .filter((example) => example.decision.disposition === "INVALID")
            .map((example) => (
              <Decision
                key={example.id}
                title={`${example.label}: measurement validity first`}
                decision={example.decision}
              />
            ))}
        </>
      )}
      {sceneIndex === 3 && (
        <>
          <div className={styles.maps}>
            <SurfaceMap
              label="Accepted population mean"
              values={dataDirector.normal.mean}
            />
            <SurfaceMap
              label="Natural spatial variation"
              values={dataDirector.normal.variation}
              range={0.05}
            />
            <SurfaceMap
              label="Current tyre deviation"
              values={hero.normalDeviation!}
              signed
              range={24}
              marker
            />
          </div>
          <p className={styles.note}>
            {dataDirector.normalPopulation.length} accepted synthetic samples
            determine this variant-specific mean and variation. The hero is
            excluded. Display ranges are illustrative; defect type, extent and
            severity require separate interpretation. Unmatched patterns retain
            an unknown-anomaly review path.
          </p>
          <div className={styles.review}>
            <p>
              <strong>Abnormality evidence</strong>
              <br />
              Peak excess {dataDirector.heroDecision.productIndicators?.peakExcess.toFixed(2) ?? "—"}{" "}
              (normalized response) ·{" "}
              {((dataDirector.heroDecision.productIndicators?.areaFraction ?? 0) * 100).toFixed(1)}% of
              surface · evidence confidence {dataDirector.heroDecision.evidenceConfidence}
            </p>
          </div>
          <Decision
            title="Final prototype disposition (unvalidated policy)"
            decision={dataDirector.heroDecision}
          />
          {examples
            .filter((example) => example.decision.defectCandidate?.signature === "unknown")
            .map((example) => (
              <Decision key={example.id} title={example.label} decision={example.decision} />
            ))}
        </>
      )}
      {sceneIndex === 4 && (
        <>
          <div className={styles.maps}>
            <SurfaceMap
              label="Historical normal expectation"
              values={dataDirector.normal.mean}
            />
            <SurfaceMap
              label="Process-conditioned expectation"
              values={dataDirector.processPrediction.expected}
            />
            <SurfaceMap
              label="Observed minus process expected"
              values={hero.residual!}
              signed
              range={0.6}
              marker
            />
          </div>
          <p className={styles.note}>
            The same observed hero surface underlies both comparisons. An
            idealized spray-deposition model integrates the recorded synthetic
            process trace (θ(t), flow, pressure, nozzle, rotation, valve) into
            the expectation; an unexplained residual remains evidence. Agreement
            with a process state does not establish acceptable product quality.
          </p>
          <div className={styles.review}>
            <p>
              <strong>Process expectation</strong>
              <br />
              {prediction.status} · support {prediction.supportLevel} ·{" "}
              {prediction.calibrationVersion}
            </p>
            {explanation && (
              <p>
                <strong>Excess explained by recorded process</strong>
                <br />
                {explanation.label} (~{Math.round(explanation.explainedShare * 10) * 10}%,
                illustrative)
              </p>
            )}
          </div>
        </>
      )}
      {sceneIndex === 5 && <HistoryEvidence />}
    </div>
  );
}
export default StaticEvidence;
