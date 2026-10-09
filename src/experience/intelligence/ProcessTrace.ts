import type {
  ProcessChannel,
  ProcessState,
  ProcessTrace,
  ProcessTraceSample,
} from "./ProcessModel";

export const CONTINUOUS_CHANNELS = [
  "pressure",
  "flowRate",
  "nozzlePosition",
  "rotationSpeed",
] as const;
export const ALL_CHANNELS: ProcessChannel[] = [
  ...CONTINUOUS_CHANNELS,
  "sprayOn",
];

/** Time/encoder alignment must be recorded, finite and ordered before a trace can condition a map. */
export function isUsableTrace(trace: ProcessTrace | undefined): trace is ProcessTrace {
  return !!trace && trace.samples.length >= 2 && trace.samples.every((sample, index) =>
    Number.isFinite(sample.t) && Number.isFinite(sample.theta) && sample.t >= 0 &&
    (index === 0 || (sample.t > trace.samples[index - 1].t &&
      sample.theta >= trace.samples[index - 1].theta)),
  );
}

/** A declared channel is supported only when its values actually exist across the trace. */
export function recordedChannels(trace: ProcessTrace): ProcessChannel[] {
  return ALL_CHANNELS.filter((channel) => trace.channels.includes(channel) &&
    trace.samples.every((sample) => channel === "sprayOn"
      ? typeof sample.sprayOn === "boolean"
      : Number.isFinite(sample[channel])),
  );
}

/** Recipe set-points the model may assume when a channel is absent (documented fallback). */
export const RECIPE_NOMINAL = Object.freeze({
  pressure: 1,
  flowRate: 1,
  nozzlePosition: 0.5,
  speed: 1,
});

const isSpraying = (sample: ProcessTraceSample) => sample.sprayOn !== false;

/**
 * Operating-point summaries (median over the spraying portion, only for channels actually present).
 * Medians keep short transients — hesitations, valve overshoot — out of the summary; those events
 * remain in the trace itself, which is what the deposition model consumes.
 */
export function summarizeTrace(trace: ProcessTrace): ProcessState["values"] {
  const series: Record<string, number[]> = {};
  for (const sample of trace.samples) {
    if (!isSpraying(sample)) continue;
    for (const channel of CONTINUOUS_CHANNELS) {
      const value = sample[channel];
      if (!Number.isFinite(value)) continue;
      (series[channel === "rotationSpeed" ? "speed" : channel] ??= []).push(
        value!,
      );
    }
  }
  return Object.fromEntries(
    Object.entries(series).map(([key, values]) => {
      values.sort((a, b) => a - b);
      const middle = values.length >> 1;
      return [
        key,
        values.length % 2
          ? values[middle]
          : (values[middle - 1] + values[middle]) / 2,
      ];
    }),
  );
}

/** Valve-open window of a recorded trace in encoder degrees, or null when sprayOn is not recorded. */
export function sprayWindow(
  trace: ProcessTrace | undefined,
): { startTheta: number; endTheta: number; overlapDegrees: number } | null {
  if (!trace?.channels.includes("sprayOn")) return null;
  const on = trace.samples.filter((sample) => sample.sprayOn);
  if (!on.length) return null;
  const startTheta = on[0].theta,
    endTheta = on[on.length - 1].theta;
  return {
    startTheta: ((startTheta % 360) + 360) % 360,
    endTheta: ((endTheta % 360) + 360) % 360,
    overlapDegrees: Math.max(0, endTheta - startTheta - 360),
  };
}

/**
 * Fallback when no time-aligned trace exists: one uniform revolution with constant summary values
 * (or recipe set-points). Timing effects such as overlap, hesitation or valve transients cannot be
 * represented and are therefore absent from the expectation.
 */
export function idealizedTraceSamples(
  values: ProcessState["values"],
  samplesPerRevolution = 360,
): ProcessTraceSample[] {
  const seconds = 4 / (values.speed ?? RECIPE_NOMINAL.speed);
  return Array.from({ length: samplesPerRevolution }, (_, i) => ({
    t: (i / samplesPerRevolution) * seconds,
    theta: (i / samplesPerRevolution) * 360,
    pressure: values.pressure ?? RECIPE_NOMINAL.pressure,
    flowRate: values.flowRate ?? RECIPE_NOMINAL.flowRate,
    nozzlePosition: values.nozzlePosition ?? RECIPE_NOMINAL.nozzlePosition,
    rotationSpeed: values.speed ?? RECIPE_NOMINAL.speed,
    sprayOn: true,
  }));
}

export interface CandidateChanges {
  nozzlePosition?: number;
  /** Candidate mean flow; the recorded flow profile is scaled to this mean. */
  flowRate?: number;
  pressure?: number;
}

/** Candidate process state for what-if evaluation. The recorded state itself is never mutated. */
export function applyCandidate(
  state: ProcessState,
  changes: CandidateChanges,
): ProcessState {
  const values = { ...state.values, ...changes };
  if (!state.trace) return { timestamp: state.timestamp, values };
  const flowScale =
    changes.flowRate !== undefined && state.values.flowRate
      ? changes.flowRate / state.values.flowRate
      : 1;
  const pressureScale =
    changes.pressure !== undefined && state.values.pressure
      ? changes.pressure / state.values.pressure
      : 1;
  const channels = new Set(state.trace.channels);
  if (changes.nozzlePosition !== undefined) channels.add("nozzlePosition");
  if (changes.flowRate !== undefined) channels.add("flowRate");
  if (changes.pressure !== undefined) channels.add("pressure");
  return {
    timestamp: state.timestamp,
    values,
    trace: {
      ...state.trace,
      traceId: `${state.trace.traceId}-candidate`,
      channels: [...channels],
      samples: state.trace.samples.map((sample) => ({
        ...sample,
        ...(changes.nozzlePosition !== undefined && {
          nozzlePosition: changes.nozzlePosition,
        }),
        ...(changes.flowRate !== undefined && {
          flowRate: Number.isFinite(sample.flowRate) && state.values.flowRate
            ? sample.flowRate! * flowScale : changes.flowRate,
        }),
        ...(changes.pressure !== undefined && {
          pressure: Number.isFinite(sample.pressure) && state.values.pressure
            ? sample.pressure! * pressureScale : changes.pressure,
        }),
      })),
    },
  };
}
