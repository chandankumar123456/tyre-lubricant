import type {
  ExperienceDataProvider,
  ReferenceExample,
} from "../../data/providers/ExperienceDataProvider";
import { PrototypeDataProvider } from "../../data/providers/PrototypeDataProvider";
import { fitNormalModel, compareNormal } from "../intelligence/NormalModel";
import { IllustrativeProcessModel } from "../intelligence/PrototypeProcessModel";
import { fitProcessCalibration } from "../intelligence/ProcessCalibration";
import type {
  ProcessPrediction,
  ProcessState,
} from "../intelligence/ProcessModel";
import {
  applyCandidate,
  sprayWindow,
  summarizeTrace,
  type CandidateChanges,
} from "../intelligence/ProcessTrace";
import { detectDrift } from "../intelligence/DriftModel";
import { computeAssociations } from "../intelligence/AssociationModel";
import { decideTyre, type DecisionResult } from "../intelligence/DecisionEngine";
import {
  processHealthTimeline,
  type HealthEvidence,
  type ProcessHealthResult,
} from "../intelligence/ProcessHealth";
import { prototypeDecisionPolicy } from "../intelligence/DecisionPolicy";
import { createSurfaceTexture } from "../surface/SurfaceTextures";
import { surfaceIndex } from "../surface/SurfaceField";
import type { SurfaceField } from "../surface/SurfaceField";
import type { ModelVersions, TyreRecord } from "../history/ProcessHistory";
import {
  nozzleAimS,
  sprayFootprint,
  variantGeometry,
} from "../intelligence/SprayGeometry";

export type HistoryWindow = "short" | "medium" | "long";

/** Display scale of the process-conditioned deviation (illustrative, not a validated unit). */
export const PROCESS_DEVIATION_SCALE = 0.025;

export interface ExplanationSummary {
  /** Share of the candidate region's excess over normal that the process expectation accounts for. */
  explainedShare: number;
  label: "mostly explained" | "partly explained" | "largely unexplained";
  illustrative: true;
}

export class DataDirector {
  readonly hero;
  readonly normalPopulation;
  readonly history;
  readonly normal;
  readonly processCalibration;
  readonly processModel: IllustrativeProcessModel;
  readonly processPrediction: ProcessPrediction;
  readonly drift;
  readonly associations;
  readonly heroTexture;
  readonly modelVersions: ModelVersions;
  readonly heroDecision: DecisionResult;
  readonly decisions = new Map<string, DecisionResult>();
  readonly processHealth: ProcessHealthResult[];
  readonly referenceExamples: (ReferenceExample & {
    decision: DecisionResult;
    prediction: ProcessPrediction;
  })[];
  readonly referenceProcess: ProcessState["values"];
  private readonly predictions = new Map<string, ProcessPrediction>();
  private readonly whatIfCache = new Map<string, ReturnType<DataDirector["computeWhatIf"]>>();

  constructor(provider: ExperienceDataProvider = new PrototypeDataProvider()) {
    this.hero = provider.getHeroTyre();
    this.normalPopulation = provider.getNormalPopulation();
    this.history = provider.getProcessHistory();
    this.normal = fitNormalModel(this.normalPopulation);
    const calibrationRecords = provider.getProcessCalibrationRecords?.() ?? [];
    const uncalibrated = new IllustrativeProcessModel();
    this.processCalibration = calibrationRecords.length
      ? fitProcessCalibration(uncalibrated, calibrationRecords, this.hero.variantId)
      : uncalibrated.calibrationFor(this.hero.variantId);
    this.processModel = new IllustrativeProcessModel({
      [this.hero.variantId]: this.processCalibration,
    });
    this.modelVersions = {
      normalModelVersion: `population-normal/0.1 (${this.normalPopulation.length} accepted, ${this.normal.variantId})`,
      processModelVersion: this.processModel.version,
      processCalibrationVersion: this.processCalibration.version,
      decisionPolicyVersion: prototypeDecisionPolicy.version,
    };
    const populationProcess = provider.getNormalPopulationProcess?.() ?? [];
    this.referenceProcess = averageValues(
      populationProcess.map((state) =>
        state.trace ? summarizeTrace(state.trace) : state.values,
      ),
    );
    this.evaluateRecord(this.hero);
    for (const record of this.history.records) {
      if (record.id === this.hero.id)
        Object.assign(record, {
          models: this.hero.models,
          decision: this.hero.decision,
          review: this.hero.review,
        });
      else this.evaluateRecord(record);
      record.deviation = this.characterizeSignature(record.surface).peak;
    }
    this.processPrediction = this.predictions.get(this.hero.id)!;
    this.heroDecision = this.decisions.get(this.hero.id)!;
    this.drift = detectDrift(
      this.history.records.map((record) => record.deviation),
    );
    this.associations = computeAssociations(this.history);
    this.processHealth = processHealthTimeline(
      this.history.records.map((record) => this.healthEvidence(record)),
      this.referenceProcess,
    );
    this.referenceExamples = (provider.getReferenceExamples?.() ?? []).map(
      (example) => {
        const prediction = this.evaluateRecord(example.record);
        return {
          ...example,
          prediction,
          decision: this.decisions.get(example.record.id)!,
        };
      },
    );
    this.heroTexture = createSurfaceTexture(this.hero.surface);
  }

  private evaluateRecord(record: TyreRecord) {
    const prediction = this.deriveSurface(record.surface, record.processState);
    this.predictions.set(record.id, prediction);
    const decision = decideTyre({
      field: record.surface,
      normal:
        this.normal.variantId === record.surface.metadata.variantId
          ? this.normal
          : null,
    });
    this.decisions.set(record.id, decision);
    record.models = this.modelVersions;
    record.decision = decision;
    if (
      (decision.disposition === "FAIL" || decision.disposition === "REVIEW") &&
      !record.review
    )
      record.review = {
        reviewId: `REV-${record.id}`,
        role: "quality-engineer",
        status: "pending",
        originalDisposition: decision.disposition,
        note: "Illustrative placeholder: no review backend exists.",
      };
    return prediction;
  }

  private deriveSurface(field: SurfaceField, state: ProcessState) {
    const alignedNormal = field.metadata.variantId === this.normal.variantId &&
      field.observation.length === this.normal.mean.length;
    field.normalMean = alignedNormal ? this.normal.mean : undefined;
    field.normalVariation = alignedNormal ? this.normal.variation : undefined;
    // Neutral display storage keeps downstream geometry aligned; absence of a normal
    // model remains explicit and decision policy returns REVIEW.
    field.normalDeviation = alignedNormal
      ? compareNormal(field, this.normal)
      : new Float32Array(field.observation.length);
    const prediction = this.processModel.predict(
      field.metadata.variantId,
      state,
      { width: field.width, height: field.height },
    );
    field.processExpected = prediction.expected;
    field.residual = Float32Array.from(field.observation, (value, i) =>
      field.validity[i] && Number.isFinite(value) && Number.isFinite(field.confidence[i])
        ? value - prediction.expected[i] : 0,
    );
    field.processDeviation = Float32Array.from(
      field.residual,
      (value) => value / PROCESS_DEVIATION_SCALE,
    );
    return prediction;
  }

  private healthEvidence(record: TyreRecord & { sequenceIndex?: number }): HealthEvidence {
    const field = record.surface;
    const prediction = this.predictions.get(record.id);
    let peakResidual = 0;
    for (let i = 0; i < field.observation.length; i++)
      if (field.validity[i] && field.confidence[i] >= 0.5)
        if (Number.isFinite(field.residual![i]))
          peakResidual = Math.max(peakResidual, Math.abs(field.residual![i]));
    const decision = this.decisions.get(record.id)!;
    const candidate = decision.defectCandidate;
    return {
      sequenceIndex: record.sequenceIndex ?? 0,
      peakNormalExcess: this.characterizeSignature(field).peak,
      peakProcessResidual: prediction?.status === "unavailable" ? null : peakResidual,
      disposition: decision.disposition,
      productEvidenceAvailable: !decision.reasons.some(reason =>
        reason.code === "UNSUPPORTED_VARIANT" || reason.code === "NORMAL_MODEL_UNSUPPORTED"),
      candidate: candidate
        ? { thetaDegrees: candidate.centroid.thetaDegrees, s: candidate.centroid.s }
        : null,
      values: record.processState.values,
    };
  }

  /** Location of the detected evidence on the hero (from inference, never from scenario truth). */
  get evidenceLocation() {
    const candidate = this.heroDecision.defectCandidate;
    if (candidate)
      return { u: candidate.centroid.u, v: candidate.centroid.v, source: "defect-candidate" as const };
    const signature = this.characterizeSignature();
    return { ...signature.centroid, source: "excess-centroid" as const };
  }

  predictionFor(record: TyreRecord) {
    return this.predictions.get(record.id);
  }

  /** Process health at a slow-clock position (defaults to the latest record, the hero). */
  healthAt(sequenceIndex = this.history.records.length - 1) {
    return this.processHealth[
      Math.max(0, Math.min(this.processHealth.length - 1, sequenceIndex))
    ];
  }

  explanation(field: SurfaceField = this.hero.surface): ExplanationSummary | null {
    if (field.metadata.variantId !== this.normal.variantId ||
        field === this.hero.surface && this.processPrediction.status === "unavailable")
      return null;
    const decision =
      field === this.hero.surface ? this.heroDecision : undefined;
    const cells = decision?.defectCandidate?.cells;
    if (!cells?.length || !field.residual) return null;
    let excess = 0,
      residual = 0;
    for (const i of cells) {
      excess += Math.max(0, field.observation[i] - this.normal.mean[i]);
      residual += Math.max(0, field.residual[i]);
    }
    const share = excess > 0 ? Math.max(0, Math.min(1, 1 - residual / excess)) : 0;
    return {
      explainedShare: share,
      label:
        share >= 0.6
          ? "mostly explained"
          : share >= 0.2
            ? "partly explained"
            : "largely unexplained",
      illustrative: true,
    };
  }

  private computeWhatIf(changes: CandidateChanges) {
    const state = applyCandidate(this.hero.processState, changes);
    const field = this.hero.surface;
    const prediction = this.processModel.predict(this.hero.variantId, state, {
      width: field.width,
      height: field.height,
    });
    const residual = Float32Array.from(field.observation, (value, i) =>
      field.validity[i] ? value - prediction.expected[i] : 0,
    );
    return {
      state,
      prediction,
      residual,
      processDeviation: Float32Array.from(
        residual,
        (value) => value / PROCESS_DEVIATION_SCALE,
      ),
      illustrative: true as const,
      interventionClaim: false as const,
    };
  }

  /** Predicted response for a candidate process state. The recorded state is never modified. */
  whatIf(changes: CandidateChanges) {
    const key = JSON.stringify(
      Object.entries(changes)
        .filter(([, value]) => value !== undefined)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, value]) => [k, Math.round(value! * 1e4) / 1e4]),
    );
    let result = this.whatIfCache.get(key);
    if (!result) {
      result = this.computeWhatIf(changes);
      this.whatIfCache.set(key, result);
      if (this.whatIfCache.size > 12)
        this.whatIfCache.delete(this.whatIfCache.keys().next().value!);
    }
    return result;
  }

  /** Canonical-map projection of the recorded (or candidate) spray geometry for schematic display. */
  processSchematic(candidate: { nozzlePosition?: number } = {}) {
    const values = this.hero.processState.values;
    const nozzlePosition =
      candidate.nozzlePosition ?? values.nozzlePosition ?? 0.5;
    const aimS = nozzleAimS(nozzlePosition);
    const footprint = sprayFootprint(
      aimS,
      values.pressure ?? 1,
      variantGeometry(this.hero.variantId),
    );
    const window = sprayWindow(this.hero.processState.trace);
    return {
      nozzlePosition,
      aimS,
      sigmaS: footprint.sigmaS,
      sprayStartTheta: window ? window.startTheta : null,
      overlapDegrees: window ? window.overlapDegrees : null,
      illustrative: true as const,
    };
  }

  /** Compact digital-thread lineage for one tyre record. */
  lineage(record: TyreRecord = this.hero) {
    const trace = record.processState.trace;
    const prediction = this.predictions.get(record.id);
    return {
      tyreId: record.id,
      variantId: record.variantId,
      sprayStation: record.stationId,
      machineId: record.machineId,
      recipeId: record.recipeId,
      sequenceIndex: record.sequenceIndex,
      processTrace: trace
        ? {
            traceId: trace.traceId,
            samples: trace.samples.length,
            channels: trace.channels,
            startTimestamp: trace.startTimestamp,
          }
        : null,
      processStatus: prediction?.status ?? "unavailable",
      acquisition: record.acquisition,
      surface: {
        seed: record.surface.metadata.seed,
        grid: `${record.surface.width}×${record.surface.height}`,
        fingerprint: this.observationFingerprint(record.surface),
      },
      models: record.models ?? this.modelVersions,
      disposition: record.decision?.disposition,
      recommendedAction: record.decision?.recommendedAction,
      review: record.review,
      illustrative: true as const,
    };
  }

  characterizeSignature(field: SurfaceField = this.hero.surface) {
    if (field.metadata.variantId !== this.normal.variantId ||
        field.observation.length !== this.normal.mean.length)
      return {
        peak: 0, areaFraction: 0, centroid: { u: 0, v: 0 },
        supported: false, illustrative: true as const,
      };
    let weight = 0,
      weightedV = 0,
      cos = 0,
      sin = 0,
      peak = 0,
      count = 0;
    for (let i = 0; i < field.observation.length; i++)
      if (field.validity[i] && field.confidence[i] >= 0.5 &&
          Number.isFinite(field.observation[i]) && this.normal.support[i]) {
        const excess = Math.max(
          0,
          field.observation[i] - (field.normalMean?.[i] ?? this.normal.mean[i]),
        );
        peak = Math.max(peak, excess);
        if (excess < 0.05) continue;
        const u = (i % field.width) / field.width,
          v = Math.floor(i / field.width) / (field.height - 1);
        weight += excess;
        weightedV += v * excess;
        cos += Math.cos(u * Math.PI * 2) * excess;
        sin += Math.sin(u * Math.PI * 2) * excess;
        count++;
      }
    const angle = Math.atan2(sin, cos) / (Math.PI * 2);
    return {
      peak,
      areaFraction: count / field.observation.length,
      centroid: {
        u: weight ? (angle + 1) % 1 : 0,
        v: weight ? weightedV / weight : 0,
      },
      supported: weight > 0,
      illustrative: true as const,
    };
  }
  aggregateHistory(window: HistoryWindow) {
    const length = { short: 4, medium: 8, long: this.history.records.length }[
      window
    ];
    const records = this.history.records.slice(-length);
    const count = this.hero.surface.observation.length;
    const meanDeviation = new Float32Array(count),
      meanResidual = new Float32Array(count),
      support = new Uint16Array(count);
    for (const record of records)
      for (let i = 0; i < count; i++)
        if (record.surface.validity[i] && record.surface.confidence[i] >= 0.5) {
          meanDeviation[i] += record.surface.normalDeviation![i];
          meanResidual[i] += record.surface.residual![i];
          support[i]++;
        }
    for (let i = 0; i < count; i++)
      if (support[i]) {
        meanDeviation[i] /= support[i];
        meanResidual[i] /= support[i];
      }
    return {
      window,
      records,
      meanDeviation,
      meanResidual,
      support,
      drift: detectDrift(
        this.history.records.map((record) => record.deviation),
        Math.min(4, length),
      ),
      illustrative: true as const,
    };
  }
  observationFingerprint(field: SurfaceField = this.hero.surface): string {
    let hash = 2166136261;
    // Hash authoritative CPU bytes, not labels, seeds, or quantized GPU samples.
    for (const array of [field.observation, field.confidence, field.validity]) {
      const bytes = new Uint8Array(
        array.buffer,
        array.byteOffset,
        array.byteLength,
      );
      for (const byte of bytes) hash = Math.imul(hash ^ byte, 16777619);
    }
    return (hash >>> 0).toString(16).padStart(8, "0");
  }
  traceSample(u: number, v: number, field: SurfaceField = this.hero.surface) {
    const index = surfaceIndex(field, u, v),
      view = field.acquisition.views[field.acquisition.sampleViewIndex[index]];
    return {
      sampleIndex: index,
      u: (index % field.width) / field.width,
      v: Math.floor(index / field.width) / (field.height - 1),
      viewId: view.id,
      timestamp: view.timestamp,
      acquisition: view,
      observation: field.observation[index],
      confidence: field.confidence[index],
      valid: Boolean(field.validity[index]),
      illustrative: true as const,
      source: "generated-observation" as const,
    };
  }
}

function averageValues(list: ProcessState["values"][]): ProcessState["values"] {
  const totals: Record<string, { sum: number; n: number }> = {};
  for (const values of list)
    for (const [key, value] of Object.entries(values))
      if (Number.isFinite(value)) {
        totals[key] ??= { sum: 0, n: 0 };
        totals[key].sum += value!;
        totals[key].n++;
      }
  return Object.fromEntries(
    Object.entries(totals).map(([key, { sum, n }]) => [key, sum / n]),
  );
}

export const dataDirector = new DataDirector();
