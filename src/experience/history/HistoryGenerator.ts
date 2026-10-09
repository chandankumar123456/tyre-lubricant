/**
 * Generator-side synthetic production history (slow clock). Builds a ground-truth scenario per tyre
 * so that drift, isolated events and parameter associations emerge from generated data:
 * - nozzle alignment drifts gradually toward the lower bead (strong association by design);
 * - mean flow rises a little with noise (moderate association);
 * - pressure carries mostly noise with a slight trend (weak association);
 * - rotation speed is unrelated noise;
 * - tyre #1003 has one isolated single-point event elsewhere on the surface with nominal process.
 * Deterministic: same inputs → same history.
 */
import { seededRandom } from "../core/seededRandom";
import { generateInspection } from "../surface/SurfaceGenerator";
import {
  NOMINAL_PROCESS,
  STATION_ARTIFACTS,
  heroScenario,
  type SyntheticAnomaly,
  type SyntheticInspectionScenario,
} from "../scenario/SyntheticInspectionScenario";
import { summarizeTrace } from "../intelligence/ProcessTrace";
import type {
  HeroTyreRecord,
  ProcessHistory,
  TyreHistoryRecord,
} from "./ProcessHistory";

export const HISTORY_LENGTH = 12;

/** Ground-truth drift progress for slow-clock position k (hero = HISTORY_LENGTH). */
export function driftProgress(k: number) {
  return k <= 5 ? 0 : ((k - 5) / (HISTORY_LENGTH - 5)) ** 1.3;
}

export function historyScenario(k: number): SyntheticInspectionScenario {
  const random = seededRandom(`history-process-${k}`);
  const noise = (amount: number) => (random() - 0.5) * 2 * amount;
  const d = driftProgress(k);
  const pooling = heroScenario.anomalies[0];
  const anomalies: SyntheticAnomaly[] = [];
  if (d > 0)
    anomalies.push({
      ...pooling,
      id: `pooling-${k}`,
      amplitude: pooling.amplitude * d ** 1.1 * (0.92 + random() * 0.16),
    });
  if (k === 3)
    anomalies.push({
      id: "isolated-single-point",
      type: "single-point-concentration",
      centerTheta: 150,
      centerS: 0.4,
      amplitude: 0.34,
      spreadTheta: 3.5,
      spreadS: 0.03,
    });
  return {
    scenarioId: `history-${k}`,
    tyreId: `TYR-${1000 + k}`,
    tyreVariant: heroScenario.tyreVariant,
    seed: `history-${k}`,
    anomalies,
    processScenario: {
      ...NOMINAL_PROCESS,
      nozzlePosition: 0.5 + 0.08 * d + noise(0.006),
      flowRate: 1 + 0.045 * d + noise(0.03),
      pressure: 1 + 0.015 * d + noise(0.03),
      rotationSpeed: 1 + noise(0.02),
      flowOvershoot: NOMINAL_PROCESS.flowOvershoot + noise(0.04),
    },
    measurementArtifacts: STATION_ARTIFACTS,
    metadata: {
      groundTruth: true,
      illustrative: true,
      purpose:
        k === 3 ? "Isolated event in a stable process." : "Production history sample.",
    },
  };
}

export function generateHistory(hero: HeroTyreRecord): ProcessHistory {
  const records: TyreHistoryRecord[] = Array.from(
    { length: HISTORY_LENGTH },
    (_, k) => {
      const scenario = historyScenario(k);
      const processTimestamp =
        hero.processState.timestamp - (HISTORY_LENGTH - k) * 60_000;
      const acquisitionTimestamp = processTimestamp + 90_000;
      const generated = generateInspection(scenario, {
        acquisitionTimestamp,
        processTimestamp,
        stationId: hero.stationId,
      });
      const trace = generated.recordedTrace;
      return {
        id: scenario.tyreId,
        variantId: scenario.tyreVariant,
        stationId: hero.stationId,
        machineId: hero.machineId,
        recipeId: hero.recipeId,
        sequenceIndex: k,
        surface: generated.surface,
        processState: {
          timestamp: processTimestamp,
          values: trace ? summarizeTrace(trace) : {},
          trace,
        },
        acquisition: {
          acquisitionId: `ACQ-${scenario.tyreId}`,
          inspectionStationId: hero.acquisition?.inspectionStationId ?? "INSP-01",
          timestamp: acquisitionTimestamp,
          calibrationId: hero.acquisition?.calibrationId ?? "CAL-illustrative",
        },
        deviation: 0,
        illustrative: true as const,
      };
    },
  );
  records.push({
    ...hero,
    sequenceIndex: HISTORY_LENGTH,
    deviation: 0,
    illustrative: true,
  });
  return { records, clock: "inter-tyre", illustrative: true };
}
