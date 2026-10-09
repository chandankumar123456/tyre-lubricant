/**
 * Idea 2 — idealized, geometry-conditioned spray deposition model (illustrative, not validated CFD).
 *
 * Inputs are observable only: variant geometry, the recorded process trace P(t)/θ(t) (or scalar
 * summaries), and an optical-response calibration learned offline from paired accepted records.
 * This module must not import scenario ground truth or the surface generator.
 *
 * IDEALIZED MODEL ASSUMPTIONS (documented, unvalidated):
 * 1. Each trace sample deposits material proportional to flowRate × dt (dwell): slower rotation at a
 *    given θ means more samples there and therefore more deposition.
 * 2. The footprint is a 2-D Gaussian centred at θ(t) and at the profile aim point s(nozzle height);
 *    its size grows with nozzle-to-surface distance and cone angle; pressure widens the cone.
 * 3. Areal density falls with footprint area; oblique incidence elongates the footprint along s.
 * 4. Optical response is linear in deposition: E = substrate(s) + gain · D, with substrate(s) and
 *    gain learned per variant from paired accepted records.
 */
import { SURFACE_HEIGHT, SURFACE_WIDTH } from "../surface/SurfaceField";
import { nozzleAimS, sprayFootprint, variantGeometry } from "./SprayGeometry";
import type { VariantGeometry } from "./SprayGeometry";
import {
  ALL_CHANNELS,
  CONTINUOUS_CHANNELS,
  RECIPE_NOMINAL,
  idealizedTraceSamples,
  isUsableTrace,
  recordedChannels,
  summarizeTrace,
} from "./ProcessTrace";
import type {
  GeometryContext,
  ProcessChannel,
  ProcessModel,
  ProcessPrediction,
  ProcessState,
  ProcessTraceSample,
} from "./ProcessModel";

export const PROCESS_MODEL_VERSION = "idealized-spray-deposition/0.2";

export interface ProcessCalibration {
  version: string;
  variantId: string;
  /** Learned substrate response per profile row (length = surface height). */
  substrate: Float32Array;
  gain: number;
  /** Operating envelope of the paired records used for calibration. */
  envelope: Record<string, [number, number]>;
  sampleCount: number;
  source: "prior" | "paired-accepted-records";
  illustrative: true;
}

const clamp = (value: number) => Math.min(1, Math.max(0, value));

export function priorCalibration(
  variantId: string,
  height = SURFACE_HEIGHT,
): ProcessCalibration {
  return {
    version: "prior/0.1",
    variantId,
    substrate: new Float32Array(height).fill(0.3),
    gain: 0.13,
    envelope: {
      pressure: [0.9, 1.1],
      flowRate: [0.9, 1.1],
      nozzlePosition: [0.42, 0.58],
      speed: [0.92, 1.08],
    },
    sampleCount: 0,
    source: "prior",
    illustrative: true,
  };
}

function wrappedDegrees(a: number, b: number) {
  const d = Math.abs((((a - b) % 360) + 360) % 360);
  return Math.min(d, 360 - d);
}

function accumulateDeposition(
  samples: ProcessTraceSample[],
  fallback: ProcessState["values"],
  geometry: VariantGeometry,
  geometryScale: number,
  width: number,
  height: number,
): Float32Array {
  const deposition = new Float32Array(width * height);
  const aimCache = new Map<number, number>();
  for (let k = 0; k < samples.length; k++) {
    const sample = samples[k];
    if (sample.sprayOn === false) continue;
    const flow =
      sample.flowRate ?? fallback.flowRate ?? RECIPE_NOMINAL.flowRate;
    if (!(flow > 0)) continue;
    const neighbour = samples[k + 1] ?? samples[k - 1];
    const dt = neighbour ? Math.abs(neighbour.t - sample.t) : 1 / 90;
    const nozzle =
      sample.nozzlePosition ??
      fallback.nozzlePosition ??
      RECIPE_NOMINAL.nozzlePosition;
    const key = Math.round(nozzle * 1e4);
    let aim = aimCache.get(key);
    if (aim === undefined) aimCache.set(key, (aim = nozzleAimS(nozzle)));
    const footprint = sprayFootprint(
      aim,
      sample.pressure ?? fallback.pressure ?? RECIPE_NOMINAL.pressure,
      geometry,
      geometryScale,
    );
    const mass = flow * dt * footprint.densityFactor;
    const theta = ((sample.theta % 360) + 360) % 360;
    const columns = Math.ceil(
      ((3 * footprint.sigmaThetaDegrees) / 360) * width,
    );
    const middle = Math.round((theta / 360) * width);
    const rowLow = Math.max(0, Math.floor((aim - 3 * footprint.sigmaS) * (height - 1)));
    const rowHigh = Math.min(
      height - 1,
      Math.ceil((aim + 3 * footprint.sigmaS) * (height - 1)),
    );
    for (let dx = -columns; dx <= columns; dx++) {
      const column = (((middle + dx) % width) + width) % width;
      const dTheta =
        wrappedDegrees((column / width) * 360, theta) /
        footprint.sigmaThetaDegrees;
      const weightTheta = Math.exp(-0.5 * dTheta * dTheta);
      for (let y = rowLow; y <= rowHigh; y++) {
        const dS = (y / (height - 1) - aim) / footprint.sigmaS;
        deposition[y * width + column] +=
          mass * weightTheta * Math.exp(-0.5 * dS * dS);
      }
    }
  }
  return deposition;
}

const normalizers = new Map<string, number>();
function nominalNormalizer(
  geometry: VariantGeometry,
  geometryScale: number,
  width: number,
  height: number,
) {
  const key = `${geometry.variantId}|${geometryScale}|${width}x${height}`;
  let value = normalizers.get(key);
  if (value === undefined) {
    const reference = accumulateDeposition(
      idealizedTraceSamples(RECIPE_NOMINAL),
      RECIPE_NOMINAL,
      geometry,
      geometryScale,
      width,
      height,
    );
    value = reference.reduce((max, entry) => Math.max(max, entry), 0) || 1;
    normalizers.set(key, value);
  }
  return value;
}

export class IllustrativeProcessModel implements ProcessModel {
  readonly version = PROCESS_MODEL_VERSION;
  constructor(
    private readonly calibrations: Record<string, ProcessCalibration> = {},
  ) {}

  calibrationFor(variantId: string, height = SURFACE_HEIGHT) {
    const calibration = this.calibrations[variantId];
    return calibration && calibration.substrate.length === height
      ? calibration
      : priorCalibration(variantId, height);
  }

  /** Normalized idealized deposition (1 = recipe-nominal peak) and the inputs that produced it. */
  deposition(
    variantId: string,
    state: ProcessState,
    geometry: GeometryContext = {},
  ) {
    const width = geometry.width ?? SURFACE_WIDTH,
      height = geometry.height ?? SURFACE_HEIGHT;
    const variant = variantGeometry(variantId);
    const geometryScale =
      (geometry.profileArcLength ?? 1) /
      (geometry.nominalProfileArcLength ?? geometry.profileArcLength ?? 1);
    const finiteValues = Object.fromEntries(Object.entries(state.values).filter(([, value]) =>
      Number.isFinite(value),
    ));
    const trace = isUsableTrace(state.trace) ? state.trace : undefined;
    const known = ["pressure", "flowRate", "nozzlePosition", "speed"].filter(
      (key) => Number.isFinite(finiteValues[key]),
    );
    const summary = trace
      ? { ...finiteValues, ...summarizeTrace(trace) }
      : finiteValues;
    const status: ProcessPrediction["status"] = trace
      ? "trace-conditioned"
      : known.length
        ? "summary-only"
        : "unavailable";
    const samples = trace
      ? trace.samples.map((sample) => {
          const clean = { ...sample };
          for (const channel of CONTINUOUS_CHANNELS)
            if (!Number.isFinite(clean[channel])) delete clean[channel];
          return clean;
        })
      : idealizedTraceSamples(summary);
    const raw = accumulateDeposition(
      samples,
      summary,
      variant,
      geometryScale,
      width,
      height,
    );
    const scale = 1 / nominalNormalizer(variant, geometryScale, width, height);
    for (let i = 0; i < raw.length; i++) raw[i] *= scale;
    const channels: ProcessChannel[] = trace
      ? recordedChannels(trace)
      : (["pressure", "flowRate", "nozzlePosition"] as const).filter((key) =>
          Number.isFinite(state.values[key]),
        );
    if (!trace && Number.isFinite(state.values.speed))
      channels.push("rotationSpeed");
    return { deposition: raw, summary, status, channels, variant,
      unusableTrace: !!state.trace && !trace };
  }

  predict(
    variantId: string,
    state: ProcessState,
    geometry: GeometryContext = {},
  ): ProcessPrediction {
    const width = geometry.width ?? SURFACE_WIDTH,
      height = geometry.height ?? SURFACE_HEIGHT;
    const { deposition, summary, status, channels, variant, unusableTrace } = this.deposition(
      variantId,
      state,
      geometry,
    );
    const calibration = this.calibrationFor(variantId, height);
    const expected = new Float32Array(width * height);
    for (let y = 0; y < height; y++)
      for (let x = 0; x < width; x++) {
        const i = y * width + x;
        expected[i] = clamp(
          calibration.substrate[y] + calibration.gain * deposition[i],
        );
      }
    let extrapolation = 0;
    const outOfEnvelope = Object.entries(calibration.envelope)
      .filter(([key, [low, high]]) => {
        const value = summary[key];
        if (!Number.isFinite(value) || (value! >= low && value! <= high))
          return false;
        extrapolation +=
          Math.max(low - value!, value! - high) / Math.max(1e-6, high - low);
        return true;
      })
      .map(([key]) => key);
    const missingChannels = ALL_CHANNELS.filter(
      (channel) => !channels.includes(channel),
    );
    const availableFraction = channels.length / ALL_CHANNELS.length;
    let level =
      status === "unavailable"
        ? 0.05
        : outOfEnvelope.length
          ? 0.08 + 0.12 / (1 + extrapolation)
          : 0.4 + 0.5 * availableFraction;
    if (status !== "unavailable") {
      if (calibration.source === "prior") level *= 0.75;
      if (!variant.supported) level *= 0.6;
    }
    const supportLevel: ProcessPrediction["supportLevel"] =
      status === "unavailable"
        ? "unavailable"
        : !outOfEnvelope.length &&
            calibration.source !== "prior" &&
            variant.supported &&
            missingChannels.length === 0 &&
            status === "trace-conditioned"
          ? "supported"
          : "limited";
    const notes: string[] = [];
    if (unusableTrace)
      notes.push("Unusable trace: finite, ordered time/encoder samples are required; only available scalar summaries can condition the expectation.");
    if (status === "summary-only")
      notes.push(
        "No time-aligned trace: uniform revolution assumed; timing effects are not represented.",
      );
    if (status === "unavailable")
      notes.push(
        "No process information: recipe-nominal reference only; process-conditioned expectation unavailable.",
      );
    if (missingChannels.length && status === "trace-conditioned")
      notes.push(
        `Missing channels use recipe set-points: ${missingChannels.join(", ")}.`,
      );
    if (outOfEnvelope.length)
      notes.push(
        `Outside the calibration operating envelope: ${outOfEnvelope.join(", ")}.`,
      );
    if (!variant.supported)
      notes.push("Variant geometry not supported by this prototype model.");
    return {
      expected,
      deposition,
      support: new Float32Array(width * height).fill(level),
      illustrative: true,
      variantId,
      availableVariables: channels.filter((channel) => channel !== "sprayOn"),
      status,
      missingChannels,
      outOfEnvelope,
      supportLevel,
      modelVersion: this.version,
      calibrationVersion: calibration.version,
      notes,
    };
  }
}
