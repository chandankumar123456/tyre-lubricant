import type { SurfaceField } from "../surface/SurfaceField";
import type { ProcessState } from "./ProcessModel";
import { summarizeTrace } from "./ProcessTrace";
import {
  priorCalibration,
  type IllustrativeProcessModel,
  type ProcessCalibration,
} from "./PrototypeProcessModel";

export interface PairedRecord {
  surface: SurfaceField;
  processState: ProcessState;
}

/**
 * Offline calibration of the optical response from paired accepted records (illustrative).
 * Fits O(θ,s) ≈ substrate(s) + gain · D(θ,s) using valid, confident cells: the gain is a shared,
 * prior-regularized within-row regression slope; substrate(s) is the row intercept. The envelope is
 * the observed range of each process summary, widened by a margin. Only accepted records belong
 * here — never the tyre being evaluated.
 */
export function fitProcessCalibration(
  model: IllustrativeProcessModel,
  records: PairedRecord[],
  variantId: string,
  options: { regularization?: number; minConfidence?: number } = {},
): ProcessCalibration {
  const usable = records.filter(
    (record) => record.surface.metadata.variantId === variantId,
  );
  const height = usable[0]?.surface.height;
  if (!usable.length || height === undefined)
    return priorCalibration(variantId);
  const prior = priorCalibration(variantId, height);
  const width = usable[0].surface.width;
  const minConfidence = options.minConfidence ?? 0.5;
  const sumO = new Float64Array(height),
    sumD = new Float64Array(height),
    count = new Float64Array(height);
  const depositions = usable.map(
    (record) =>
      model.deposition(variantId, record.processState, { width, height })
        .deposition,
  );
  usable.forEach((record, r) => {
    const field = record.surface;
    for (let i = 0; i < field.observation.length; i++) {
      if (!field.validity[i] || field.confidence[i] < minConfidence) continue;
      const row = Math.floor(i / width);
      sumO[row] += field.observation[i];
      sumD[row] += depositions[r][i];
      count[row]++;
    }
  });
  let cross = 0,
    square = 0;
  usable.forEach((record, r) => {
    const field = record.surface;
    for (let i = 0; i < field.observation.length; i++) {
      if (!field.validity[i] || field.confidence[i] < minConfidence) continue;
      const row = Math.floor(i / width);
      const dO = field.observation[i] - sumO[row] / count[row],
        dD = depositions[r][i] - sumD[row] / count[row];
      cross += dO * dD;
      square += dD * dD;
    }
  });
  const lambda = options.regularization ?? 25;
  const gain = (cross + lambda * prior.gain) / (square + lambda);
  const substrate = new Float32Array(height);
  for (let row = 0; row < height; row++)
    substrate[row] = count[row]
      ? (sumO[row] - gain * sumD[row]) / count[row]
      : prior.substrate[row];
  const envelope: Record<string, [number, number]> = {};
  for (const record of usable) {
    const values = record.processState.trace
      ? summarizeTrace(record.processState.trace)
      : record.processState.values;
    for (const [key, value] of Object.entries(values)) {
      if (!Number.isFinite(value)) continue;
      const range = (envelope[key] ??= [value!, value!]);
      range[0] = Math.min(range[0], value!);
      range[1] = Math.max(range[1], value!);
    }
  }
  for (const range of Object.values(envelope)) {
    const margin = Math.max(0.015, (range[1] - range[0]) * 0.1);
    range[0] -= margin;
    range[1] += margin;
  }
  return {
    version: `paired-calibration/0.2 (${usable.length} records)`,
    variantId,
    substrate,
    gain,
    envelope,
    sampleCount: usable.length,
    source: "paired-accepted-records",
    illustrative: true,
  };
}
