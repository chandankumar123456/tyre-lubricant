import type { SurfaceField } from "../surface/SurfaceField";
export interface NormalFingerprint {
  mean: Float32Array;
  variation: Float32Array;
  support: Uint16Array;
  variantId: string;
  illustrative: true;
}
export function fitNormalModel(population: SurfaceField[]): NormalFingerprint {
  if (!population.length)
    throw new Error(
      "A normal model requires an acceptable illustrative population.",
    );
  const first = population[0],
    count = first.observation.length;
  if (
    population.some(
      (field) =>
        field.metadata.variantId !== first.metadata.variantId ||
        field.width !== first.width ||
        field.height !== first.height,
    )
  )
    throw new Error("Normal population must share variant and coordinates.");
  const mean = new Float32Array(count),
    variation = new Float32Array(count),
    support = new Uint16Array(count);
  for (let i = 0; i < count; i++) {
    let total = 0;
    for (const field of population)
      if (field.validity[i]) {
        total += field.observation[i];
        support[i]++;
      }
    mean[i] = support[i] ? total / support[i] : 0;
    let square = 0;
    for (const field of population)
      if (field.validity[i]) square += (field.observation[i] - mean[i]) ** 2;
    variation[i] = support[i] ? Math.sqrt(square / support[i]) : 0;
  }
  return {
    mean,
    variation,
    support,
    variantId: first.metadata.variantId,
    illustrative: true,
  };
}
export function compareNormal(
  field: SurfaceField,
  model: NormalFingerprint,
): Float32Array {
  if (field.metadata.variantId !== model.variantId)
    throw new Error("Variant mismatch.");
  return Float32Array.from(field.observation, (value, i) =>
    field.validity[i] && model.support[i]
      ? (value - model.mean[i]) / Math.max(0.025, model.variation[i])
      : 0,
  );
}
export class NormalModel {
  fit = fitNormalModel;
  compare = compareNormal;
}
