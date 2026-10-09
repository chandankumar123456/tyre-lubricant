import { segment, lerp } from "../core/ExperienceClock";
export interface WorldState {
  tyreX: number;
  rotation: number;
  deployment: number;
  illumination: number;
  acquisition: number;
  unwrap: number;
  surface: number;
  physical: number;
  process: number;
  history: number;
  finale: number;
}
/** Ghosted physical reference held across the Scene 02 → 03 boundary before it recedes. */
export const PHYSICAL_GHOST = 0.16;
/** Station illumination at the Scene 02 → 03 boundary (point light on the receding station). */
const GHOST_ILLUMINATION = 0.45;
const base: WorldState = {
  tyreX: -4,
  rotation: 0,
  deployment: 0,
  illumination: 0,
  acquisition: 0,
  unwrap: 0,
  surface: 0,
  physical: 1,
  process: 0,
  history: 0,
  finale: 0,
};
export function worldAt(scene: number, p: number): WorldState {
  const s = { ...base };
  if (scene === 0) {
    s.tyreX = lerp(-4, 0, segment(p, 0.08, 0.87));
    return s;
  }
  s.tyreX = 0;
  if (scene === 1) {
    s.deployment = segment(p, 0.12, 0.3);
    s.illumination = segment(p, 0.34, 0.42);
    s.acquisition = segment(p, 0.46, 0.82);
    s.rotation = s.acquisition * Math.PI * 2;
    s.surface = segment(p, 0.75, 1);
    return s;
  }
  s.deployment = 1;
  s.illumination = 1;
  s.acquisition = 1;
  s.rotation = Math.PI * 2;
  s.surface = 1;
  if (scene === 2) {
    s.unwrap = segment(p, 0.57, 0.73);
    const recede = segment(p, 0.78, 1);
    // (1 - t)·a + t·b keeps the boundary value bit-exact with the Scene 03 start.
    s.physical =
      (1 - recede) * (1 - 0.65 * s.unwrap) + recede * PHYSICAL_GHOST;
    s.illumination = 1 - recede + recede * GHOST_ILLUMINATION;
    return s;
  }
  s.unwrap = 1;
  s.physical = 0;
  if (scene === 3) {
    const recede = segment(p, 0, 0.12);
    s.physical = PHYSICAL_GHOST * (1 - recede);
    // The light only reaches the physical station, which is fully receded by p = 0.12; it is
    // restored afterwards so Scene 03 ends on the shared Scene 04 pose.
    s.illumination =
      GHOST_ILLUMINATION * (1 - recede) + segment(p, 0.14, 0.2);
    return s;
  }
  if (scene === 4) {
    s.process = segment(p, 0.08, 0.25) * (1 - segment(p, 0.78, 1));
    return s;
  }
  s.history = segment(p, 0.02, 0.16) * (1 - segment(p, 0.92, 1));
  s.finale = segment(p, 0.92, 1);
  s.unwrap = 1 - s.finale;
  s.physical = s.finale;
  s.surface = 1 - segment(p, 0.965, 1);
  s.deployment = 1 - segment(p, 0.94, 0.965);
  s.illumination = 1 - segment(p, 0.965, 1);
  s.tyreX = 4 * segment(p, 0.965, 1);
  return s;
}
