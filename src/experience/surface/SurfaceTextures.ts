import {
  ClampToEdgeWrapping,
  DataTexture,
  LinearFilter,
  RGBAFormat,
  UnsignedByteType,
  NoColorSpace,
  RepeatWrapping,
} from "three";
import type { SurfaceField } from "./SurfaceField";
import type { ProcessPrediction } from "../intelligence/ProcessModel";
// Illustrative display ranges; they are not measured production limits.
export const ANALYSIS_RANGES = Object.freeze({
  variation: 0.05,
  normalDeviation: 24,
  residual: 0.6,
});
export function encodeUnit(value: number): number {
  return Math.round(
    Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0)) * 255,
  );
}
export function encodeSigned(value: number, range: number): number {
  if (!(range > 0)) throw new Error("A signed texture range must be positive.");
  return encodeUnit(0.5 + (Number.isFinite(value) ? value : 0) / (2 * range));
}
function textureFromBytes(field: SurfaceField, data: Uint8Array): DataTexture {
  const texture = new DataTexture(
    data,
    field.width,
    field.height,
    RGBAFormat,
    UnsignedByteType,
  );
  texture.colorSpace = NoColorSpace;
  texture.wrapS = RepeatWrapping;
  texture.wrapT = ClampToEdgeWrapping;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}
export function createSurfaceTexture(field: SurfaceField): DataTexture {
  const data = new Uint8Array(field.width * field.height * 4);
  for (let i = 0; i < field.observation.length; i++) {
    data[i * 4] = encodeUnit(field.observation[i]);
    data[i * 4 + 1] = encodeUnit(field.confidence[i]);
    data[i * 4 + 2] = field.validity[i] * 255;
    data[i * 4 + 3] = 255;
  }
  return textureFromBytes(field, data);
}
/** RGBA: normal mean, variation/.05, signed normal deviation/24, signed residual/.6.
 * Validity comes from the same UV in the hero O/C/M texture. Invalid signed channels are neutral.
 */
export function createAnalysisTexture(field: SurfaceField): DataTexture {
  if (
    !field.normalMean ||
    !field.normalVariation ||
    !field.normalDeviation ||
    !field.residual
  )
    throw new Error("Derive surface analysis before encoding.");
  const data = new Uint8Array(field.width * field.height * 4);
  for (let i = 0; i < field.observation.length; i++) {
    const valid = field.validity[i] === 1;
    data[i * 4] = valid ? encodeUnit(field.normalMean[i]) : 0;
    data[i * 4 + 1] = valid
      ? encodeUnit(field.normalVariation[i] / ANALYSIS_RANGES.variation)
      : 0;
    data[i * 4 + 2] = encodeSigned(
      valid ? field.normalDeviation[i] : 0,
      ANALYSIS_RANGES.normalDeviation,
    );
    data[i * 4 + 3] = encodeSigned(
      valid ? field.residual[i] : 0,
      ANALYSIS_RANGES.residual,
    );
  }
  return textureFromBytes(field, data);
}
export interface ExpectationScenario {
  prediction: ProcessPrediction;
  residual: Float32Array;
}
/** RGBA: original expected observation, original model support, scenario expected observation,
 * signed scenario residual/.6. Without scenario, B/A repeat original expectation/residual.
 */
export function createExpectationTexture(
  field: SurfaceField,
  prediction: ProcessPrediction,
  scenario?: ExpectationScenario,
): DataTexture {
  const count = field.width * field.height;
  const residual = scenario?.residual ?? field.residual;
  if (
    !residual ||
    prediction.expected.length !== count ||
    prediction.support.length !== count ||
    (scenario && scenario.prediction.expected.length !== count) ||
    residual.length !== count
  )
    throw new Error(
      "Expectation must share surface coordinates and derived residual.",
    );
  const data = new Uint8Array(count * 4);
  for (let i = 0; i < count; i++) {
    const valid = field.validity[i] === 1;
    data[i * 4] = valid ? encodeUnit(prediction.expected[i]) : 0;
    data[i * 4 + 1] = valid ? encodeUnit(prediction.support[i]) : 0;
    data[i * 4 + 2] = valid
      ? encodeUnit((scenario?.prediction ?? prediction).expected[i])
      : 0;
    data[i * 4 + 3] = encodeSigned(
      valid ? residual[i] : 0,
      ANALYSIS_RANGES.residual,
    );
  }
  return textureFromBytes(field, data);
}
