import { useMemo, useState } from "react";
import { dataDirector, type HistoryWindow } from "../core/DataDirector";
import { describeAssociation } from "../intelligence/AssociationModel";
import { ACTION_LABELS } from "../intelligence/DecisionEngine";
import { SIGNATURE_LABELS } from "../intelligence/DefectCharacterization";
import { detectDrift } from "../intelligence/DriftModel";
import { useExperienceStore } from "../state/experienceStore";
import styles from "./IntelligenceAnnotations.module.css";

interface Props {
  candidateNozzle?: number;
  candidateFlow?: number;
  onCandidateChange?: (value: number) => void;
  onFlowChange?: (value: number) => void;
}
const HEALTH_FILL = { STABLE: "#5f8f74", WARNING: "#c7a674", CRITICAL: "#b8644e" };
const field = dataDirector.hero.surface;
const signature = dataDirector.characterizeSignature();
const baselinePeaks = dataDirector.normalPopulation.map(
  (surface) => dataDirector.characterizeSignature(surface).peak,
);
const envelope = Math.max(...baselinePeaks);
function path(values: number[], maximum: number) {
  return values
    .map(
      (value, i) =>
        `${i ? "L" : "M"}${12 + (i / Math.max(1, values.length - 1)) * 336},${79 - (value / maximum) * 60}`,
    )
    .join(" ");
}

/** Discrete semantic annotation, independent of the high-frequency rendering loop. */
function Status({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className={styles.decision}>
      <span className={styles.decisionLabel}>{label}</span>
      <span className={styles.decisionValue} data-state={value}>
        {value}
      </span>
      {note && <span className={styles.decisionNote}>{note}</span>}
    </div>
  );
}

export function IntelligenceAnnotations({
  candidateNozzle,
  candidateFlow,
  onCandidateChange,
  onFlowChange,
}: Props) {
  const sceneIndex = useExperienceStore((state) => state.sceneIndex);
  const beatId = useExperienceStore((state) => state.beatId);
  const [window, setWindow] = useState<HistoryWindow>("long");
  const [localCandidate, setLocalCandidate] = useState(
    dataDirector.hero.processState.values.nozzlePosition ?? 0.5,
  );
  const [localFlow, setLocalFlow] = useState(
    dataDirector.hero.processState.values.flowRate ?? 1,
  );
  const candidate = candidateNozzle ?? localCandidate;
  const flow = candidateFlow ?? localFlow;
  const aggregate = useMemo(
    () => dataDirector.aggregateHistory(window),
    [window],
  );
  const prediction = useMemo(
    () => dataDirector.whatIf({ nozzlePosition: candidate, flowRate: flow }),
    [candidate, flow],
  );
  const recordedPeak = useMemo(() => {
    const residual = dataDirector.whatIf({}).residual;
    let peak = 0;
    for (const value of residual) peak = Math.max(peak, value);
    return peak;
  }, []);
  const candidatePeak = useMemo(() => {
    let peak = 0;
    for (const value of prediction.residual) peak = Math.max(peak, value);
    return peak;
  }, [prediction]);
  const factors = dataDirector.associations
    .filter((factor) => factor.samples >= 3)
    .map(describeAssociation);
  const isolated = beatId === "drift.isolatedEvent";
  const early = beatId.startsWith("history.");
  const establishing = beatId === "drift.operatingEnvelope";
  const emerging = beatId === "drift.persistentChange";
  const records = early
    ? dataDirector.history.records.slice(0, 3)
    : isolated || establishing
      ? dataDirector.history.records.slice(0, 7)
      : emerging
        ? dataDirector.history.records.slice(0, 11)
        : aggregate.records;
  const signal = records.map((record) => record.deviation);
  const drift =
    early || isolated || establishing || emerging
      ? detectDrift(signal)
      : aggregate.drift;
  const maximum = Math.max(envelope * 2, ...signal, 0.1);
  const whatIf = beatId.startsWith("whatif.") || beatId.startsWith("review.");
  const showFactors = beatId.startsWith("rca.");
  const decision = dataDirector.heroDecision;
  const candidateRegion = decision.defectCandidate;
  const explanation = dataDirector.explanation();
  const health = dataDirector.healthAt();
  const unknownExample = dataDirector.referenceExamples.find(
    (example) => example.decision.defectCandidate?.signature === "unknown",
  );
  const lineage = dataDirector.lineage();
  const showSignature =
    sceneIndex === 3 &&
    [
      "normal.regionLocalized",
      "normal.knownPattern",
      "normal.unknownPossible",
      "normal.processRequested",
    ].includes(beatId);
  if (sceneIndex < 3 || beatId.startsWith("finale.")) return null;

  return (
    <aside
      className={styles.strip}
      aria-label="Illustrative technical evidence"
      tabIndex={0}
    >
      <span className={styles.kicker}>ILLUSTRATIVE EVIDENCE</span>
      {sceneIndex === 3 && !showSignature && (
        <>
          <p className={styles.heading}>
            A population, rather than one perfect reference
          </p>
          <div className={styles.population} aria-hidden="true">
            {dataDirector.normalPopulation.map((_, i) => (
              <span key={i} />
            ))}
          </div>
          <p>
            {dataDirector.normalPopulation.length} accepted synthetic surfaces ·{" "}
            {dataDirector.normal.variantId}
          </p>
          <p className={styles.secondary}>
            Local mean and variation derive from those surfaces. This tyre is
            excluded.
          </p>
        </>
      )}
      {showSignature && (
        <>
          <p className={styles.heading}>Evidence, then a prototype disposition</p>
          <div className={styles.statusRow}>
            <div className={styles.decision}>
              <span className={styles.decisionLabel}>Abnormality evidence</span>
              <span className={styles.decisionValue}>
                {candidateRegion
                  ? SIGNATURE_LABELS[candidateRegion.signature]
                  : "None detected"}
              </span>
              <span className={styles.decisionNote}>
                {decision.severity} severity · unvalidated limits
              </span>
            </div>
            <Status
              label="Final prototype disposition"
              value={decision.disposition}
              note={ACTION_LABELS[decision.recommendedAction]}
            />
          </div>
          <dl className={styles.measures}>
            <div>
              <dt>Pattern</dt>
              <dd>
                {candidateRegion
                  ? SIGNATURE_LABELS[candidateRegion.signature]
                  : "No supported excess signature"}
              </dd>
            </div>
            <div>
              <dt>Extent</dt>
              <dd>
                {(signature.areaFraction * 100).toFixed(1)}% of illustrative
                grid
              </dd>
            </div>
            <div>
              <dt>Position</dt>
              <dd>
                θ {(signature.centroid.u * 360).toFixed(0)}° · s/L{" "}
                {signature.centroid.v.toFixed(2)}
              </dd>
            </div>
            <div>
              <dt>Severity</dt>
              <dd>Requires validated quality limits</dd>
            </div>
          </dl>
          <ul className={styles.reasons}>
            {decision.reasons.map((reason) => (
              <li key={reason.code}>{reason.text}</li>
            ))}
          </ul>
          {beatId === "normal.unknownPossible" && unknownExample && (
            <Status
              label={unknownExample.label}
              value={unknownExample.decision.disposition}
              note="Outside the known taxonomy. Engineer review, not a fail."
            />
          )}
        </>
      )}
      {sceneIndex === 4 && (
        <>
          <p className={styles.heading}>Keep both expectations</p>
          <dl className={styles.measures}>
            <div>
              <dt className={styles.normal}>Population</dt>
              <dd>Observed − historical normal</dd>
            </div>
            <div>
              <dt className={styles.process}>Process</dt>
              <dd>Observed − predicted response</dd>
            </div>
          </dl>
          <p className={styles.secondary}>
            Available illustrative inputs:{" "}
            {dataDirector.processPrediction.availableVariables
              .map(
                (key) =>
                  ({
                    nozzlePosition: "nozzle alignment",
                    flowRate: "flow",
                    pressure: "pressure",
                  })[key] ?? key,
              )
              .join(", ")}
            .
          </p>
          <div className={styles.statusRow}>
            <Status
              label="Prediction status"
              value={dataDirector.processPrediction.status}
              note={dataDirector.processPrediction.calibrationVersion}
            />
            <Status
              label="Model support"
              value={dataDirector.processPrediction.supportLevel}
              note={
                dataDirector.processPrediction.outOfEnvelope.length
                  ? `Outside envelope: ${dataDirector.processPrediction.outOfEnvelope.join(", ")}`
                  : "Inside the calibration envelope"
              }
            />
            {explanation && (
              <div className={styles.decision}>
                <span className={styles.decisionLabel}>
                  Excess the recorded process explains
                </span>
                <span className={styles.decisionValue}>
                  {explanation.label}
                </span>
                <span className={styles.decisionNote}>
                  about {Math.round(explanation.explainedShare * 10) * 10}% ·
                  illustrative
                </span>
              </div>
            )}
          </div>
          <p className={styles.secondary}>
            A process-consistent surface can still fall outside acceptable
            production behavior.
          </p>
        </>
      )}
      {sceneIndex === 5 && !showFactors && !whatIf && (
        <>
          <p className={styles.heading}>
            {early
              ? "Time-aligned product and process records"
              : isolated
                ? "One unusual tyre. Stable neighbours."
                : "Spatial deviation across production"}
          </p>
          {!early && !isolated && !establishing && !emerging && (
            <div
              className={styles.windows}
              role="group"
              aria-label="History aggregation window"
            >
              {(["short", "medium", "long"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={window === value}
                  onClick={() => setWindow(value)}
                >
                  {value}
                </button>
              ))}
            </div>
          )}
          <svg
            className={styles.chart}
            viewBox="0 0 360 103"
            role="img"
            aria-label={`${records.length} illustrative tyre records; ${drift.persistent ? "persistent drift evidence" : "no persistent drift established"}. Letters mark each tyre disposition. The strip under the axis is process health, separate from those dispositions. The shaded region shows the accepted synthetic population envelope.`}
          >
            <rect
              x="12"
              y={79 - (envelope / maximum) * 60}
              width="336"
              height={(envelope / maximum) * 60}
              fill="currentColor"
              opacity=".09"
            />
            <line
              x1="12"
              x2="348"
              y1={79 - (envelope / maximum) * 60}
              y2={79 - (envelope / maximum) * 60}
              stroke="currentColor"
              strokeDasharray="3 4"
              opacity=".35"
            />
            <line
              x1="12"
              x2="348"
              y1="79"
              y2="79"
              stroke="currentColor"
              opacity=".24"
            />
            <path
              d={path(signal, maximum)}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
            />
            {signal.map((value, i) => {
              const x = 12 + (i / Math.max(1, signal.length - 1)) * 336;
              const state = dataDirector.healthAt(records[i].sequenceIndex).state;
              return (
                <g key={i}>
                  <text
                    x={x}
                    y={Math.max(10, 79 - (value / maximum) * 60 - 6)}
                    textAnchor="middle"
                    fontSize="7"
                    fill="currentColor"
                  >
                    {records[i].decision?.disposition[0]}
                  </text>
                  <circle
                    cx={x}
                    cy={79 - (value / maximum) * 60}
                    r="2.4"
                    fill="currentColor"
                  />
                  <rect
                    x={x - 4}
                    y="82"
                    width="8"
                    height="3"
                    fill={HEALTH_FILL[state]}
                  >
                    <title>{`Process health ${state}`}</title>
                  </rect>
                </g>
              );
            })}
            <text x="12" y="98">
              Earlier tyres
            </text>
            <text x="348" y="98" textAnchor="end">
              Later tyres
            </text>
          </svg>
          <p className={styles.result} aria-live="polite">
            {drift.persistent
              ? "Persistent change in this illustrative history"
              : "No persistent change established"}{" "}
            · {records.length} records shown
          </p>
          <div className={styles.statusRow}>
            <Status
              label="This tyre"
              value={decision.disposition}
              note={ACTION_LABELS[decision.recommendedAction]}
            />
            <Status
              label="Process health"
              value={health.state}
              note={`index ${Math.round(health.index)} / 100 · unvalidated`}
            />
          </div>
          <p className={styles.secondary}>
            Letters: P pass, R review, F fail. The coloured strip is the line's
            health, not the tyre's disposition. Shaded envelope comes from
            accepted synthetic surfaces and is not a manufacturing limit.
          </p>
        </>
      )}
      {showFactors && (
        <>
          <p className={styles.heading}>Available factors to investigate</p>
          <ol className={styles.factors}>
            {factors.map((factor) => (
              <li key={factor.factor}>
                <div>
                  <span>{factor.label}</span>
                  <span>{factor.strength}</span>
                </div>
                <svg viewBox="0 0 100 3" aria-hidden="true">
                  <path d="M0 1.5 H100" stroke="currentColor" opacity=".15" />
                  <path
                    d={`M0 1.5 H${Math.abs(factor.correlation) * 100}`}
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
                <span className={styles.secondary}>
                  {factor.samples} paired illustrative records
                </span>
              </li>
            ))}
          </ol>
          <p className={styles.secondary}>
            Ranking follows association within this synthetic history.
            Association does not establish causation.
          </p>
        </>
      )}
      {whatIf && (
        <>
          <p className={styles.heading}>Compare a candidate alignment</p>
          <label className={styles.slider} htmlFor="candidate-nozzle">
            Illustrative nozzle position{" "}
            <output htmlFor="candidate-nozzle">{candidate.toFixed(2)}</output>
          </label>
          <input
            id="candidate-nozzle"
            type="range"
            min="0.3"
            max="0.8"
            step="0.01"
            value={candidate}
            aria-describedby="whatif-explanation"
            onChange={(event) => {
              const value = Number(event.target.value);
              setLocalCandidate(value);
              onCandidateChange?.(value);
            }}
          />
          <label className={styles.slider} htmlFor="candidate-flow">
            Illustrative flow{" "}
            <output htmlFor="candidate-flow">{flow.toFixed(2)}</output>
          </label>
          <input
            id="candidate-flow"
            type="range"
            min="0.7"
            max="1.3"
            step="0.01"
            value={flow}
            aria-describedby="whatif-explanation"
            onChange={(event) => {
              const value = Number(event.target.value);
              setLocalFlow(value);
              onFlowChange?.(value);
            }}
          />
          <p className={styles.result}>
            Peak unexplained residual {candidatePeak.toFixed(2)}
            {candidatePeak < recordedPeak - 0.01
              ? ", lower than the recorded conditions"
              : candidatePeak > recordedPeak + 0.01
                ? ", higher than the recorded conditions"
                : ", close to the recorded conditions"}
            . Predicted response only.
          </p>
          <p id="whatif-explanation" className={styles.secondary}>
            The recorded process state stays unchanged. An engineer reviews
            evidence before considering action. This does not command a machine.
          </p>
          <dl className={styles.lineage}>
            <div>
              <dt>Tyre</dt>
              <dd>{lineage.tyreId}</dd>
            </div>
            <div>
              <dt>Trace</dt>
              <dd>{lineage.processTrace?.samples ?? 0} samples</dd>
            </div>
            <div>
              <dt>Policy</dt>
              <dd>{lineage.models.decisionPolicyVersion}</dd>
            </div>
            <div>
              <dt>Review</dt>
              <dd>{lineage.review?.status ?? "not required"}</dd>
            </div>
          </dl>
        </>
      )}
    </aside>
  );
}
export default IntelligenceAnnotations;
