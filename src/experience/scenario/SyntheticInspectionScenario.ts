/**
 * DEMO / GENERATOR GROUND TRUTH.
 *
 * This module describes the synthetic reality used to *generate* illustrative surfaces and process
 * telemetry. Inference code (NormalModel, PrototypeProcessModel, DecisionEngine, DriftModel,
 * ProcessHealth) must never import it: models only receive observable inputs (surfaces, recorded
 * process traces, geometry). `scenarioBoundary.test.ts` enforces this import boundary.
 *
 * Allowed consumers: SurfaceGenerator / SyntheticPlant, data providers, explanatory overlays that
 * intentionally show the narrative reference region, StaticEvidence and DebugTools.
 */
import type { ProcessChannel } from "../intelligence/ProcessModel";

export type DefectSignatureType =
  | "local-excess-material"
  | "lower-bead-accumulation"
  | "multiple-line-concentration"
  | "single-point-concentration"
  | "insufficient-or-missing-spray";

export interface SyntheticAnomaly {
  id: string;
  /** Ground-truth label used only for generation and labelled validation views. */
  type: DefectSignatureType | "unknown";
  centerTheta: number;
  centerS: number;
  /** Additive normalized optical response at the centre; negative removes response. */
  amplitude: number;
  spreadTheta: number;
  spreadS: number;
  /** Optional secondary elongation (degrees per unit s) for non-elliptical unknown patterns. */
  shearThetaPerS?: number;
}

/** True (unobserved) process conditions for one tyre. Telemetry is recorded from this with noise. */
export interface SyntheticProcessScenario {
  nozzlePosition: number;
  pressure: number;
  flowRate: number;
  rotationSpeed: number;
  /** Surface angle (degrees) under the nozzle when the spray valve opens. */
  sprayStartTheta: number;
  /** Extra angular travel beyond 360° before the valve closes (degrees). */
  sprayOverlapDegrees: number;
  /** Relative flow overshoot when the valve opens, decaying over `overshootDecayDegrees`. */
  flowOvershoot: number;
  overshootDecayDegrees: number;
  /** Channels the station records. Missing channels are absent from the recorded trace. */
  recordedChannels: ProcessChannel[];
  /** Transient events within this tyre's spray cycle (fast clock). */
  events?: ProcessEvent[];
  /** Whether the station delivers a time-aligned trace at all (false → summaries only). */
  traceRecorded?: boolean;
}

export interface ProcessEvent {
  kind: "rotation-hesitation";
  /** Encoder angle window (degrees) during which the event acts. */
  thetaRange: [number, number];
  /** Rotation speed multiplier inside the window (<1 means slower, i.e. longer dwell). */
  speedFactor: number;
}

export interface MeasurementArtifact {
  kind: "low-confidence" | "invalid" | "coverage-gap";
  thetaRange: [number, number];
  sRange: [number, number];
  /** Confidence reduction for low-confidence artifacts (0..1). */
  severity?: number;
  cause: string;
}

export interface SyntheticInspectionScenario {
  scenarioId: string;
  tyreId: string;
  tyreVariant: string;
  seed: string;
  anomalies: SyntheticAnomaly[];
  processScenario: SyntheticProcessScenario;
  measurementArtifacts: MeasurementArtifact[];
  metadata: {
    groundTruth: true;
    illustrative: true;
    purpose: string;
  };
}

export const ALL_PROCESS_CHANNELS: ProcessChannel[] = [
  "pressure",
  "flowRate",
  "nozzlePosition",
  "rotationSpeed",
  "sprayOn",
];

/** Recipe-nominal process conditions for variant-A (illustrative, not a client recipe). */
export const NOMINAL_PROCESS: SyntheticProcessScenario = Object.freeze({
  nozzlePosition: 0.5,
  pressure: 1,
  flowRate: 1,
  rotationSpeed: 1,
  sprayStartTheta: 205,
  sprayOverlapDegrees: 14,
  flowOvershoot: 0.12,
  overshootDecayDegrees: 9,
  recordedChannels: ALL_PROCESS_CHANNELS,
}) as SyntheticProcessScenario;

/** Measurement artifacts shared by every synthetic acquisition at this illustrative station. */
export const STATION_ARTIFACTS: MeasurementArtifact[] = [
  {
    kind: "low-confidence",
    thetaRange: [88.2, 113.4],
    sRange: [0.25, 0.49],
    severity: 0.72,
    cause: "illustrative glare / ambiguous optical response",
  },
  {
    kind: "invalid",
    thetaRange: [291.6, 307.8],
    sRange: [0.18, 0.32],
    cause: "illustrative occlusion; region not inspected successfully",
  },
];

/** The hero tyre's unexplained lower-bead accumulation. Generator truth, not a model input. */
const heroPooling: SyntheticAnomaly = {
  id: "hero-lower-bead-pooling",
  type: "lower-bead-accumulation",
  centerTheta: 217,
  centerS: 0.78,
  amplitude: 0.5,
  spreadTheta: 9.7,
  spreadS: 0.065,
};

export const heroScenario: SyntheticInspectionScenario = {
  scenarioId: "hero-v2",
  tyreId: "TYR-1012",
  tyreVariant: "variant-A",
  seed: "hero-tyre",
  anomalies: [heroPooling],
  processScenario: {
    ...NOMINAL_PROCESS,
    nozzlePosition: 0.58,
    pressure: 1.05,
    flowRate: 1.04,
    flowOvershoot: 0.3,
    events: [
      { kind: "rotation-hesitation", thetaRange: [206, 228], speedFactor: 0.38 },
    ],
  },
  measurementArtifacts: STATION_ARTIFACTS,
  metadata: {
    groundTruth: true,
    illustrative: true,
    purpose:
      "Hero tyre: a recorded rotation hesitation (partly explains the excess) plus an unexplained lower-bead accumulation.",
  },
};

/**
 * Explanatory "same region" reference used by Scenes 01–02 overlays and the shell marker, where
 * the story intentionally points at a region before any analysis has run. Analysis scenes should
 * present model-derived candidate locations instead.
 */
export const narrativeReference = Object.freeze({
  thetaDegrees: heroPooling.centerTheta,
  u: heroPooling.centerTheta / 360,
  v: heroPooling.centerS,
  groundTruth: true as const,
});

/** Labelled example: a significant pattern that does not match the known taxonomy. */
export const unknownPatternScenario: SyntheticInspectionScenario = {
  scenarioId: "example-unknown-pattern",
  tyreId: "EXAMPLE-UNKNOWN",
  tyreVariant: "variant-A",
  seed: "example-unknown",
  anomalies: [
    {
      id: "diagonal-streak",
      type: "unknown",
      centerTheta: 140,
      centerS: 0.45,
      amplitude: 0.32,
      spreadTheta: 4,
      spreadS: 0.24,
      shearThetaPerS: 150,
    },
  ],
  processScenario: { ...NOMINAL_PROCESS },
  measurementArtifacts: STATION_ARTIFACTS,
  metadata: {
    groundTruth: true,
    illustrative: true,
    purpose:
      "Labelled example of a significant unmatched pattern routed to engineer review.",
  },
};

/** Labelled example: incomplete acquisition (θ 173°–181° never captured) → INVALID / REINSPECT. */
export const incompleteAcquisitionScenario: SyntheticInspectionScenario = {
  scenarioId: "example-incomplete-acquisition",
  tyreId: "EXAMPLE-INCOMPLETE",
  tyreVariant: "variant-A",
  seed: "example-incomplete",
  anomalies: [],
  processScenario: { ...NOMINAL_PROCESS },
  measurementArtifacts: [
    ...STATION_ARTIFACTS,
    {
      kind: "coverage-gap",
      thetaRange: [173, 181],
      sRange: [0, 1],
      cause: "illustrative missed acquisition window",
    },
    {
      kind: "low-confidence",
      thetaRange: [20, 70],
      sRange: [0.1, 0.9],
      severity: 0.7,
      cause: "illustrative illumination fault",
    },
  ],
  metadata: {
    groundTruth: true,
    illustrative: true,
    purpose:
      "Labelled example showing that missing evidence becomes INVALID / REINSPECT, not a defect.",
  },
};
