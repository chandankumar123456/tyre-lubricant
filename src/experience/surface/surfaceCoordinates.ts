export type SurfacePosition = [number, number, number];
// A meridional innerliner profile. v is normalized cumulative arc length, not image height.
function rawProfile(t: number): [number, number] {
  return [0.84 + 0.4 * Math.sin(Math.PI * t) ** 0.72, 0.34 - 0.68 * t];
}
const segments = 1024;
const cumulative = new Float64Array(segments + 1);
for (let i = 1; i <= segments; i++) {
  const previous = rawProfile((i - 1) / segments),
    current = rawProfile(i / segments);
  cumulative[i] =
    cumulative[i - 1] +
    Math.hypot(current[0] - previous[0], current[1] - previous[1]);
}
export const profileArcLength = cumulative[segments];
export function profileAt(v: number): [number, number] {
  const target = Math.max(0, Math.min(1, v)) * profileArcLength;
  let low = 0,
    high = segments;
  while (low < high) {
    const mid = (low + high) >>> 1;
    if (cumulative[mid] < target) low = mid + 1;
    else high = mid;
  }
  if (low === 0) return rawProfile(0);
  const fraction =
    (target - cumulative[low - 1]) / (cumulative[low] - cumulative[low - 1]);
  return rawProfile((low - 1 + fraction) / segments);
}
export function curvedPosition(u: number, v: number): SurfacePosition {
  const theta = (((u % 1) + 1) % 1) * Math.PI * 2;
  const [radius, y] = profileAt(v);
  return [radius * Math.cos(theta), y, radius * Math.sin(theta)];
}
export function flatPosition(u: number, v: number): SurfacePosition {
  return [(u - 0.5) * 6, (0.5 - v) * 2, 0];
}
export function morphPosition(
  u: number,
  v: number,
  progress: number,
): SurfacePosition {
  const curved = curvedPosition(u, v),
    flat = flatPosition(u, v),
    t = progressiveUnwrapWeight(u, progress);
  return curved.map(
    (value, axis) => value + (flat[axis] - value) * t,
  ) as SurfacePosition;
}

export function progressiveUnwrapWeight(u: number, progress: number): number {
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const front = Math.max(0, Math.min(1, (clampedProgress * 1.2 - u) / 0.2));
  return front * front * (3 - 2 * front);
}
