import type {
  ExperienceDataProvider,
  ReferenceExample,
} from "./ExperienceDataProvider";
import { generateInspection } from "../../experience/surface/SurfaceGenerator";
import { generateHistory } from "../../experience/history/HistoryGenerator";
import { seededRandom } from "../../experience/core/seededRandom";
import { summarizeTrace } from "../../experience/intelligence/ProcessTrace";
import {
  NOMINAL_PROCESS,
  STATION_ARTIFACTS,
  heroScenario,
  incompleteAcquisitionScenario,
  unknownPatternScenario,
  type SyntheticInspectionScenario,
} from "../../experience/scenario/SyntheticInspectionScenario";
import type { TyreRecord } from "../../experience/history/ProcessHistory";

const SPRAY_STATION = "SPRAY-02";
const INSPECTION_STATION = "INSP-01";
const CALIBRATION = "CAL-2026-10-illustrative";
const HERO_PROCESS_TIME = Date.UTC(2026, 9, 9, 8);

/**
 * Converts a ground-truth scenario into an observable record. Only the generated surface and the
 * recorded telemetry leave this function; anomaly labels and the true trace stay behind.
 */
function observe(
  scenario: SyntheticInspectionScenario,
  processTimestamp: number,
  extra: Partial<TyreRecord> = {},
): TyreRecord {
  const acquisitionTimestamp = processTimestamp + 90_000;
  const generated = generateInspection(scenario, {
    acquisitionTimestamp,
    processTimestamp,
    stationId: SPRAY_STATION,
  });
  const trace = generated.recordedTrace;
  return {
    id: scenario.tyreId,
    variantId: scenario.tyreVariant,
    stationId: SPRAY_STATION,
    machineId: "LUBE-CELL-A",
    recipeId: "RCP-A-illustrative",
    surface: generated.surface,
    processState: {
      timestamp: processTimestamp,
      values: trace ? summarizeTrace(trace) : {},
      trace,
    },
    acquisition: {
      acquisitionId: `ACQ-${scenario.tyreId}`,
      inspectionStationId: INSPECTION_STATION,
      timestamp: acquisitionTimestamp,
      calibrationId: CALIBRATION,
    },
    ...extra,
  };
}

function acceptedScenario(
  id: string,
  process: Partial<SyntheticInspectionScenario["processScenario"]>,
): SyntheticInspectionScenario {
  return {
    scenarioId: id,
    tyreId: id,
    tyreVariant: "variant-A",
    seed: id,
    anomalies: [],
    processScenario: { ...NOMINAL_PROCESS, ...process },
    measurementArtifacts: STATION_ARTIFACTS,
    metadata: {
      groundTruth: true,
      illustrative: true,
      purpose: "Accepted synthetic record.",
    },
  };
}

export class PrototypeDataProvider implements ExperienceDataProvider {
  private readonly hero = observe(heroScenario, HERO_PROCESS_TIME, {
    sequenceIndex: 12,
  });
  /** Recipe-nominal accepted tyres with natural process variation (hero excluded). */
  private readonly accepted = Array.from({ length: 16 }, (_, i) => {
    const random = seededRandom(`accepted-${i}-process`);
    const n = (amount: number) => (random() - 0.5) * 2 * amount;
    return observe(
      acceptedScenario(`accepted-${i}`, {
        nozzlePosition: 0.5 + n(0.012),
        flowRate: 1 + n(0.02),
        pressure: 1 + n(0.02),
        rotationSpeed: 1 + n(0.015),
        flowOvershoot: NOMINAL_PROCESS.flowOvershoot + n(0.04),
      }),
      HERO_PROCESS_TIME - 86_400_000 + i * 600_000,
    );
  });
  /** Paired accepted records spanning the operating region, for offline process calibration. */
  private readonly calibration = Array.from({ length: 12 }, (_, i) => {
    const t = i / 11;
    const order = (k: number) => ((i * k) % 12) / 11;
    return observe(
      acceptedScenario(`calibration-${i}`, {
        nozzlePosition: 0.44 + 0.2 * t,
        flowRate: 0.92 + 0.18 * order(5),
        pressure: 0.92 + 0.18 * order(7),
        rotationSpeed: 0.86 + 0.2 * order(11),
        flowOvershoot: 0.05 + 0.6 * order(5),
      }),
      HERO_PROCESS_TIME - 172_800_000 + i * 900_000,
    );
  });
  private readonly history = generateHistory(this.hero);
  private readonly examples: ReferenceExample[] = [
    {
      id: "unknown-pattern",
      label: "Example: unmatched pattern",
      purpose: unknownPatternScenario.metadata.purpose,
      record: observe(unknownPatternScenario, HERO_PROCESS_TIME + 600_000),
    },
    {
      id: "incomplete-acquisition",
      label: "Example: incomplete acquisition",
      purpose: incompleteAcquisitionScenario.metadata.purpose,
      record: observe(incompleteAcquisitionScenario, HERO_PROCESS_TIME + 1_200_000),
    },
  ];
  getHeroTyre() {
    return this.hero;
  }
  getNormalPopulation() {
    return this.accepted.map((record) => record.surface);
  }
  getNormalPopulationProcess() {
    return this.accepted.map((record) => record.processState);
  }
  getProcessCalibrationRecords() {
    return this.calibration;
  }
  getProcessHistory() {
    return this.history;
  }
  getReferenceExamples() {
    return this.examples;
  }
}
