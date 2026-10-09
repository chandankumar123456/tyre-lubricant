import { describe, expect, it } from "vitest";
import { generateSurface, ANOMALY } from "./SurfaceGenerator";
import {
  curvedPosition,
  flatPosition,
  morphPosition,
  profileArcLength,
} from "./surfaceCoordinates";
import { fitNormalModel, compareNormal } from "../intelligence/NormalModel";
import { IllustrativeProcessModel } from "../intelligence/PrototypeProcessModel";
import { detectDrift } from "../intelligence/DriftModel";
import { createSurfaceTexture } from "./SurfaceTextures";
import { dataDirector } from "../core/DataDirector";

describe("canonical data lineage", () => {
  it("is deterministic and anchors one anomaly to theta 217°, lower bead", () => {
    const a = generateSurface({ seed: "hero", anomaly: true });
    const b = generateSurface({ seed: "hero", anomaly: true });
    expect(a.observation).toEqual(b.observation);
    const index =
      Math.round(ANOMALY.v * (a.height - 1)) * a.width +
      Math.round(ANOMALY.u * a.width);
    expect(a.observation[index]).toBeGreaterThan(0.8);
    expect(a.validity[index]).toBe(1);
    expect(a.metadata.illustrative).toBe(true);
    expect(a.metadata.thetaRange).toEqual([0, 360]);
    expect(a.metadata.profileRange).toEqual([0, 1]);
    expect(a.observation.length).toBe(128 * 48);
  });
  it("closes the seam, maps physical profile distance, and reverses the morph", () => {
    expect(curvedPosition(0, 0.78)).toEqual(curvedPosition(1, 0.78));
    expect(profileArcLength).toBeGreaterThan(0.68);
    expect(flatPosition(0, 0)).toEqual([-3, 1, 0]);
    expect(flatPosition(1, 1)).toEqual([3, -1, 0]);
    expect(morphPosition(ANOMALY.u, ANOMALY.v, 0)).toEqual(
      curvedPosition(ANOMALY.u, ANOMALY.v),
    );
    expect(morphPosition(ANOMALY.u, ANOMALY.v, 1)).toEqual(
      flatPosition(ANOMALY.u, ANOMALY.v),
    );
  });
  it("learns from valid population samples and responds to population changes", () => {
    const a = generateSurface({ seed: "normal" });
    const b = generateSurface({ seed: "normal" });
    b.observation.fill(0.9);
    const initial = fitNormalModel([a]);
    const changed = fitNormalModel([a, b]);
    expect(changed.mean[200]).not.toBe(initial.mean[200]);
    a.validity[0] = 0;
    expect(compareNormal(a, initial)[0]).toBe(0);
  });
  it("conditions process prediction on available variables", () => {
    const model = new IllustrativeProcessModel();
    const a = model.predict("variant-A", { timestamp: 0, values: {} });
    const b = model.predict("variant-A", {
      timestamp: 0,
      values: { nozzlePosition: 0.8 },
    });
    expect(a.expected).not.toEqual(b.expected);
    expect(b.illustrative).toBe(true);
  });
  it("rejects isolated events as persistent drift", () => {
    expect(detectDrift([0.05, 0.05, 0.8, 0.05, 0.05, 0.05]).persistent).toBe(
      false,
    );
    expect(detectDrift([0.05, 0.05, 0.2, 0.3, 0.4, 0.5]).persistent).toBe(true);
  });
  it("encodes O/C/M and retains the hero surface in history", () => {
    const field = dataDirector.hero.surface;
    const texture = createSurfaceTexture(field);
    const pixels = texture.image.data as Uint8Array;
    expect(pixels[0]).toBe(Math.round(field.observation[0] * 255));
    expect(pixels[1]).toBe(Math.round(field.confidence[0] * 255));
    expect(pixels[2]).toBe(field.validity[0] * 255);
    expect(dataDirector.history.records.at(-1)?.surface).toBe(field);
    texture.dispose();
  });
});

describe("history, explanation, and evidence contracts", () => {
  it("derives every history layer, retains local drift, and masks invalid evidence", () => {
    const history = dataDirector.history.records;
    for (const record of history) {
      expect(record.surface.normalDeviation?.length).toBe(6144);
      expect(record.surface.processExpected?.length).toBe(6144);
      expect(record.surface.residual?.length).toBe(6144);
      const invalid = record.surface.validity.findIndex((value) => value === 0);
      expect(record.surface.residual?.[invalid]).toBe(0);
    }
    expect(
      dataDirector.characterizeSignature(history[11].surface).centroid.u,
    ).toBeCloseTo(ANOMALY.u, 1);
    expect(
      dataDirector.characterizeSignature(history[11].surface).centroid.v,
    ).toBeCloseTo(ANOMALY.v, 1);
    expect(history[3].deviation).toBeGreaterThan(history[4].deviation);
    expect(dataDirector.aggregateHistory("short").records.length).toBeLessThan(
      dataDirector.aggregateHistory("long").records.length,
    );
  });
  it("supports reversible what-if without changing observed evidence", () => {
    const original = dataDirector.hero.surface.observation.slice();
    const initial = dataDirector.whatIf({ nozzlePosition: 0.5 });
    const shifted = dataDirector.whatIf({ nozzlePosition: 0.95 });
    expect(initial.prediction.expected).not.toEqual(
      shifted.prediction.expected,
    );
    expect(
      dataDirector.whatIf({ nozzlePosition: 0.5 }).prediction.expected,
    ).toEqual(initial.prediction.expected);
    expect(shifted.residual.some((value) => value > 0.1)).toBe(true);
    expect(dataDirector.hero.surface.observation).toEqual(original);
    const model = new IllustrativeProcessModel();
    expect(
      model.predict("variant-A", { timestamp: 0, values: {} }).support[0],
    ).toBeLessThan(shifted.prediction.support[0]);
    expect(
      model.predict("variant-A", { timestamp: 0, values: {} }).expected,
    ).not.toEqual(
      model.predict("variant-B", { timestamp: 0, values: {} }).expected,
    );
  });
  it("maps samples to explicit synthetic acquisition evidence", () => {
    const trace = dataDirector.traceSample(ANOMALY.u, ANOMALY.v);
    expect(trace.illustrative).toBe(true);
    expect(trace.viewId).toContain("synthetic");
    expect(trace.timestamp).toBeGreaterThan(0);
    expect(trace.sampleIndex).toBeGreaterThan(0);
    expect(trace.observation).toBe(
      dataDirector.hero.surface.observation[trace.sampleIndex],
    );
  });
});

describe("model support and physical conditioning", () => {
  it("does not infer normality where the population has no valid evidence", () => {
    const accepted = generateSurface({ seed: "support" });
    const current = generateSurface({ seed: "current", anomaly: true });
    accepted.validity.fill(0);
    const model = fitNormalModel([accepted]);
    expect(model.support.every((value) => value === 0)).toBe(true);
    expect(compareNormal(current, model).every((value) => value === 0)).toBe(
      true,
    );
  });
  it("uses geometry context and reduces support for extrapolation", () => {
    const model = new IllustrativeProcessModel();
    const state = {
      timestamp: 0,
      values: { pressure: 1, nozzlePosition: 0.6 },
    };
    const standard = model.predict("variant-A", state);
    const larger = model.predict("variant-A", state, {
      profileArcLength: 1.2,
      nominalProfileArcLength: 1,
    });
    expect(larger.expected).not.toEqual(standard.expected);
    const unsupported = model.predict("variant-A", {
      timestamp: 0,
      values: { pressure: 3 },
    });
    expect(unsupported.support[0]).toBeLessThan(standard.support[0]);
  });
  it("aggregates persistent excess at the same spatial location without spreading it", () => {
    const result = dataDirector.aggregateHistory("short");
    const field = dataDirector.hero.surface;
    const center =
      Math.round(ANOMALY.v * (field.height - 1)) * field.width +
      Math.round(ANOMALY.u * field.width);
    expect(result.meanDeviation[center]).toBeGreaterThan(5);
    expect(Math.abs(result.meanDeviation[10 * field.width + 10])).toBeLessThan(
      1,
    );
    expect(result.drift.persistent).toBe(true);
  });
});

describe("progressive unroll correspondence", () => {
  it("moves the opening front while keeping UV sample identity at each phase", async () => {
    const { progressiveUnwrapWeight } = await import("./surfaceCoordinates");
    const { surfaceIndex } = await import("./SurfaceField");
    expect(progressiveUnwrapWeight(0.5, 0.5)).toBeCloseTo(0.5);
    expect(progressiveUnwrapWeight(0.1, 0.5)).toBe(1);
    expect(progressiveUnwrapWeight(0.9, 0.5)).toBe(0);
    const field = dataDirector.hero.surface;
    const index = surfaceIndex(field, ANOMALY.u, ANOMALY.v);
    for (const phase of [0, 0.25, 0.5, 0.75, 1]) {
      morphPosition(ANOMALY.u, ANOMALY.v, phase);
      expect(surfaceIndex(field, ANOMALY.u, ANOMALY.v)).toBe(index);
    }
    expect(surfaceIndex(field, 0, 0.78)).toBe(surfaceIndex(field, 1, 0.78));
  });
});

it("fingerprints immutable observed bytes while scenarios alter their prediction", () => {
  const before = dataDirector.observationFingerprint();
  const a = dataDirector.whatIf({ nozzlePosition: 0.5 });
  const b = dataDirector.whatIf({ nozzlePosition: 0.9 });
  expect(a.prediction.expected).not.toEqual(b.prediction.expected);
  expect(dataDirector.observationFingerprint()).toBe(before);
  expect(before).toMatch(/^[0-9a-f]{8}$/);
});

it("computes fingerprints from every observed evidence layer rather than record labels", () => {
  const hero = dataDirector.hero.surface;
  const copy = {
    ...hero,
    observation: hero.observation.slice(),
    confidence: hero.confidence.slice(),
    validity: hero.validity.slice(),
  };
  const baseline = dataDirector.observationFingerprint(copy);
  expect(baseline).toBe(dataDirector.observationFingerprint());
  copy.observation[0] += 0.01;
  expect(dataDirector.observationFingerprint(copy)).not.toBe(baseline);
  copy.observation.set(hero.observation);
  copy.confidence[0] -= 0.01;
  expect(dataDirector.observationFingerprint(copy)).not.toBe(baseline);
  copy.confidence.set(hero.confidence);
  copy.validity[0] = copy.validity[0] ? 0 : 1;
  expect(dataDirector.observationFingerprint(copy)).not.toBe(baseline);
});
