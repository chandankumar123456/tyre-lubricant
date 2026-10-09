import { Matrix4 } from "three";
/** Homogeneous scaling keeps the discovery plane fixed while perspective becomes orthographic. */
export function blendProjection(
  perspective: Matrix4,
  distance: number,
  fov: number,
  aspect: number,
  near: number,
  far: number,
  blend: number,
  out = new Matrix4(),
  ortho = new Matrix4(),
) {
  const t = Math.max(0, Math.min(1, blend));
  if (t === 0) return out.copy(perspective);
  const d = Math.max(0.01, distance),
    half = d * Math.tan((fov * Math.PI) / 360);
  ortho.makeOrthographic(-half * aspect, half * aspect, half, -half, near, far);
  for (let i = 0; i < 16; i++)
    out.elements[i] =
      (perspective.elements[i] / d) * (1 - t) + ortho.elements[i] * t;
  return out;
}
