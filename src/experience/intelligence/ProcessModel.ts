/**
 * Observable process schema shared by providers and process models.
 *
 * Two clocks are kept deliberately separate:
 * - FAST clock (intra-tyre): `ProcessTraceSample.t` is seconds since this tyre's spray cycle began,
 *   with the encoder angle `theta` aligning telemetry to the canonical θ coordinate (Idea 2).
 * - SLOW clock (inter-tyre): `TyreRecord.sequenceIndex` orders tyres through production (Idea 3).
 * A production-history index must never be used as intra-tyre process time, or vice versa.
 */
export type ProcessChannel =
  | "pressure"
  | "flowRate"
  | "nozzlePosition"
  | "rotationSpeed"
  | "sprayOn";

export interface ProcessTraceSample {
  /** Fast clock: seconds since the spray cycle of this tyre started. */
  t: number;
  /**
   * Encoder angle in degrees of the canonical θ coordinate currently under the nozzle. It increases
   * monotonically and may exceed 360° during the spray overlap.
   */
  theta: number;
  pressure?: number;
  flowRate?: number;
  nozzlePosition?: number;
  rotationSpeed?: number;
  sprayOn?: boolean;
}

export interface ProcessTrace {
  traceId: string;
  tyreId: string;
  stationId: string;
  clock: "intra-tyre";
  /** Epoch milliseconds of sample t=0 (spray-station time, not inspection time). */
  startTimestamp: number;
  samples: ProcessTraceSample[];
  channels: ProcessChannel[];
  illustrative: true;
  source: "synthetic-telemetry";
}

export interface ProcessState {
  /** Spray-station timestamp of this tyre's process record (epoch ms). */
  timestamp: number;
  /** Scalar summaries of the recorded trace, retained for association and display. */
  values: {
    pressure?: number;
    flowRate?: number;
    nozzlePosition?: number;
    speed?: number;
    viscosity?: number;
    [key: string]: number | undefined;
  };
  /** Optional time-aligned telemetry; absent when the station does not provide it. */
  trace?: ProcessTrace;
}

export interface GeometryContext {
  width?: number;
  height?: number;
  profileArcLength?: number;
  nominalProfileArcLength?: number;
}

/**
 * - `trace-conditioned`: expectation accumulated from time-aligned telemetry.
 * - `summary-only`: no trace; an idealized uniform revolution is assumed from scalar summaries.
 * - `unavailable`: no process information; a recipe-nominal reference is returned at low support so
 *   downstream arrays stay aligned, and must be presented as unavailable.
 */
export type ProcessPredictionStatus =
  | "trace-conditioned"
  | "summary-only"
  | "unavailable";

export interface ProcessPrediction {
  expected: Float32Array;
  /** Normalized idealized deposition (1 = recipe-nominal peak) before optical calibration. */
  deposition: Float32Array;
  support: Float32Array;
  illustrative: true;
  variantId: string;
  availableVariables: string[];
  status: ProcessPredictionStatus;
  missingChannels: ProcessChannel[];
  /** Summary values outside the calibration operating envelope. */
  outOfEnvelope: string[];
  supportLevel: "supported" | "limited" | "unavailable";
  modelVersion: string;
  calibrationVersion: string;
  notes: string[];
}

export interface ProcessModel {
  readonly version: string;
  predict(
    variantId: string,
    processState: ProcessState,
    geometry?: GeometryContext,
  ): ProcessPrediction;
}
