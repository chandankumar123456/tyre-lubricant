export interface AcquisitionView {
  id: string;
  timestamp: number;
  thetaStart: number;
  thetaEnd: number;
  illustrative: true;
  source: "generated-observation";
}
export interface SurfaceField {
  width: number;
  height: number;
  observation: Float32Array;
  confidence: Float32Array;
  validity: Uint8Array;
  normalMean?: Float32Array;
  normalVariation?: Float32Array;
  normalDeviation?: Float32Array;
  processExpected?: Float32Array;
  processDeviation?: Float32Array;
  residual?: Float32Array;
  acquisition: {
    views: AcquisitionView[];
    sampleViewIndex: Uint16Array;
    /** Angular windows the acquisition reported as not captured (observable metadata). */
    missedThetaRanges?: [number, number][];
  };
  metadata: {
    illustrative: true;
    variantId: string;
    thetaRange: [number, number];
    profileRange: [number, number];
    seed: string;
    source: "synthetic-prototype";
  };
}
export const SURFACE_WIDTH = 128;
export const SURFACE_HEIGHT = 48;
export function surfaceIndex(
  field: SurfaceField,
  u: number,
  v: number,
): number {
  const wrapped = ((u % 1) + 1) % 1;
  return (
    Math.round(Math.max(0, Math.min(1, v)) * (field.height - 1)) * field.width +
    Math.min(field.width - 1, Math.floor(wrapped * field.width))
  );
}
