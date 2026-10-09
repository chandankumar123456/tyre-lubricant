import type { SurfaceField } from "../surface/SurfaceField";
import type { ProcessState } from "../intelligence/ProcessModel";
import type {
  DecisionResult,
  TyreDisposition,
} from "../intelligence/DecisionEngine";

/** Prototype digital thread. Optional fields stay optional where a provider cannot populate them. */
export interface AcquisitionRecord {
  acquisitionId: string;
  inspectionStationId: string;
  /** Inspection time (epoch ms) — distinct from the spray-station process timestamp. */
  timestamp: number;
  calibrationId: string;
}

export interface ModelVersions {
  normalModelVersion: string;
  processModelVersion: string;
  processCalibrationVersion?: string;
  decisionPolicyVersion: string;
}

/** A human decision never overwrites the automated one; both remain traceable. */
export interface HumanReviewRecord {
  reviewId: string;
  role: "quality-engineer" | "process-engineer";
  status: "pending" | "confirmed" | "overridden";
  originalDisposition: TyreDisposition;
  finalDisposition?: TyreDisposition;
  timestamp?: number;
  note?: string;
}

export interface TyreRecord {
  id: string;
  variantId: string;
  /** Spray (lubrication) station that produced the process state. */
  stationId?: string;
  machineId?: string;
  recipeId?: string;
  /** Slow clock: position in the production sequence. */
  sequenceIndex?: number;
  surface: SurfaceField;
  processState: ProcessState;
  acquisition?: AcquisitionRecord;
  models?: ModelVersions;
  decision?: DecisionResult;
  review?: HumanReviewRecord;
}

export type HeroTyreRecord = TyreRecord;

export interface TyreHistoryRecord extends TyreRecord {
  sequenceIndex: number;
  deviation: number;
  illustrative: true;
}

export interface ProcessHistory {
  records: TyreHistoryRecord[];
  clock: "inter-tyre";
  illustrative: true;
}
