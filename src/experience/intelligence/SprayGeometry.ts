import { profileAt, profileArcLength } from "../surface/surfaceCoordinates";

/**
 * IDEALIZED SPRAY GEOMETRY (illustrative model assumptions, not validated tyre-process physics).
 *
 * - The nozzle sits on the tyre axis at radius `nozzleRadius` and sprays radially outward.
 * - `nozzlePosition` ∈ [0,1] is the nozzle height between the upper (0) and lower (1) bead planes.
 *   The spray axis meets the innerliner where the curved profile reaches that height, so the aim
 *   point is a profile arc-length coordinate `s`, never a screen or height coordinate.
 * - Footprint size grows with nozzle-to-surface distance and the cone half-angle; higher pressure
 *   widens the cone. Oblique incidence elongates the footprint along the profile.
 */
export interface VariantGeometry {
  variantId: string;
  /** Uniform scale of the illustrative profile (variant-B is a larger synthetic section). */
  profileScale: number;
  nozzleRadius: number;
  nominalHalfAngleDegrees: number;
  supported: boolean;
}

const VARIANTS: Record<string, VariantGeometry> = {
  "variant-A": {
    variantId: "variant-A",
    profileScale: 1,
    nozzleRadius: 0.22,
    nominalHalfAngleDegrees: 22,
    supported: true,
  },
  "variant-B": {
    variantId: "variant-B",
    profileScale: 1.08,
    nozzleRadius: 0.22,
    nominalHalfAngleDegrees: 22,
    supported: true,
  },
};

export function variantGeometry(variantId: string): VariantGeometry {
  return (
    VARIANTS[variantId] ?? {
      ...VARIANTS["variant-A"],
      variantId,
      supported: false,
    }
  );
}

const PROFILE_TOP = profileAt(0)[1];
const PROFILE_BOTTOM = profileAt(1)[1];

/** Profile coordinate s where a radial spray at the given nozzle height meets the innerliner. */
export function nozzleAimS(nozzlePosition: number): number {
  const p = Math.max(0, Math.min(1, nozzlePosition));
  const height = PROFILE_TOP + (PROFILE_BOTTOM - PROFILE_TOP) * p;
  let low = 0,
    high = 1;
  // Profile height decreases monotonically from the upper to the lower bead.
  for (let i = 0; i < 40; i++) {
    const mid = (low + high) / 2;
    if (profileAt(mid)[1] > height) low = mid;
    else high = mid;
  }
  return (low + high) / 2;
}

export interface SprayFootprint {
  /** Gaussian standard deviation along normalized s. */
  sigmaS: number;
  /** Gaussian standard deviation around the circumference, in degrees. */
  sigmaThetaDegrees: number;
  /** Nozzle-to-surface distance in illustrative profile units. */
  distance: number;
  /** Relative areal density factor (1 at the nominal mid-profile footprint). */
  densityFactor: number;
}

const NOMINAL_SIGMA_PHYSICAL = (() => {
  const [radius] = profileAt(0.5);
  return (
    ((radius - VARIANTS["variant-A"].nozzleRadius) *
      Math.tan((VARIANTS["variant-A"].nominalHalfAngleDegrees * Math.PI) / 180)) /
    2
  );
})();

export function sprayFootprint(
  aimS: number,
  pressure: number,
  geometry: VariantGeometry,
  geometryScale = 1,
): SprayFootprint {
  const s = Math.max(0.001, Math.min(0.999, aimS));
  const [radiusUnit] = profileAt(s);
  const radius = radiusUnit * geometry.profileScale;
  const distance = Math.max(0.05, radius - geometry.nozzleRadius);
  const halfAngle =
    ((geometry.nominalHalfAngleDegrees * Math.PI) / 180) *
    Math.sqrt(Math.max(0.2, pressure));
  const sigmaPhysical = (distance * Math.tan(halfAngle)) / 2;
  const [x0, y0] = profileAt(s - 0.001),
    [x1, y1] = profileAt(s + 0.001);
  const tangent = Math.hypot(x1 - x0, y1 - y0) || 1;
  const cosIncidence = Math.abs(y1 - y0) / tangent;
  const elongation = 1 / Math.max(0.35, cosIncidence);
  const arcLength = profileArcLength * geometry.profileScale * geometryScale;
  const sigmaS = (sigmaPhysical * elongation) / arcLength;
  const sigmaThetaDegrees = ((sigmaPhysical / radius) * 180) / Math.PI;
  return {
    sigmaS,
    sigmaThetaDegrees,
    distance,
    densityFactor: (NOMINAL_SIGMA_PHYSICAL / sigmaPhysical) ** 2 / elongation,
  };
}
