/**
 * SYNTHETIC PLANT — generator-side "reality" for the illustrative demo.
 *
 * Simulates what the spray station *actually* did for a tyre (true trace) and the deposition that
 * results, then records noisy, decimated telemetry from it. This is intentionally an independent
 * implementation from `PrototypeProcessModel`: it uses a flatter-topped (super-Gaussian) footprint,
 * a slightly wider cone and a small rotational landing lag that the idealized model does not know.
 * Ground-truth anomalies are added separately by `SurfaceGenerator` and never appear in telemetry.
 */
import { seededRandom } from "../core/seededRandom";
import { profileAt, profileArcLength } from "../surface/surfaceCoordinates";
import type {
  ProcessChannel,
  ProcessTrace,
  ProcessTraceSample,
} from "../intelligence/ProcessModel";
import type { SyntheticProcessScenario } from "./SyntheticInspectionScenario";

const REVOLUTION_SECONDS = 4;
const TRUE_STEP_DEGREES = 0.5;
const PRE_ROLL_DEGREES = 12;
const POST_ROLL_DEGREES = 12;

const PLANT = Object.freeze({
  coneHalfAngleDegrees: 23.5,
  nozzleRadius: 0.22,
  footprintExponent: 2.6,
  landingLagDegrees: 1.5,
  responseGain: 0.13,
});

/** True per-sample spray-station behaviour for one tyre (fast clock). */
export function simulateTrueTrace(
  process: SyntheticProcessScenario,
  seed: string,
): ProcessTraceSample[] {
  const random = seededRandom(`${seed}-true-trace`);
  const nominalRate = 360 / REVOLUTION_SECONDS;
  const dt = TRUE_STEP_DEGREES / nominalRate;
  const start = process.sprayStartTheta;
  const stop = start + 360 + process.sprayOverlapDegrees;
  const samples: ProcessTraceSample[] = [];
  let theta = start - PRE_ROLL_DEGREES,
    t = 0;
  const wobblePhase = random() * Math.PI * 2;
  while (theta < stop + POST_ROLL_DEGREES) {
    const local = ((theta % 360) + 360) % 360;
    let speed =
      process.rotationSpeed *
      (1 + 0.008 * Math.sin((theta * Math.PI) / 90 + wobblePhase));
    for (const event of process.events ?? [])
      if (
        event.kind === "rotation-hesitation" &&
        local >= event.thetaRange[0] &&
        local <= event.thetaRange[1] &&
        theta >= start &&
        theta < start + 360
      )
        speed *= event.speedFactor;
    const sprayOn = theta >= start && theta < stop;
    const sinceOpen = theta - start;
    const overshoot =
      sprayOn && sinceOpen >= 0
        ? process.flowOvershoot *
          Math.exp(-sinceOpen / Math.max(1, process.overshootDecayDegrees))
        : 0;
    samples.push({
      t,
      theta,
      pressure: process.pressure * (1 + 0.004 * (random() - 0.5)),
      flowRate: sprayOn
        ? process.flowRate * (1 + overshoot) * (1 + 0.006 * (random() - 0.5))
        : 0,
      nozzlePosition: process.nozzlePosition + 0.0015 * (random() - 0.5),
      rotationSpeed: speed,
      sprayOn,
    });
    theta += speed * nominalRate * dt;
    t += dt;
  }
  return samples;
}

/** Telemetry as a station would record it: decimated, with sensor noise, only available channels. */
export function recordTelemetry(
  samples: ProcessTraceSample[],
  process: SyntheticProcessScenario,
  ids: { tyreId: string; stationId: string; startTimestamp: number },
  seed: string,
): ProcessTrace | undefined {
  if (process.traceRecorded === false) return undefined;
  const random = seededRandom(`${seed}-telemetry`);
  const channels = process.recordedChannels;
  const has = (channel: ProcessChannel) => channels.includes(channel);
  const recorded: ProcessTraceSample[] = [];
  for (let i = 0; i < samples.length; i += 2) {
    const sample = samples[i];
    const noisy = (value: number | undefined, amount: number) =>
      value === undefined ? undefined : value + amount * (random() - 0.5);
    recorded.push({
      t: sample.t,
      theta: sample.theta,
      ...(has("pressure") && { pressure: noisy(sample.pressure, 0.012) }),
      ...(has("flowRate") && { flowRate: noisy(sample.flowRate, 0.012) }),
      ...(has("nozzlePosition") && {
        nozzlePosition: noisy(sample.nozzlePosition, 0.004),
      }),
      ...(has("rotationSpeed") && {
        rotationSpeed: noisy(sample.rotationSpeed, 0.01),
      }),
      ...(has("sprayOn") && { sprayOn: sample.sprayOn }),
    });
  }
  return {
    traceId: `trace-${ids.tyreId}`,
    tyreId: ids.tyreId,
    stationId: ids.stationId,
    clock: "intra-tyre",
    startTimestamp: ids.startTimestamp,
    samples: recorded,
    channels: [...channels],
    illustrative: true,
    source: "synthetic-telemetry",
  };
}

const heightTable = Array.from({ length: 257 }, (_, i) => profileAt(i / 256));
function plantAim(nozzlePosition: number): number {
  const top = heightTable[0][1],
    bottom = heightTable[256][1];
  const target = top + (bottom - top) * Math.max(0, Math.min(1, nozzlePosition));
  for (let i = 1; i < heightTable.length; i++)
    if (heightTable[i][1] <= target) {
      const a = heightTable[i - 1][1],
        b = heightTable[i][1];
      return (i - 1 + (a - target) / (a - b || 1)) / 256;
    }
  return 1;
}

function rawPlantDeposition(
  samples: ProcessTraceSample[],
  width: number,
  height: number,
): Float32Array {
  const deposition = new Float32Array(width * height);
  const exponent = PLANT.footprintExponent;
  for (let k = 0; k < samples.length; k++) {
    const sample = samples[k];
    if (!sample.sprayOn || !sample.flowRate) continue;
    const next = samples[k + 1] ?? samples[k - 1];
    const dt = Math.abs(next.t - sample.t);
    const aim = plantAim(sample.nozzlePosition ?? 0.5);
    const [radius] = profileAt(aim);
    const distance = radius - PLANT.nozzleRadius;
    const half =
      ((PLANT.coneHalfAngleDegrees * Math.PI) / 180) *
      Math.sqrt(Math.max(0.2, sample.pressure ?? 1));
    const extent = (distance * Math.tan(half)) / 2;
    const [x0, y0] = profileAt(aim - 0.001),
      [x1, y1] = profileAt(aim + 0.001);
    const tilt = Math.abs(y1 - y0) / (Math.hypot(x1 - x0, y1 - y0) || 1);
    const spreadS = extent / Math.max(0.35, tilt) / profileArcLength;
    const spreadTheta = ((extent / radius) * 180) / Math.PI;
    const mass = (sample.flowRate * dt) / (extent * extent);
    const centre =
      ((((sample.theta + PLANT.landingLagDegrees) % 360) + 360) % 360) / 360;
    const columns = Math.ceil(((3 * spreadTheta) / 360) * width);
    const middle = Math.round(centre * width);
    for (let dx = -columns; dx <= columns; dx++) {
      const column = (((middle + dx) % width) + width) % width;
      let du = Math.abs(column / width - centre);
      du = Math.min(du, 1 - du) * 360;
      const weightTheta = Math.exp(-0.5 * (du / spreadTheta) ** 2);
      for (let y = 0; y < height; y++) {
        const ds = Math.abs(y / (height - 1) - aim) / spreadS;
        if (ds > 3.2) continue;
        deposition[y * width + column] +=
          mass * weightTheta * Math.exp(-0.5 * ds ** exponent);
      }
    }
  }
  return deposition;
}

let nominalPeak: { key: string; value: number } | null = null;
function plantNormalizer(
  nominal: SyntheticProcessScenario,
  width: number,
  height: number,
) {
  const key = `${width}x${height}`;
  if (nominalPeak?.key === key) return nominalPeak.value;
  const reference = rawPlantDeposition(
    simulateTrueTrace({ ...nominal, events: [] }, "plant-reference"),
    width,
    height,
  );
  // Reference column away from the spray overlap.
  const column = Math.round(((nominal.sprayStartTheta + 180) % 360) / 360 * width);
  let peak = 0;
  for (let y = 0; y < height; y++)
    peak = Math.max(peak, reference[y * width + (column % width)]);
  nominalPeak = { key, value: peak || 1 };
  return nominalPeak.value;
}

/** Optical-response increment produced by the plant's true deposition. */
export function plantResponse(
  samples: ProcessTraceSample[],
  nominal: SyntheticProcessScenario,
  width: number,
  height: number,
): Float32Array {
  const raw = rawPlantDeposition(samples, width, height);
  const scale = PLANT.responseGain / plantNormalizer(nominal, width, height);
  for (let i = 0; i < raw.length; i++) raw[i] *= scale;
  return raw;
}
