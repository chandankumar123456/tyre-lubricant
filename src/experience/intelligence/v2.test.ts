import { describe, expect, it } from "vitest";
import { dataDirector } from "../core/DataDirector";
import { IllustrativeProcessModel } from "./PrototypeProcessModel";
import { decideTyre } from "./DecisionEngine";
import { nozzleAimS } from "./SprayGeometry";
import type { ProcessTrace, ProcessTraceSample } from "./ProcessModel";
import { generateInspection } from "../surface/SurfaceGenerator";
import {
  heroScenario,
  narrativeReference,
} from "../scenario/SyntheticInspectionScenario";
import { surfaceIndex } from "../surface/SurfaceField";

const sources = import.meta.glob<string>("/src/**/*.{ts,tsx}", {
  query: "?raw",
  import: "default",
  eager: true,
});
function resolveImport(from: string, spec: string) {
  const parts = from.split("/").slice(0, -1);
  for (const part of spec.split("/"))
    if (part === "..") parts.pop();
    else if (part !== ".") parts.push(part);
  const base = parts.join("/");
  return [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`].find(
    (candidate) => candidate in sources,
  );
}
const W = 128,
  H = 48;

function trace(samples: ProcessTraceSample[], channels?: ProcessTrace["channels"]): ProcessTrace {
  return {
    traceId: "test",
    tyreId: "test",
    stationId: "test",
    clock: "intra-tyre",
    startTimestamp: 0,
    samples,
    channels: channels ?? ["pressure", "flowRate", "nozzlePosition", "rotationSpeed", "sprayOn"],
    illustrative: true,
    source: "synthetic-telemetry",
  };
}
function arc(start: number, span: number, extra: Partial<ProcessTraceSample> = {}) {
  return Array.from({ length: span + 1 }, (_, i) => ({
    t: i / 90,
    theta: start + i,
    pressure: 1,
    flowRate: 1,
    nozzlePosition: 0.5,
    rotationSpeed: 1,
    sprayOn: true,
    ...extra,
  }));
}
function centroid(field: Float32Array) {
  let total = 0,
    s = 0,
    cos = 0,
    sin = 0;
  field.forEach((value, i) => {
    const x = i % W,
      y = Math.floor(i / W);
    total += value;
    s += value * (y / (H - 1));
    cos += value * Math.cos((x / W) * Math.PI * 2);
    sin += value * Math.sin((x / W) * Math.PI * 2);
  });
  return {
    total,
    s: s / total,
    theta: ((Math.atan2(sin, cos) * 180) / Math.PI + 360) % 360,
  };
}

describe("data boundary", () => {
  it("keeps synthetic ground truth out of every inference module", () => {
    const models = [
      "NormalModel",
      "PrototypeProcessModel",
      "ProcessCalibration",
      "ProcessTrace",
      "SprayGeometry",
      "DecisionEngine",
      "DecisionPolicy",
      "DefectCharacterization",
      "ProcessHealth",
      "DriftModel",
      "AssociationModel",
    ];
    const forbidden = /scenario[\\/]|SurfaceGenerator|SyntheticPlant|HistoryGenerator|providers[\\/]/;
    const seen = new Set<string>();
    const visit = (file: string, chain: string[]) => {
      if (seen.has(file)) return;
      seen.add(file);
      for (const [, spec] of sources[file].matchAll(/from\s+["'](\.[^"']+)["']/g)) {
        const target = resolveImport(file, spec);
        expect(spec, [...chain, spec].join(" → ")).not.toMatch(forbidden);
        if (!target) continue;
        expect(target, [...chain, target].join(" → ")).not.toMatch(forbidden);
        visit(target, [...chain, target]);
      }
    };
    for (const name of models) {
      const file = `/src/experience/intelligence/${name}.ts`;
      expect(sources[file], file).toBeTypeOf("string");
      visit(file, [name]);
    }
    expect(seen.size).toBeGreaterThan(models.length);
  });
});

describe("Idea 2 — idealized spray deposition", () => {
  const model = new IllustrativeProcessModel();
  const ctx = { width: W, height: H };
  it("moves the deposition centroid with nozzle position", () => {
    const low = model.deposition("variant-A", { timestamp: 0, values: {}, trace: trace(arc(0, 360, { nozzlePosition: 0.44 })) }, ctx);
    const high = model.deposition("variant-A", { timestamp: 0, values: {}, trace: trace(arc(0, 360, { nozzlePosition: 0.6 })) }, ctx);
    const direction = Math.sign(nozzleAimS(0.6) - nozzleAimS(0.44));
    expect(direction).not.toBe(0);
    expect(Math.sign(centroid(high.deposition).s - centroid(low.deposition).s)).toBe(direction);
  });
  it("increases integrated response with flow", () => {
    const nominal = model.deposition("variant-A", { timestamp: 0, values: {}, trace: trace(arc(0, 360)) }, ctx);
    const more = model.deposition("variant-A", { timestamp: 0, values: {}, trace: trace(arc(0, 360, { flowRate: 1.1 })) }, ctx);
    expect(centroid(more.deposition).total / centroid(nominal.deposition).total).toBeCloseTo(1.1, 2);
  });
  it("shifts the affected θ with spray start timing", () => {
    const early = centroid(model.deposition("variant-A", { timestamp: 0, values: {}, trace: trace(arc(100, 120)) }, ctx).deposition);
    const late = centroid(model.deposition("variant-A", { timestamp: 0, values: {}, trace: trace(arc(140, 120)) }, ctx).deposition);
    expect(late.theta - early.theta).toBeGreaterThan(35);
    expect(late.theta - early.theta).toBeLessThan(45);
  });
  it("adds dwell where the recorded rotation slows", () => {
    const samples = arc(0, 360).map((sample) => ({ ...sample }));
    let t = 0;
    for (const sample of samples) {
      sample.t = t;
      const slow = sample.theta >= 200 && sample.theta <= 230;
      sample.rotationSpeed = slow ? 0.4 : 1;
      t += 1 / (90 * sample.rotationSpeed);
    }
    const uniform = model.deposition("variant-A", { timestamp: 0, values: {}, trace: trace(arc(0, 360)) }, ctx).deposition;
    const hesitant = model.deposition("variant-A", { timestamp: 0, values: {}, trace: trace(samples) }, ctx).deposition;
    const row = Math.round(nozzleAimS(0.5) * (H - 1));
    const at = (theta: number) => row * W + Math.round((theta / 360) * W);
    expect(hesitant[at(215)] / uniform[at(215)]).toBeGreaterThan(1.8);
    expect(hesitant[at(60)] / uniform[at(60)]).toBeCloseTo(1, 1);
  });
  it("is deterministic", () => {
    const state = { timestamp: 0, values: {}, trace: trace(arc(10, 370)) };
    expect(model.predict("variant-A", state, ctx).expected).toEqual(
      model.predict("variant-A", state, ctx).expected,
    );
    const a = generateInspection(heroScenario, { acquisitionTimestamp: 1, processTimestamp: 0 });
    const b = generateInspection(heroScenario, { acquisitionTimestamp: 1, processTimestamp: 0 });
    expect(a.surface.observation).toEqual(b.surface.observation);
    expect(a.recordedTrace?.samples).toEqual(b.recordedTrace?.samples);
  });
  it("reports missing telemetry instead of inventing it", () => {
    const none = model.predict("variant-A", { timestamp: 0, values: {} }, ctx);
    expect(none.status).toBe("unavailable");
    expect(none.supportLevel).toBe("unavailable");
    const summary = model.predict("variant-A", { timestamp: 0, values: { flowRate: 1 } }, ctx);
    expect(summary.status).toBe("summary-only");
    const partial = model.predict(
      "variant-A",
      { timestamp: 0, values: {}, trace: trace(arc(0, 360).map(({ pressure: _p, ...rest }) => rest), ["flowRate", "nozzlePosition", "rotationSpeed", "sprayOn"]) },
      ctx,
    );
    expect(partial.status).toBe("trace-conditioned");
    expect(partial.missingChannels).toContain("pressure");
    expect(none.support[0]).toBeLessThan(summary.support[0]);
  });
  it("keeps O − E_proc distinct from O − μ and leaves unexplained excess unexplained", () => {
    const field = dataDirector.hero.surface;
    const i = surfaceIndex(field, narrativeReference.u, narrativeReference.v);
    const normalExcess = field.observation[i] - dataDirector.normal.mean[i];
    const residual = field.residual![i];
    expect(normalExcess).toBeGreaterThan(0.3);
    expect(residual).toBeGreaterThan(0.1);
    expect(residual).toBeLessThan(normalExcess);
    expect(dataDirector.processPrediction.status).toBe("trace-conditioned");
    expect(dataDirector.processCalibration.source).toBe("paired-accepted-records");
    const share = dataDirector.explanation()!.explainedShare;
    expect(share).toBeGreaterThan(0.2);
    expect(share).toBeLessThan(0.8);
  });
  it("recomputes what-if for nozzle and flow without mutating the record", () => {
    const before = JSON.stringify(dataDirector.hero.processState.values);
    const recorded = dataDirector.whatIf({});
    const flow = dataDirector.whatIf({ flowRate: 0.9 });
    const nozzle = dataDirector.whatIf({ nozzlePosition: 0.5 });
    expect(flow.residual).not.toEqual(recorded.residual);
    expect(nozzle.residual).not.toEqual(recorded.residual);
    expect(dataDirector.whatIf({ flowRate: 0.9 })).toBe(flow);
    expect(JSON.stringify(dataDirector.hero.processState.values)).toBe(before);
    expect(flow.interventionClaim).toBe(false);
  });
});

describe("DecisionEngine", () => {
  const byId = (id: string) => dataDirector.referenceExamples.find((example) => example.id === id)!;
  it("fails the hero only under the unvalidated prototype policy", () => {
    expect(dataDirector.heroDecision.disposition).toBe("FAIL");
    expect(dataDirector.heroDecision.recommendedAction).toBe("HOLD_FOR_CONFIRMATION");
    expect(dataDirector.heroDecision.validatedPolicy).toBe(false);
    expect(dataDirector.heroDecision.defectCandidate?.signature).toBe("lower-bead-accumulation");
    expect(dataDirector.hero.review?.status).toBe("pending");
  });
  it("puts measurement validity first: incomplete acquisition is INVALID → REINSPECT", () => {
    const decision = byId("incomplete-acquisition").decision;
    expect(decision.disposition).toBe("INVALID");
    expect(decision.recommendedAction).toBe("REINSPECT");
    expect(decision.defectCandidate).toBeNull();
  });
  it("routes unknown patterns and unsupported variants to REVIEW", () => {
    const unknown = byId("unknown-pattern").decision;
    expect(unknown.disposition).toBe("REVIEW");
    expect(unknown.defectCandidate?.signature).toBe("unknown");
    const unsupported = decideTyre({ field: dataDirector.hero.surface, normal: null });
    expect(unsupported.disposition).toBe("REVIEW");
    expect(unsupported.reasons.map((reason) => reason.code)).toContain("UNSUPPORTED_VARIANT");
  });
  it("passes a nominal record and reports SYSTEM_FAULT only when explicitly given", () => {
    expect(dataDirector.history.records[0].decision?.disposition).toBe("PASS");
    expect(
      decideTyre({ field: dataDirector.hero.surface, normal: dataDirector.normal, systemFault: "Camera offline" }).disposition,
    ).toBe("SYSTEM_FAULT");
  });
});

describe("process health (slow clock)", () => {
  it("keeps an isolated tyre event from changing process status", () => {
    const isolated = dataDirector.history.records[3];
    expect(isolated.decision?.disposition).not.toBe("PASS");
    expect(dataDirector.healthAt(3).state).toBe("STABLE");
  });
  it("escalates persistent drift independently of one tyre's disposition", () => {
    const states = dataDirector.processHealth.map((result) => result.state);
    expect(states.slice(0, 8).every((state) => state === "STABLE")).toBe(true);
    expect(states).toContain("WARNING");
    expect(dataDirector.healthAt().state).toBe("CRITICAL");
    expect(dataDirector.healthAt().validated).toBe(false);
  });
  it("orders history by the slow clock and keeps traces on the fast clock", () => {
    const records = dataDirector.history.records;
    expect(dataDirector.history.clock).toBe("inter-tyre");
    records.forEach((record, k) => expect(record.sequenceIndex).toBe(k));
    for (const record of records) {
      const samples = record.processState.trace!.samples;
      expect(record.processState.trace!.clock).toBe("intra-tyre");
      expect(samples[0].t).toBeLessThan(1);
      expect(samples.at(-1)!.t).toBeLessThan(10);
    }
  });
  it("ranks associations without collinearity: nozzle strong, rotation speed unrelated", () => {
    const by = Object.fromEntries(dataDirector.associations.map((a) => [a.factor, Math.abs(a.correlation)]));
    expect(by.nozzlePosition).toBeGreaterThan(0.75);
    expect(by.flowRate).toBeGreaterThan(0.4);
    expect(by.flowRate).toBeLessThan(by.nozzlePosition);
    expect(by.speed).toBeLessThan(0.3);
    expect(dataDirector.associations.every((a) => a.causalClaim === false)).toBe(true);
  });
  it("exposes a lineage record for the hero", () => {
    const lineage = dataDirector.lineage();
    expect(lineage.tyreId).toBe("TYR-1012");
    expect(lineage.processTrace?.samples).toBeGreaterThan(100);
    expect(lineage.models.decisionPolicyVersion).toMatch(/prototype/);
    expect(lineage.acquisition?.timestamp).toBeGreaterThan(dataDirector.hero.processState.timestamp);
  });
});
