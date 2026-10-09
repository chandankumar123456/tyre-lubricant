export const clamp = (n: number, a = 0, b = 1) => Math.max(a, Math.min(b, n));
export const smooth = (n: number) => {
  const t = clamp(n);
  return t * t * (3 - 2 * t);
};
export const segment = (p: number, a: number, b: number) =>
  smooth((p - a) / (b - a));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export class ExperienceClock {
  target = 0;
  progress = 0;
  delta = 0;
  velocity = 0;
  direction = 1;
  setTarget(value: number) {
    this.target = clamp(value);
  }
  tick(dt: number, immediate = false) {
    this.delta = Math.min(Math.max(dt, 0), 0.05);
    const previous = this.progress;
    this.progress = immediate
      ? this.target
      : lerp(previous, this.target, 1 - Math.exp(-12 * this.delta));
    this.velocity = this.delta ? (this.progress - previous) / this.delta : 0;
    if (Math.abs(this.velocity) > 1e-7)
      this.direction = Math.sign(this.velocity);
    return this.progress;
  }
}
export const experienceClock = new ExperienceClock();
