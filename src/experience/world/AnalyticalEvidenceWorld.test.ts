import { describe, expect, it } from "vitest";
import {
  analyticalStateAt,
  historyActorPose,
  schematicGeometryAt,
} from "./AnalyticalEvidenceWorld";
import { mapX, mapY } from "./actors/ProcessSchematic";
import { dataDirector } from "../core/DataDirector";

describe("analytical evidence choreography", () => {
  it("starts with only the existing hero and matches chapter boundaries", () => {
    expect(analyticalStateAt(3, 0).population).toBe(0);
    expect(analyticalStateAt(3, 0).normal).toBe(0);
    expect(analyticalStateAt(3, 1)).toEqual(analyticalStateAt(4, 0));
    expect(analyticalStateAt(4, 1)).toEqual(analyticalStateAt(5, 0));
  });
  it("reconstructs forward and reverse seeks without accumulated state", () => {
    const forward = [0.1, 0.4, 0.7, 0.96].map((p) => analyticalStateAt(5, p));
    const reverse = [0.96, 0.7, 0.4, 0.1]
      .map((p) => analyticalStateAt(5, p))
      .reverse();
    expect(reverse).toEqual(forward);
    expect(analyticalStateAt(5, 0.99).historyCurved).toBe(1);
  });
  it("retains each record index while timeline positions become conveyor positions", () => {
    const flat = historyActorPose(2, 5, analyticalStateAt(5, 0.6), false);
    const curved = historyActorPose(2, 5, analyticalStateAt(5, 0.99), false);
    expect(flat.recordSlot).toBe(curved.recordSlot);
    expect(curved.unwrap).toBe(0);
    expect(curved.position[1]).toBeCloseTo(1.1);
    expect(curved.position[0]).toBeCloseTo(14);
    expect(analyticalStateAt(5, 1).nextArrival).toBe(1);
    expect(analyticalStateAt(5, 0.965).nextArrival).toBe(0);
    expect(curved.exteriorOpacity).toBeGreaterThan(0.9);
  });
});

it("stacks three recent mobile records above the hero and clears them for what-if", () => {
  const timeline = analyticalStateAt(5, 0.6);
  expect(historyActorPose(0, 5, timeline, true).opacity).toBe(0);
  expect(historyActorPose(2, 5, timeline, true).position.slice(0, 2)).toEqual([
    0, 2.6,
  ]);
  expect(historyActorPose(4, 5, timeline, true).position[1]).toBeCloseTo(1.4);
  expect(historyActorPose(4, 5, timeline, true).scaleX).toBeCloseTo(0.54);
  expect(historyActorPose(4, 5, timeline, true).scale).toBeCloseTo(0.24);
  expect(
    historyActorPose(0, 5, analyticalStateAt(5, 0.4), false).position[0],
  ).toBeCloseTo(-0.1);
  expect(analyticalStateAt(5, 0.78).history).toBe(0);
  expect(analyticalStateAt(5, 0.93).history).toBe(1);
});

it("projects the spray schematic into canonical map coordinates", () => {
  expect(mapY(0)).toBe(1);
  expect(mapY(1)).toBe(-1);
  expect(mapX(180)).toBe(0);
  expect(mapX(0)).toBe(-3);
  const recorded = schematicGeometryAt(4, 0.1);
  expect(recorded.aimS).toBeCloseTo(dataDirector.processSchematic().aimS);
  const low = schematicGeometryAt(5, 0),
    high = schematicGeometryAt(5, 1);
  expect(high.aimS).toBeGreaterThan(low.aimS);
  expect(low.sigmaS).toBeGreaterThan(0);
  expect(analyticalStateAt(4, 0.35).nozzle).toBe(1);
  expect(analyticalStateAt(4, 0.1).nozzle).toBe(0);
});

it("enlarges only the latest desktop records in the spatial comparison beat", () => {
  const spatial = analyticalStateAt(5, 0.55);
  expect(historyActorPose(0, 5, spatial, false).opacity).toBe(0);
  expect(historyActorPose(2, 5, spatial, false).position[0]).toBeCloseTo(-0.45);
  expect(historyActorPose(3, 5, spatial, false).position[0]).toBeCloseTo(0.95);
  expect(historyActorPose(4, 5, spatial, false).position[0]).toBeCloseTo(2.35);
  expect(historyActorPose(4, 5, spatial, false).scale).toBeCloseTo(0.2);
  expect(analyticalStateAt(5, 0.65).spatial).toBe(0);
});
