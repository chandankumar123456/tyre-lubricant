/**
 * PROTOTYPE POLICY CONFIGURATION — ILLUSTRATIVE, UNVALIDATED.
 *
 * Every numeric threshold used by measurement-health, defect characterization, tyre disposition and
 * the process-health indicator lives here. None of these values are validated manufacturing limits;
 * production limits must be established from validated data and quality requirements.
 */
export const prototypeDecisionPolicy = Object.freeze({
  version: "prototype-decision-policy/0.1",
  validated: false as const,
  measurement: Object.freeze({
    /** Confidence below which a valid cell counts as low confidence. */
    lowConfidence: 0.5,
    minValidFraction: 0.95,
    maxLowConfidenceFraction: 0.03,
    /** A θ column counts as covered when at least this share of its profile is valid. */
    columnCoverageShare: 0.5,
    minCoverage: 0.98,
    maxCoverageGapDegrees: 5,
  }),
  detection: Object.freeze({
    /** Share of the observed grid with finite, supported population-normal evidence. */
    minModelCoverage: 0.95,
    /** Standardized normal deviation |z| that marks a cell as significant. */
    cellZ: 4,
    /** Minimum absolute response difference from μ for a significant cell. */
    minExcess: 0.06,
    minConfidence: 0.5,
    minCells: 3,
  }),
  signature: Object.freeze({
    /** Profile coordinate from which a region counts as lower-bead. */
    lowerBeadS: 0.68,
    compactCells: 10,
    /** |θ–s correlation| above which a single region is treated as an unmatched oblique pattern. */
    obliqueCorrelation: 0.6,
    /** θ-span / s-span (both normalized) above which a region counts as line-like. */
    lineAspect: 3,
  }),
  severity: Object.freeze({
    moderatePeak: 0.12,
    highPeak: 0.25,
    highAreaFraction: 0.02,
  }),
  /** Share of candidate cells allowed to be low confidence before review is required. */
  maxCandidateLowConfidenceShare: 0.25,
});

export type DecisionPolicy = typeof prototypeDecisionPolicy;

export const processHealthPolicy = Object.freeze({
  version: "process-health-indicator/0.1",
  validated: false as const,
  /** Number of consecutive tyres (slow clock) per evaluation window. */
  window: 4,
  /** Component weights; they sum to 1. Index = 100 × (1 − Σ weight × normalized component). */
  weights: Object.freeze({
    persistentNormalDeviation: 0.25,
    persistentProcessResidual: 0.2,
    defectFrequency: 0.1,
    trend: 0.15,
    parameterDrift: 0.15,
    spatialPersistence: 0.15,
  }),
  /** Values at which each component saturates to 1. */
  scales: Object.freeze({
    normalDeviation: 0.4,
    processResidual: 0.4,
    trendPerTyre: 0.06,
    parameterDrift: Object.freeze({
      nozzlePosition: 0.08,
      flowRate: 0.12,
      pressure: 0.12,
      speed: 0.12,
    } as Record<string, number>),
    spatialRadiusTheta: 20,
    spatialRadiusS: 0.12,
  }),
  states: Object.freeze({ warningBelow: 75, criticalBelow: 45 }),
});

export type ProcessHealthPolicy = typeof processHealthPolicy;
