/**
 * Tyre disposition under an illustrative, UNVALIDATED prototype policy.
 *
 * Models produce evidence; this module interprets evidence. Precedence:
 *   1. Is the measurement usable?            no  → INVALID / REINSPECT
 *   2. Is there an approved normal model?   no  → REVIEW (unsupported variant / model)
 *   3. No significant abnormality                → PASS
 *   4. Significant pattern, unknown taxonomy     → REVIEW
 *   5. Known pattern, evidence mostly weak       → REVIEW
 *   6. Known pattern, high severity              → FAIL (held for quality confirmation)
 *   7. Known pattern below fail severity         → REVIEW
 * Missing or low-confidence evidence is never treated as a defect. Process-model agreement is not a
 * quality pass, so Idea 2 evidence does not enter the tyre disposition.
 */
import type { SurfaceField } from "../surface/SurfaceField";
import type { NormalFingerprint } from "./NormalModel";
import {
  characterizeDeviation,
  SIGNATURE_LABELS,
  type DefectCandidate,
} from "./DefectCharacterization";
import { prototypeDecisionPolicy, type DecisionPolicy } from "./DecisionPolicy";

export type TyreDisposition =
  | "PASS"
  | "FAIL"
  | "INVALID"
  | "REVIEW"
  /** Defined for architecture completeness; only returned when a system fault is explicitly reported. */
  | "SYSTEM_FAULT";

export type RecommendedAction =
  | "RELEASE"
  | "HOLD_FOR_CONFIRMATION"
  | "REINSPECT"
  | "ENGINEER_REVIEW"
  | "CHECK_INSPECTION_SYSTEM";

export const ACTION_LABELS: Record<RecommendedAction, string> = {
  RELEASE: "Release",
  HOLD_FOR_CONFIRMATION: "Hold for quality confirmation",
  REINSPECT: "Reinspect",
  ENGINEER_REVIEW: "Engineer review",
  CHECK_INSPECTION_SYSTEM: "Check inspection system",
};

export interface MeasurementHealth {
  validFraction: number;
  lowConfidenceFraction: number;
  coverageCompleteness: number;
  largestCoverageGapDegrees: number;
  reportedMissedRanges: [number, number][];
  usable: boolean;
  issues: string[];
}

export interface DecisionReason {
  code: string;
  text: string;
}

export type Severity = "none" | "low" | "moderate" | "high";

export interface DecisionResult {
  disposition: TyreDisposition;
  recommendedAction: RecommendedAction;
  reasons: DecisionReason[];
  measurementHealth: MeasurementHealth;
  productIndicators: {
    peakExcess: number;
    peakZ: number;
    areaFraction: number;
  } | null;
  defectCandidate: DefectCandidate | null;
  severity: Severity;
  /** Qualitative evidence quality, not a probability. */
  evidenceConfidence: "high" | "limited" | "low";
  policyVersion: string;
  validatedPolicy: false;
  illustrative: true;
}

export function assessMeasurement(
  field: SurfaceField,
  policy: DecisionPolicy = prototypeDecisionPolicy,
): MeasurementHealth {
  const rules = policy.measurement;
  const { width, height } = field;
  let valid = 0,
    weak = 0,
    covered = 0;
  const columnCovered = new Uint8Array(width);
  for (let x = 0; x < width; x++) {
    let columnValid = 0;
    for (let y = 0; y < height; y++) {
      const i = y * width + x;
      if (
        !field.validity[i] ||
        !Number.isFinite(field.observation[i]) ||
        !Number.isFinite(field.confidence[i]) ||
        field.confidence[i] < 0 || field.confidence[i] > 1
      ) continue;
      if (field.confidence[i] < rules.lowConfidence) weak++;
      else columnValid++;
      valid++;
    }
    if (columnValid / height >= rules.columnCoverageShare) {
      columnCovered[x] = 1;
      covered++;
    }
  }
  let gap = 0,
    run = 0;
  for (let k = 0; k < width * 2; k++) {
    run = columnCovered[k % width] ? 0 : run + 1;
    gap = Math.max(gap, Math.min(run, width));
  }
  const total = width * height;
  const health = {
    validFraction: valid / total,
    lowConfidenceFraction: valid ? weak / valid : 1,
    coverageCompleteness: covered / width,
    largestCoverageGapDegrees: (gap / width) * 360,
    reportedMissedRanges: field.acquisition.missedThetaRanges ?? [],
  };
  const issues: string[] = [];
  if (health.reportedMissedRanges.length)
    issues.push(
      `Acquisition reported missed windows: ${health.reportedMissedRanges
        .map(([a, b]) => `θ ${a}°–${b}°`)
        .join(", ")}.`,
    );
  if (health.validFraction < rules.minValidFraction)
    issues.push("Too little of the surface was inspected successfully.");
  if (health.coverageCompleteness < rules.minCoverage)
    issues.push("Angular coverage is incomplete.");
  if (health.largestCoverageGapDegrees > rules.maxCoverageGapDegrees)
    issues.push(
      `Coverage gap of ${health.largestCoverageGapDegrees.toFixed(0)}° exceeds the prototype limit.`,
    );
  if (health.lowConfidenceFraction > rules.maxLowConfidenceFraction)
    issues.push("Too much of the valid surface has low confidence.");
  return { ...health, usable: issues.length === 0, issues };
}

export function severityOf(
  candidate: DefectCandidate | null,
  policy: DecisionPolicy = prototypeDecisionPolicy,
): Severity {
  if (!candidate) return "none";
  const rules = policy.severity;
  if (
    candidate.peakExcess >= rules.highPeak ||
    candidate.extent.areaFraction >= rules.highAreaFraction
  )
    return "high";
  if (candidate.peakExcess >= rules.moderatePeak) return "moderate";
  return "low";
}

export interface DecisionInput {
  field: SurfaceField;
  /** Approved normal model for the tyre's variant, or null when none exists. */
  normal: NormalFingerprint | null;
  /** Explicitly reported inspection-system fault; never inferred from product evidence. */
  systemFault?: string;
}

export function decideTyre(
  input: DecisionInput,
  policy: DecisionPolicy = prototypeDecisionPolicy,
): DecisionResult {
  const measurementHealth = assessMeasurement(input.field, policy);
  const base = {
    measurementHealth,
    policyVersion: policy.version,
    validatedPolicy: false as const,
    illustrative: true as const,
  };
  if (input.systemFault)
    return {
      ...base,
      disposition: "SYSTEM_FAULT",
      recommendedAction: "CHECK_INSPECTION_SYSTEM",
      reasons: [{ code: "SYSTEM_FAULT", text: input.systemFault }],
      productIndicators: null,
      defectCandidate: null,
      severity: "none",
      evidenceConfidence: "low",
    };
  if (!measurementHealth.usable)
    return {
      ...base,
      disposition: "INVALID",
      recommendedAction: "REINSPECT",
      reasons: [
        {
          code: "MEASUREMENT_UNUSABLE",
          text: "Measurement is not usable; no product judgement is made.",
        },
        ...measurementHealth.issues.map((text) => ({
          code: "MEASUREMENT_ISSUE",
          text,
        })),
      ],
      productIndicators: null,
      defectCandidate: null,
      severity: "none",
      evidenceConfidence: "low",
    };
  const valid = {
    code: "MEASUREMENT_USABLE",
    text: `Measurement usable: ${(measurementHealth.validFraction * 100).toFixed(1)}% valid, ${(measurementHealth.coverageCompleteness * 100).toFixed(0)}% angular coverage.`,
  };
  if (
    !input.normal ||
    input.normal.variantId !== input.field.metadata.variantId
  )
    return {
      ...base,
      disposition: "REVIEW",
      recommendedAction: "ENGINEER_REVIEW",
      reasons: [
        valid,
        {
          code: "UNSUPPORTED_VARIANT",
          text: `No approved normal model for ${input.field.metadata.variantId}.`,
        },
      ],
      productIndicators: null,
      defectCandidate: null,
      severity: "none",
      evidenceConfidence: "limited",
    };
  const count = input.field.width * input.field.height;
  const normal = input.normal;
  const aligned = [normal.mean, normal.variation, normal.support].every(
    (array) => array.length === count,
  );
  let supported = 0;
  if (aligned)
    for (let i = 0; i < count; i++)
      if (normal.support[i] > 0 && Number.isFinite(normal.mean[i]) &&
          Number.isFinite(normal.variation[i]) && normal.variation[i] >= 0)
        supported++;
  if (!aligned || supported / count < policy.detection.minModelCoverage)
    return {
      ...base,
      disposition: "REVIEW",
      recommendedAction: "ENGINEER_REVIEW",
      reasons: [valid, {
        code: "NORMAL_MODEL_UNSUPPORTED",
        text: "Population-normal evidence has insufficient supported coverage or incompatible arrays; no product judgement is made.",
      }],
      productIndicators: null,
      defectCandidate: null,
      severity: "none",
      evidenceConfidence: "limited",
    };
  const candidate = characterizeDeviation(input.field, normal, policy);
  const severity = severityOf(candidate, policy);
  if (!candidate)
    return {
      ...base,
      disposition: "PASS",
      recommendedAction: "RELEASE",
      reasons: [
        valid,
        {
          code: "NO_SIGNIFICANT_ABNORMALITY",
          text: "No significant deviation from the population normal.",
        },
      ],
      productIndicators: null,
      defectCandidate: null,
      severity,
      evidenceConfidence: "high",
    };
  const productIndicators = {
    peakExcess: candidate.peakExcess,
    peakZ: candidate.peakZ,
    areaFraction: candidate.extent.areaFraction,
  };
  const label = SIGNATURE_LABELS[candidate.signature];
  const pattern = {
    code: candidate.known ? "KNOWN_PATTERN" : "UNKNOWN_PATTERN",
    text: candidate.known
      ? `${label} candidate — ${candidate.matchBasis}`
      : `Significant pattern outside the known taxonomy — ${candidate.matchBasis}`,
  };
  const weakEvidence =
    candidate.lowConfidenceShare > policy.maxCandidateLowConfidenceShare;
  const evidenceConfidence = weakEvidence ? "limited" : "high";
  const result = (
    disposition: TyreDisposition,
    recommendedAction: RecommendedAction,
    extra: DecisionReason,
  ): DecisionResult => ({
    ...base,
    disposition,
    recommendedAction,
    reasons: [valid, pattern, extra],
    productIndicators,
    defectCandidate: candidate,
    severity,
    evidenceConfidence,
  });
  if (!candidate.known)
    return result("REVIEW", "ENGINEER_REVIEW", {
      code: "HUMAN_REVIEW",
      text: "Unmatched significant patterns go to engineer review and may become a knowledge candidate.",
    });
  if (weakEvidence)
    return result("REVIEW", "ENGINEER_REVIEW", {
      code: "WEAK_EVIDENCE",
      text: "The region borders low-confidence or invalid evidence.",
    });
  if (severity === "high")
    return result("FAIL", "HOLD_FOR_CONFIRMATION", {
      code: "SEVERITY_HIGH",
      text: "High severity under the illustrative, unvalidated prototype policy.",
    });
  return result("REVIEW", "ENGINEER_REVIEW", {
    code: "SEVERITY_BELOW_FAIL",
    text: `${severity === "moderate" ? "Moderate" : "Low"} severity: below the prototype fail level, so it is reviewed rather than released.`,
  });
}
