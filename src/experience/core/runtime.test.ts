import { describe, it, expect } from "vitest";
import { resolveJourney, sceneRange } from "./JourneyController";
import { ExperienceClock } from "./ExperienceClock";
import { cameraAt } from "../camera/CameraDirector";
import { worldAt, PHYSICAL_GHOST } from "../world/WorldDirector";
import { scenes } from "./SceneRegistry";
describe("reversible journey contract", () => {
  it("clamps progress and resolves endpoints", () => {
    expect(resolveJourney(-2).sceneIndex).toBe(0);
    expect(resolveJourney(2).sceneIndex).toBe(5);
    expect(resolveJourney(1).localProgress).toBe(1);
  });
  it("shares camera and world poses at every boundary", () => {
    for (let i = 0; i < 5; i++) {
      for (const profile of ["desktop", "tablet", "mobile"] as const) {
        expect(cameraAt(i, 1, profile)).toEqual(cameraAt(i + 1, 0, profile));
      }
      expect(worldAt(i, 1)).toEqual(worldAt(i + 1, 0));
    }
  });
  it("holds a receding ghosted station across the Scene 02 → 03 boundary", () => {
    expect(worldAt(2, 1).physical).toBe(PHYSICAL_GHOST);
    expect(worldAt(2, 1).physical).toBeGreaterThan(0.1);
    expect(worldAt(3, 0.06).physical).toBeGreaterThan(0);
    expect(worldAt(3, 0.06).physical).toBeLessThan(PHYSICAL_GHOST);
    expect(worldAt(3, 0.12).physical).toBe(0);
    expect(worldAt(3, 0.06).illumination).toBeLessThan(worldAt(2, 0.9).illumination);
    expect(worldAt(2, 0.75).physical).toBeCloseTo(1 - 0.65 * worldAt(2, 0.75).unwrap);
  });
  it("reverses without remembered completion", () => {
    const a = worldAt(1, 0.3);
    worldAt(5, 1);
    expect(worldAt(1, 0.3)).toEqual(a);
    expect(sceneRange(2)[0]).toBeGreaterThan(sceneRange(1)[0]);
    expect(scenes).toHaveLength(6);
  });
  it("clock converges both directions and caps long frame deltas", () => {
    const c = new ExperienceClock();
    c.setTarget(1);
    for (let i = 0; i < 180; i++) c.tick(1 / 60);
    expect(c.progress).toBeCloseTo(1, 4);
    c.setTarget(0.2);
    for (let i = 0; i < 180; i++) c.tick(1 / 60);
    expect(c.progress).toBeCloseTo(0.2, 4);
    expect(c.direction).toBe(-1);
    c.tick(9);
    expect(c.delta).toBeLessThanOrEqual(0.05);
  });
});
