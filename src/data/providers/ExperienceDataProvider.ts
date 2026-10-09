import type { SurfaceField } from "../../experience/surface/SurfaceField";
import type {
  HeroTyreRecord,
  ProcessHistory,
  TyreRecord,
} from "../../experience/history/ProcessHistory";

/** A labelled, explicitly illustrative example evaluated by the same pipeline as the hero. */
export interface ReferenceExample {
  id: string;
  label: string;
  purpose: string;
  record: TyreRecord;
}

/**
 * Observable data boundary. Implementations may be synthetic (prototype) or, in future, backed by
 * plant systems. Everything returned here is treated as observable input: no ground-truth labels or
 * anomaly locations may be exposed through it.
 */
export interface ExperienceDataProvider {
  getHeroTyre(): HeroTyreRecord;
  getNormalPopulation(): SurfaceField[];
  getProcessHistory(): ProcessHistory;
  /** Paired accepted records (surface + process) for offline process-model calibration. */
  getProcessCalibrationRecords?(): TyreRecord[];
  /** Recorded process summaries of the accepted population (reference operating point). */
  getNormalPopulationProcess?(): TyreRecord["processState"][];
  getReferenceExamples?(): ReferenceExample[];
}
