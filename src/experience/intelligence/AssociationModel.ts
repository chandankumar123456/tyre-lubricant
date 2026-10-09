import type { ProcessHistory } from "../history/ProcessHistory";
export interface AssociationResult {
  factor: string;
  correlation: number;
  samples: number;
  illustrative: true;
  causalClaim: false;
}
export function computeAssociations(
  history: ProcessHistory,
): AssociationResult[] {
  const factors = new Set(
    history.records.flatMap((record) =>
      Object.keys(record.processState.values),
    ),
  );
  return [...factors]
    .map((factor) => {
      const pairs = history.records
        .filter((record) => Number.isFinite(record.processState.values[factor]))
        .map((record) => [
          record.processState.values[factor]!,
          record.deviation,
        ]);
      const n = pairs.length;
      const mx = pairs.reduce((sum, pair) => sum + pair[0], 0) / (n || 1),
        my = pairs.reduce((sum, pair) => sum + pair[1], 0) / (n || 1);
      let cross = 0,
        xx = 0,
        yy = 0;
      for (const [x, y] of pairs) {
        cross += (x - mx) * (y - my);
        xx += (x - mx) ** 2;
        yy += (y - my) ** 2;
      }
      return {
        factor,
        correlation: n >= 3 && xx * yy > 0 ? cross / Math.sqrt(xx * yy) : 0,
        samples: n,
        illustrative: true as const,
        causalClaim: false as const,
      };
    })
    .sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
}

export function describeAssociation(result: AssociationResult) {
  const magnitude = Math.abs(result.correlation);
  const strength =
    result.samples < 3
      ? "insufficient evidence"
      : magnitude >= 0.75
        ? "strong association"
        : magnitude >= 0.4
          ? "moderate association"
          : "weak association";
  const labels: Record<string, string> = {
    nozzlePosition: "Nozzle position",
    flowRate: "Flow rate",
    speed: "Rotation speed",
    pressure: "Pressure",
  };
  return {
    factor: result.factor,
    label: labels[result.factor] ?? result.factor,
    strength,
    samples: result.samples,
    correlation: result.correlation,
    copy:
      result.samples < 3
        ? `Too few illustrative records to compare ${labels[result.factor] ?? result.factor}.`
        : `${labels[result.factor] ?? result.factor}: ${strength} with observed spatial deviation across ${result.samples} illustrative records. Correlation does not establish a cause.`,
    illustrative: true as const,
    causalClaim: false as const,
  };
}
