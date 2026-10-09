/**
 * Product evidence (Idea 1 → decision input): locate and describe significant deviation regions
 * from the population normal. Works only from the observed surface and the fitted fingerprint.
 * Signature matching rules are illustrative heuristics; type and severity are kept separate.
 */
import type { SurfaceField } from "../surface/SurfaceField";
import { compareNormal, type NormalFingerprint } from "./NormalModel";
import { prototypeDecisionPolicy, type DecisionPolicy } from "./DecisionPolicy";

export type KnownSignature =
  | "local-excess-material"
  | "lower-bead-accumulation"
  | "multiple-line-concentration"
  | "single-point-concentration"
  | "insufficient-or-missing-spray";

export const SIGNATURE_LABELS: Record<KnownSignature | "unknown", string> = {
  "local-excess-material": "Local excess material",
  "lower-bead-accumulation": "Lower-bead accumulation",
  "multiple-line-concentration": "Multiple-line concentration",
  "single-point-concentration": "Single-point concentration",
  "insufficient-or-missing-spray": "Insufficient or missing spray",
  unknown: "Unknown anomaly",
};

export interface DefectCandidate {
  polarity: "excess" | "deficit";
  signature: KnownSignature | "unknown";
  known: boolean;
  matchBasis: string;
  centroid: { u: number; v: number; thetaDegrees: number; s: number };
  extent: {
    cellCount: number;
    areaFraction: number;
    thetaSpanDegrees: number;
    sSpan: number;
  };
  /** Largest |O − μ| in normalized response units within the region. */
  peakExcess: number;
  /** Largest |z| (standardized normal deviation) within the region. */
  peakZ: number;
  regionCount: number;
  /** Share of cells around the region that are low confidence or invalid. */
  lowConfidenceShare: number;
  cells: number[];
  illustrative: true;
}

interface Region {
  sign: 1 | -1;
  cells: number[];
  mass: number;
}

function regions(mask: Int8Array, width: number, height: number): Region[] {
  const seen = new Uint8Array(mask.length);
  const found: Region[] = [];
  for (let start = 0; start < mask.length; start++) {
    if (!mask[start] || seen[start]) continue;
    const sign = mask[start] as 1 | -1;
    const stack = [start],
      cells: number[] = [];
    seen[start] = 1;
    while (stack.length) {
      const i = stack.pop()!;
      cells.push(i);
      const x = i % width,
        y = Math.floor(i / width);
      const neighbours = [
        y * width + ((x + 1) % width),
        y * width + ((x - 1 + width) % width),
        y > 0 ? i - width : -1,
        y < height - 1 ? i + width : -1,
      ];
      for (const n of neighbours)
        if (n >= 0 && !seen[n] && mask[n] === sign) {
          seen[n] = 1;
          stack.push(n);
        }
    }
    found.push({ sign, cells, mass: 0 });
  }
  return found;
}

export function characterizeDeviation(
  field: SurfaceField,
  normal: NormalFingerprint,
  policy: DecisionPolicy = prototypeDecisionPolicy,
): DefectCandidate | null {
  if (field.metadata.variantId !== normal.variantId) return null;
  const { width, height } = field;
  const z = compareNormal(field, normal);
  const excess = new Float32Array(field.observation.length);
  const mask = new Int8Array(field.observation.length);
  const detection = policy.detection;
  let validCells = 0;
  for (let i = 0; i < mask.length; i++) {
    if (!field.validity[i] || !normal.support[i]) continue;
    validCells++;
    if (field.confidence[i] < detection.minConfidence) continue;
    excess[i] = field.observation[i] - normal.mean[i];
    if (z[i] >= detection.cellZ && excess[i] >= detection.minExcess)
      mask[i] = 1;
    else if (z[i] <= -detection.cellZ && excess[i] <= -detection.minExcess)
      mask[i] = -1;
  }
  const significant = regions(mask, width, height).filter(
    (region) => region.cells.length >= detection.minCells,
  );
  if (!significant.length) return null;
  for (const region of significant)
    region.mass = region.cells.reduce((sum, i) => sum + Math.abs(excess[i]), 0);
  const positive = significant.filter((region) => region.sign > 0),
    negative = significant.filter((region) => region.sign < 0);
  const mass = (list: Region[]) => list.reduce((sum, r) => sum + r.mass, 0);
  const dominant = mass(positive) >= mass(negative) ? positive : negative;
  dominant.sort((a, b) => b.mass - a.mass);
  const primary = dominant[0];

  let weight = 0,
    cos = 0,
    sin = 0,
    weightedS = 0,
    peakExcess = 0,
    peakZ = 0;
  for (const i of primary.cells) {
    const w = Math.abs(excess[i]);
    const u = (i % width) / width,
      v = Math.floor(i / width) / (height - 1);
    weight += w;
    cos += Math.cos(u * Math.PI * 2) * w;
    sin += Math.sin(u * Math.PI * 2) * w;
    weightedS += v * w;
    peakExcess = Math.max(peakExcess, w);
    peakZ = Math.max(peakZ, Math.abs(z[i]));
  }
  const centroidU = ((Math.atan2(sin, cos) / (Math.PI * 2)) % 1 + 1) % 1;
  const centroidS = weightedS / weight;
  let minT = Infinity,
    maxT = -Infinity,
    minS = Infinity,
    maxS = -Infinity,
    covTS = 0,
    varT = 0,
    varS = 0;
  for (const i of primary.cells) {
    const w = Math.abs(excess[i]);
    let du = (i % width) / width - centroidU;
    du -= Math.round(du);
    const ds = Math.floor(i / width) / (height - 1) - centroidS;
    minT = Math.min(minT, du);
    maxT = Math.max(maxT, du);
    minS = Math.min(minS, ds);
    maxS = Math.max(maxS, ds);
    covTS += w * du * ds;
    varT += w * du * du;
    varS += w * ds * ds;
  }
  const thetaSpan = maxT - minT + 1 / width,
    sSpan = maxS - minS + 1 / (height - 1);
  const correlation =
    varT > 0 && varS > 0 ? covTS / Math.sqrt(varT * varS) : 0;

  // Evidence quality around the region (bounding window, one cell margin).
  let around = 0,
    weak = 0;
  const x0 = Math.floor((centroidU + minT) * width) - 1,
    x1 = Math.ceil((centroidU + maxT) * width) + 1;
  const y0 = Math.max(0, Math.floor((centroidS + minS) * (height - 1)) - 1),
    y1 = Math.min(height - 1, Math.ceil((centroidS + maxS) * (height - 1)) + 1);
  for (let y = y0; y <= y1; y++)
    for (let x = x0; x <= x1; x++) {
      const i = y * width + (((x % width) + width) % width);
      around++;
      if (
        !field.validity[i] ||
        field.confidence[i] < policy.measurement.lowConfidence
      )
        weak++;
    }

  const rules = policy.signature;
  const lineLike = (region: Region) => {
    let lo = Infinity,
      hi = -Infinity,
      top = Infinity,
      bottom = -Infinity;
    for (const i of region.cells) {
      let du = (i % width) / width - centroidU;
      du -= Math.round(du);
      lo = Math.min(lo, du);
      hi = Math.max(hi, du);
      const v = Math.floor(i / width) / (height - 1);
      top = Math.min(top, v);
      bottom = Math.max(bottom, v);
    }
    return (hi - lo + 1 / width) / (bottom - top + 1 / (height - 1)) >= rules.lineAspect;
  };
  let signature: KnownSignature | "unknown";
  let matchBasis: string;
  if (primary.sign < 0) {
    signature = "insufficient-or-missing-spray";
    matchBasis = "Region substantially below the local expected response.";
  } else if (dominant.length >= 2 && dominant.filter(lineLike).length >= 2) {
    signature = "multiple-line-concentration";
    matchBasis = "Several separated, circumferentially elongated excess regions.";
  } else if (
    Math.abs(correlation) >= rules.obliqueCorrelation &&
    primary.cells.length > rules.compactCells
  ) {
    signature = "unknown";
    matchBasis =
      "Oblique excess region whose shape matches none of the five defined signatures.";
  } else if (centroidS >= rules.lowerBeadS) {
    signature = "lower-bead-accumulation";
    matchBasis = `Excess concentrated toward the lower bead (s/L ≥ ${rules.lowerBeadS}).`;
  } else if (primary.cells.length <= rules.compactCells) {
    signature = "single-point-concentration";
    matchBasis = "Compact, isolated high-deviation region.";
  } else {
    signature = "local-excess-material";
    matchBasis = "Localized region above the expected response range.";
  }
  return {
    polarity: primary.sign > 0 ? "excess" : "deficit",
    signature,
    known: signature !== "unknown",
    matchBasis,
    centroid: {
      u: centroidU,
      v: centroidS,
      thetaDegrees: centroidU * 360,
      s: centroidS,
    },
    extent: {
      cellCount: primary.cells.length,
      areaFraction: primary.cells.length / Math.max(1, validCells),
      thetaSpanDegrees: thetaSpan * 360,
      sSpan,
    },
    peakExcess,
    peakZ,
    regionCount: dominant.length,
    lowConfidenceShare: around ? weak / around : 0,
    cells: primary.cells,
    illustrative: true,
  };
}
