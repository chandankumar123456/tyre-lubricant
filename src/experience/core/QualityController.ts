export function qualityProfile(width: number, lowPower: boolean) {
  return {
    dpr: lowPower
      ? 1
      : Math.min(window.devicePixelRatio || 1, width < 700 ? 1.25 : 1.75),
    shadows: !lowPower && width >= 900,
    segments: lowPower ? 64 : 128,
  };
}

/** Evaluate sustained frame cost throughout the journey, ignoring isolated pauses. */
export class FrameBudgetMonitor {
  private count = 0;
  private elapsed = 0;

  observe(deltaSeconds: number): boolean {
    this.count++;
    this.elapsed += Math.min(0.25, Math.max(0, deltaSeconds));
    if (this.count < 30 || this.elapsed < 2) return false;
    const exceeded = this.elapsed / this.count > 0.045;
    this.count = 0;
    this.elapsed = 0;
    return exceeded;
  }
}
