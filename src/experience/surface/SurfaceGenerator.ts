/**
 * Synthetic observed-data generator (demo reality). Consumes ground-truth scenarios; inference code
 * must not import this module.
 */
import type { SurfaceField, AcquisitionView } from "./SurfaceField";
import { SURFACE_WIDTH, SURFACE_HEIGHT } from "./SurfaceField";
import { seededRandom } from "../core/seededRandom";
import {
  NOMINAL_PROCESS,
  STATION_ARTIFACTS,
  heroScenario,
  narrativeReference,
  type MeasurementArtifact,
  type SyntheticAnomaly,
  type SyntheticInspectionScenario,
} from "../scenario/SyntheticInspectionScenario";
import {
  plantResponse,
  recordTelemetry,
  simulateTrueTrace,
} from "../scenario/SyntheticPlant";
import type { ProcessTrace, ProcessTraceSample } from "../intelligence/ProcessModel";

export { seededRandom };
/** Explanatory reference region (generator truth). Kept for overlays/tests; never a model input. */
export const ANOMALY = narrativeReference;
export const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

/** Illustrative variant substrate response without lubricant (station/illumination structure). */
export function substrateResponse(u: number, v: number): number {
  return (
    0.3 +
    0.018 * Math.cos(2 * Math.PI * u) +
    0.012 * Math.cos(6 * Math.PI * u) * Math.sin(Math.PI * v)
  );
}

function wrappedDegrees(a: number, b: number) {
  const d = Math.abs((((a - b) % 360) + 360) % 360);
  return Math.min(d, 360 - d);
}

export function anomalyResponse(
  anomaly: SyntheticAnomaly,
  u: number,
  v: number,
): number {
  const sheared =
    anomaly.centerTheta + (anomaly.shearThetaPerS ?? 0) * (v - anomaly.centerS);
  const dTheta = wrappedDegrees(u * 360, sheared) / anomaly.spreadTheta;
  const dS = (v - anomaly.centerS) / anomaly.spreadS;
  return anomaly.amplitude * Math.exp(-0.5 * (dTheta ** 2 + dS ** 2));
}

function insideArtifact(artifact: MeasurementArtifact, u: number, v: number) {
  const theta = u * 360;
  return (
    theta >= artifact.thetaRange[0] &&
    theta <= artifact.thetaRange[1] &&
    v >= artifact.sRange[0] &&
    v <= artifact.sRange[1]
  );
}

function artifactWeight(artifact: MeasurementArtifact, u: number, v: number) {
  const centreTheta = (artifact.thetaRange[0] + artifact.thetaRange[1]) / 2,
    halfTheta = (artifact.thetaRange[1] - artifact.thetaRange[0]) / 2;
  const centreS = (artifact.sRange[0] + artifact.sRange[1]) / 2,
    halfS = (artifact.sRange[1] - artifact.sRange[0]) / 2;
  return Math.exp(
    -((wrappedDegrees(u * 360, centreTheta) / halfTheta) ** 2) -
      ((v - centreS) / halfS) ** 2,
  );
}

export interface GeneratedInspection {
  surface: SurfaceField;
  /** Generator truth: what the station actually did. Not available to inference. */
  trueTrace: ProcessTraceSample[];
  /** Observable telemetry recorded by the station (absent if the station records no trace). */
  recordedTrace?: ProcessTrace;
}

export function generateInspection(
  scenario: SyntheticInspectionScenario,
  options: {
    acquisitionTimestamp?: number;
    processTimestamp?: number;
    stationId?: string;
  } = {},
): GeneratedInspection {
  const width = SURFACE_WIDTH,
    height = SURFACE_HEIGHT,
    count = width * height;
  const random = seededRandom(scenario.seed);
  const trueTrace = simulateTrueTrace(scenario.processScenario, scenario.seed);
  const deposit = plantResponse(trueTrace, NOMINAL_PROCESS, width, height);
  const acquisitionTimestamp =
    options.acquisitionTimestamp ?? Date.UTC(2026, 9, 9, 8);
  const observation = new Float32Array(count),
    confidence = new Float32Array(count),
    validity = new Uint8Array(count);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const u = x / width,
        v = y / (height - 1),
        i = y * width + x;
      let anomaly = 0;
      for (const entry of scenario.anomalies)
        anomaly += anomalyResponse(entry, u, v);
      observation[i] = clamp(
        substrateResponse(u, v) +
          deposit[i] +
          (random() - 0.5) * 0.035 +
          anomaly,
      );
      let reduction = 0,
        valid = 1;
      for (const artifact of scenario.measurementArtifacts) {
        if (artifact.kind === "low-confidence")
          reduction = Math.max(
            reduction,
            artifactWeight(artifact, u, v) * (artifact.severity ?? 0.7),
          );
        else if (insideArtifact(artifact, u, v)) valid = 0;
      }
      const missed = scenario.measurementArtifacts.some(
        (artifact) =>
          artifact.kind === "coverage-gap" && insideArtifact(artifact, u, v),
      );
      confidence[i] = missed
        ? 0
        : clamp(0.94 - reduction + (random() - 0.5) * 0.04);
      validity[i] = valid;
    }
  const gaps = scenario.measurementArtifacts.filter(
    (artifact) => artifact.kind === "coverage-gap",
  );
  const views: AcquisitionView[] = Array.from({ length: 32 }, (_, i) => ({
    id: `synthetic-${scenario.seed}-view-${i}`,
    timestamp: acquisitionTimestamp + i * 100,
    thetaStart: (i / 32) * 360,
    thetaEnd: ((i + 1) / 32) * 360,
    illustrative: true,
    source: "generated-observation",
  }));
  const sampleViewIndex = Uint16Array.from(observation, (_, i) =>
    Math.floor(((i % width) / width) * views.length),
  );
  const recordedTrace = recordTelemetry(
    trueTrace,
    scenario.processScenario,
    {
      tyreId: scenario.tyreId,
      stationId: options.stationId ?? "SPRAY-02",
      startTimestamp:
        options.processTimestamp ?? acquisitionTimestamp - 90_000,
    },
    scenario.seed,
  );
  return {
    surface: {
      width,
      height,
      observation,
      confidence,
      validity,
      acquisition: {
        views,
        sampleViewIndex,
        ...(gaps.length && {
          missedThetaRanges: gaps.map((gap) => gap.thetaRange),
        }),
      },
      metadata: {
        illustrative: true,
        variantId: scenario.tyreVariant,
        thetaRange: [0, 360],
        profileRange: [0, 1],
        seed: scenario.seed,
        source: "synthetic-prototype",
      },
    },
    trueTrace,
    recordedTrace,
  };
}

/** Compatibility wrapper: nominal process, optional hero-equivalent anomaly. */
export function generateSurface(options: {
  seed: string;
  variantId?: string;
  anomaly?: boolean;
  timestamp?: number;
}): SurfaceField {
  return generateInspection(
    {
      scenarioId: `surface-${options.seed}`,
      tyreId: options.seed,
      tyreVariant: options.variantId ?? "variant-A",
      seed: options.seed,
      anomalies: options.anomaly ? heroScenario.anomalies : [],
      processScenario: { ...NOMINAL_PROCESS },
      measurementArtifacts: STATION_ARTIFACTS,
      metadata: {
        groundTruth: true,
        illustrative: true,
        purpose: "compatibility surface",
      },
    },
    { acquisitionTimestamp: options.timestamp },
  ).surface;
}
