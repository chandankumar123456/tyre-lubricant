export interface DriftState {
  persistent: boolean;
  direction: "rising" | "stable";
  magnitude: number;
  illustrative: true;
  windowSize: number;
}
// Prototype persistence rule; these are illustrative thresholds, not validated production limits.
export function detectDrift(signal: number[], windowSize = 4): DriftState {
  const recent = signal.slice(-windowSize);
  const baseline =
    signal.length > windowSize
      ? signal.slice(0, -windowSize).reduce((sum, v) => sum + v, 0) /
        (signal.length - windowSize)
      : (signal[0] ?? 0);
  const magnitude = recent.length
    ? recent.reduce((sum, v) => sum + v, 0) / recent.length - baseline
    : 0;
  const persistent =
    recent.length === windowSize &&
    recent.every((value) => value > baseline + 0.08);
  return {
    persistent,
    direction: persistent ? "rising" : "stable",
    magnitude,
    illustrative: true,
    windowSize,
  };
}
