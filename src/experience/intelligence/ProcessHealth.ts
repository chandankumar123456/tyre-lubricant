/**
 * Illustrative Process Health Indicator — H(t) = f(D_normal, D_process, defect rate, parameter
 * drift, spatial drift) over a window of consecutive tyres (slow clock).
 *
 * This is a decision-support index for the PROCESS, not a tyre-quality percentage and not a
 * validated plant KPI. Tyre disposition and process status are independent: a failing tyre can sit
 * in a stable process, and a passing tyre can sit in a drifting one.
 */
import { detectDrift } from "./DriftModel";
import type { TyreDisposition } from "./DecisionEngine";
import type { ProcessState } from "./ProcessModel";
import {
  processHealthPolicy,
  type ProcessHealthPolicy,
} from "./DecisionPolicy";

export type ProcessHealthState = "STABLE" | "WARNING" | "CRITICAL";

export interface HealthEvidence {
  /** Slow-clock position of the tyre in production. */
  sequenceIndex: number;
  peakNormalExcess: number;
  /** Null means the process expectation was unavailable, rather than zero unexplained evidence. */
  peakProcessResidual: number | null;
  disposition: TyreDisposition;
  /** False when no supported normal model can establish product abnormality (e.g. unsupported REVIEW). */
  productEvidenceAvailable?: boolean;
  candidate: { thetaDegrees: number; s: number } | null;
  values: ProcessState["values"];
}

type Component = keyof ProcessHealthPolicy["weights"];

export interface ProcessHealthResult {
  sequenceIndex: number;
  index: number;
  state: ProcessHealthState;
  components: Record<Component, number>;
  windowSequence: number[];
  driftPersistent: boolean;
  /** Qualifies the indicator; an unavailable index must not be presented as evidence of stability. */
  evidenceStatus: "complete" | "partial" | "unavailable";
  reasons: string[];
  policyVersion: string;
  validated: false;
  illustrative: true;
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
function median(values: number[]) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
}
function slope(values: number[]) {
  const n = values.length;
  if (n < 2) return 0;
  const mx = (n - 1) / 2,
    my = values.reduce((sum, v) => sum + v, 0) / n;
  let cross = 0,
    square = 0;
  values.forEach((value, x) => {
    cross += (x - mx) * (value - my);
    square += (x - mx) ** 2;
  });
  return cross / square;
}

const COMPONENT_TEXT: Record<Component, string> = {
  persistentNormalDeviation: "persistent deviation from normal",
  persistentProcessResidual: "persistent unexplained process residual",
  defectFrequency: "frequency of flagged tyres",
  trend: "rising deviation trend",
  parameterDrift: "process parameter drift",
  spatialPersistence: "recurrence at the same surface location",
};

export function evaluateProcessHealth(
  history: HealthEvidence[],
  endIndex: number,
  reference: ProcessState["values"],
  policy: ProcessHealthPolicy = processHealthPolicy,
): ProcessHealthResult {
  const window = history.slice(Math.max(0, endIndex - policy.window + 1), endIndex + 1);
  const scales = policy.scales;
  const usableProduct = (entry: HealthEvidence) =>
    entry.productEvidenceAvailable !== false &&
    entry.disposition !== "INVALID" && entry.disposition !== "SYSTEM_FAULT" &&
    Number.isFinite(entry.peakNormalExcess);
  const productWindow = window.filter(usableProduct);
  const peaks = productWindow.map((entry) => entry.peakNormalExcess);
  const residuals = productWindow.map((entry) => entry.peakProcessResidual)
    .filter((value): value is number => value !== null && Number.isFinite(value));
  const flagged = productWindow.filter(
    (entry) => entry.disposition === "FAIL" || entry.disposition === "REVIEW",
  ).length;
  let parameterDrift = 0;
  for (const [key, scale] of Object.entries(scales.parameterDrift)) {
    const values = window
      .map((entry) => entry.values[key])
      .filter((value): value is number => Number.isFinite(value));
    const ref = reference[key];
    if (!values.length || !Number.isFinite(ref)) continue;
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    parameterDrift = Math.max(parameterDrift, Math.abs(mean - ref!) / scale);
  }
  const located = productWindow
    .map((entry) => entry.candidate)
    .filter((candidate): candidate is NonNullable<typeof candidate> =>
      !!candidate && Number.isFinite(candidate.thetaDegrees) && Number.isFinite(candidate.s));
  let cluster = 0;
  for (const a of located) {
    const near = located.filter((b) => {
      const dTheta = Math.abs(((a.thetaDegrees - b.thetaDegrees + 540) % 360) - 180);
      return (
        dTheta <= scales.spatialRadiusTheta &&
        Math.abs(a.s - b.s) <= scales.spatialRadiusS
      );
    }).length;
    cluster = Math.max(cluster, near);
  }
  const components: Record<Component, number> = {
    persistentNormalDeviation: clamp01(median(peaks) / scales.normalDeviation),
    persistentProcessResidual: clamp01(
      median(residuals) /
        scales.processResidual,
    ),
    defectFrequency: clamp01(flagged / Math.max(1, productWindow.length)),
    trend: clamp01(slope(peaks) / scales.trendPerTyre),
    parameterDrift: clamp01(parameterDrift),
    spatialPersistence:
      cluster >= 2 ? clamp01((cluster - 1) / Math.max(1, policy.window - 1)) : 0,
  };
  let penalty = 0;
  for (const [key, weight] of Object.entries(policy.weights) as [Component, number][])
    penalty += weight * components[key];
  const index = Math.round(100 * (1 - penalty));
  // A missing/invalid inspection breaks evidence of consecutive product drift.
  const consecutive: number[] = [];
  for (const entry of history.slice(0, endIndex + 1)) {
    if (usableProduct(entry)) consecutive.push(entry.peakNormalExcess);
    else consecutive.length = 0;
  }
  const drift = detectDrift(consecutive, policy.window);
  let state: ProcessHealthState =
    index < policy.states.criticalBelow
      ? "CRITICAL"
      : index < policy.states.warningBelow
        ? "WARNING"
        : "STABLE";
  const reasons = (Object.entries(components) as [Component, number][])
    .filter(([, value]) => value >= 0.35)
    .sort((a, b) => b[1] * policy.weights[b[0]] - a[1] * policy.weights[a[0]])
    .map(([key]) => COMPONENT_TEXT[key]);
  const hasParameters = window.some((entry) =>
    Object.keys(scales.parameterDrift).some((key) =>
      Number.isFinite(entry.values[key]) && Number.isFinite(reference[key])));
  const evidenceStatus: ProcessHealthResult["evidenceStatus"] =
    !productWindow.length && !hasParameters ? "unavailable"
      : productWindow.length === window.length && residuals.length === productWindow.length
        ? "complete" : "partial";
  if (!productWindow.length) reasons.push("Usable product-history evidence unavailable.");
  else if (productWindow.length < window.length)
    reasons.push("Invalid or unsupported inspections excluded from product-history evidence.");
  if (residuals.length < productWindow.length)
    reasons.push("Process residual evidence unavailable for some inspected tyres.");
  if (drift.persistent && state === "STABLE") {
    state = "WARNING";
    reasons.unshift("persistent drift detected across the window");
  }
  return {
    sequenceIndex: window.at(-1)?.sequenceIndex ?? endIndex,
    index,
    state,
    components,
    windowSequence: window.map((entry) => entry.sequenceIndex),
    driftPersistent: drift.persistent,
    evidenceStatus,
    reasons,
    policyVersion: policy.version,
    validated: false,
    illustrative: true,
  };
}

export function processHealthTimeline(
  history: HealthEvidence[],
  reference: ProcessState["values"],
  policy: ProcessHealthPolicy = processHealthPolicy,
): ProcessHealthResult[] {
  return history.map((_, index) =>
    evaluateProcessHealth(history, index, reference, policy),
  );
}
