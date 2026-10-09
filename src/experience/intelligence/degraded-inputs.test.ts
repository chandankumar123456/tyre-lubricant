import { describe, expect, it } from "vitest";
import { dataDirector } from "../core/DataDirector";
import { decideTyre } from "./DecisionEngine";
import { IllustrativeProcessModel } from "./PrototypeProcessModel";
import type { ProcessTrace } from "./ProcessModel";
import { evaluateProcessHealth, type HealthEvidence } from "./ProcessHealth";
import { applyCandidate } from "./ProcessTrace";

function surface() {
  const source = dataDirector.history.records[0].surface;
  return {
    ...source,
    observation: source.observation.slice(),
    confidence: source.confidence.slice(),
    validity: source.validity.slice(),
  };
}

describe("degraded observable inputs", () => {
  it.each(["observation", "confidence"] as const)(
    "routes non-finite %s to INVALID rather than judging product quality",
    (channel) => {
      const field = surface();
      field[channel].fill(Number.NaN);
      const result = decideTyre({ field, normal: dataDirector.normal });
      expect(result.disposition).toBe("INVALID");
      expect(result.recommendedAction).toBe("REINSPECT");
      expect(result.defectCandidate).toBeNull();
    },
  );

  it("requires normal-model support before a PASS", () => {
    const normal = {
      ...dataDirector.normal,
      support: new Uint16Array(dataDirector.normal.support.length),
    };
    const result = decideTyre({ field: surface(), normal });
    expect(result.disposition).toBe("REVIEW");
    expect(result.reasons.map((reason) => reason.code)).toContain("NORMAL_MODEL_UNSUPPORTED");
  });

  it("routes incompatible normal arrays to REVIEW", () => {
    const normal = { ...dataDirector.normal, mean: new Float32Array(1) };
    expect(decideTyre({ field: surface(), normal }).disposition).toBe("REVIEW");
  });

  const emptyTrace: ProcessTrace = {
    traceId: "empty", tyreId: "test", stationId: "test", clock: "intra-tyre",
    startTimestamp: 0, samples: [],
    channels: ["pressure", "flowRate", "nozzlePosition", "rotationSpeed", "sprayOn"],
    illustrative: true, source: "synthetic-telemetry",
  };
  it("does not claim an empty trace is time-aligned process evidence", () => {
    const model = new IllustrativeProcessModel();
    const absent = model.predict("variant-A", { timestamp: 0, values: {}, trace: emptyTrace });
    expect(absent.status).toBe("unavailable");
    expect(absent.supportLevel).toBe("unavailable");
    expect(absent.availableVariables).toEqual([]);
    const summary = model.predict("variant-A", { timestamp: 0, values: { flowRate: 1 }, trace: emptyTrace });
    expect(summary.status).toBe("summary-only");
    expect(summary.availableVariables).toEqual(["flowRate"]);
  });

  it("does not infer available channels solely from trace declarations", () => {
    const model = new IllustrativeProcessModel();
    const recorded = { ...emptyTrace, samples: [{ t: 0, theta: 0 }, { t: 1, theta: 90 }] };
    const result = model.predict("variant-A", { timestamp: 0, values: {}, trace: recorded });
    expect(result.status).toBe("trace-conditioned");
    expect(result.availableVariables).toEqual([]);
    expect(result.missingChannels).toContain("pressure");
    expect(result.supportLevel).toBe("limited");
  });

  it("uses requested what-if channels when the recorded trace lacks those channels", () => {
    const recorded = { timestamp: 0, values: {}, trace: {
      ...emptyTrace, channels: [] as ProcessTrace["channels"],
      samples: [{ t: 0, theta: 0 }, { t: 1, theta: 90 }],
    } };
    const candidate = applyCandidate(recorded, { flowRate: 0.9, pressure: 1.1 });
    expect(candidate.trace?.samples.every((sample) => sample.flowRate === 0.9)).toBe(true);
    expect(candidate.trace?.samples.every((sample) => sample.pressure === 1.1)).toBe(true);
    expect(candidate.trace?.channels).toContain("flowRate");
    expect(candidate.trace?.channels).toContain("pressure");
    expect(recorded.trace.samples[0]).toEqual({ t: 0, theta: 0 });
  });

  it.each([
    { samples: [{ t: 0, theta: Number.NaN }, { t: 1, theta: 90 }] },
    { samples: [{ t: 1, theta: 0 }, { t: 0, theta: 90 }] },
  ])("degrades unusable encoder/time alignment to summary-only", ({ samples }) => {
    const result = new IllustrativeProcessModel().predict("variant-A", {
      timestamp: 0, values: { flowRate: 1 }, trace: { ...emptyTrace, samples },
    });
    expect(result.status).toBe("summary-only");
    expect([...result.expected].every(Number.isFinite)).toBe(true);
    expect(result.notes.some((note) => /unusable trace/i.test(note))).toBe(true);
  });
});

describe("degraded process-health evidence", () => {
  const evidence = (sequenceIndex: number): HealthEvidence => ({
    sequenceIndex, peakNormalExcess: 0.01, peakProcessResidual: 0,
    disposition: "PASS", candidate: null, values: {},
  });
  it("keeps empty windows finite and reports unavailable evidence", () => {
    const result = evaluateProcessHealth([], 0, {});
    expect(Number.isFinite(result.index)).toBe(true);
    expect(result.evidenceStatus).toBe("unavailable");
  });
  it("excludes INVALID measurements from product drift while retaining parameter evidence", () => {
    const records = Array.from({ length: 8 }, (_, i) => ({
      ...evidence(i), disposition: "INVALID" as const,
      peakNormalExcess: i / 2, peakProcessResidual: i / 2,
      candidate: { thetaDegrees: 200, s: 0.7 }, values: { nozzlePosition: 0.65 },
    }));
    const result = evaluateProcessHealth(records, 7, { nozzlePosition: 0.5 });
    expect(result.driftPersistent).toBe(false);
    expect(result.components.persistentNormalDeviation).toBe(0);
    expect(result.components.persistentProcessResidual).toBe(0);
    expect(result.components.spatialPersistence).toBe(0);
    expect(result.components.parameterDrift).toBe(1);
  });
  it("does not score absent process expectations as zero residual evidence", () => {
    const records = Array.from({ length: 4 }, (_, i) => ({
      ...evidence(i), peakProcessResidual: null,
    }));
    const result = evaluateProcessHealth(records, 3, {});
    expect(Number.isFinite(result.index)).toBe(true);
    expect(result.evidenceStatus).toBe("partial");
    expect(result.reasons.some((reason) => /process residual.*unavailable/i.test(reason))).toBe(true);
  });
  it("does not count unsupported-model REVIEW as product deterioration", () => {
    const records = Array.from({ length: 8 }, (_, i) => ({
      ...evidence(i), disposition: "REVIEW" as const,
      productEvidenceAvailable: false,
      peakNormalExcess: i / 2, peakProcessResidual: i / 2,
    }));
    const result = evaluateProcessHealth(records, 7, {});
    expect(result.components.defectFrequency).toBe(0);
    expect(result.components.persistentNormalDeviation).toBe(0);
    expect(result.driftPersistent).toBe(false);
    expect(result.evidenceStatus).toBe("unavailable");
  });
});
