import { lerp, smooth, segment } from "../core/ExperienceClock";
export type ViewportProfile = "desktop" | "tablet" | "mobile";
export type CameraPose = {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
};
const boundaries: CameraPose[] = [
  { position: [8, 4.6, 9], target: [-4, 1, 0], fov: 26 },
  { position: [4.5, 4.6, 6.2], target: [0, 1.1, 0], fov: 40 },
  { position: [0.4, 2.7, 2.3], target: [0, 1.1, 0], fov: 40 },
  { position: [0, 3, 9.3], target: [0, 1.6, 0], fov: 36 },
  { position: [0, 3, 9.3], target: [0, 1.6, 0], fov: 36 },
  { position: [0, 3.2, 10], target: [0, 1.6, 0], fov: 38 },
  { position: [5.5, 4.8, 8], target: [1, 1.1, 0], fov: 42 },
];
export function cameraAt(
  sceneIndex: number,
  progress: number,
  profile: ViewportProfile = "desktop",
): CameraPose {
  const a = boundaries[sceneIndex],
    b = boundaries[sceneIndex + 1];
  let t = smooth(progress);
  if (sceneIndex === 0) t = smooth(Math.min(1, progress / 0.93));
  if (sceneIndex === 1) t = smooth(Math.max(0, (progress - 0.68) / 0.32));
  if (sceneIndex === 2) t = smooth(Math.min(1, progress / 0.73));
  if (sceneIndex === 5) t = smooth(Math.max(0, (progress - 0.92) / 0.08));
  const position = a.position.map((v, i) =>
    t === 0 ? v : t === 1 ? b.position[i] : lerp(v, b.position[i], t),
  ) as CameraPose["position"];
  const target = a.target.map((v, i) =>
    t === 0 ? v : t === 1 ? b.target[i] : lerp(v, b.target[i], t),
  ) as CameraPose["target"];
  if (profile === "mobile" || profile === "tablet") {
    const x =
      sceneIndex === 0
        ? -4 + 4 * segment(progress, 0.08, 0.87)
        : sceneIndex === 5
          ? 4 * segment(progress, 0.965, 1)
          : 0;
    const finale = sceneIndex === 5 ? segment(progress, 0.965, 1) : 0;
    const focusX = x * (1 - 0.5 * finale);
    position[0] = focusX + 0.8;
    target[0] = focusX;
    position[2] *= profile === "tablet" ? 1.5 : 1.4 + 0.95 * finale;
    position[1] += 2;
    target[1] += 0.8;
  }
  return { position, target, fov: lerp(a.fov, b.fov, t) };
}
