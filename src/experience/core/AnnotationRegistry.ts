/**
 * Screen-space annotation registry. DOM overlays register stable element refs under keys; the R3F
 * frame loop (the single timing authority) writes to the cached elements. Every write is skipped
 * when the formatted value did not change, so an idle scene produces no DOM mutations.
 */
export type AnnotationKey =
  | "caption-normal-mean"
  | "caption-normal-variation"
  | "caption-process-expectation"
  | "caption-hero-measurement-shell"
  | "deviation-legend"
  | "encoder-angle"
  | "encoder-coverage";

export interface AnnotationOptions {
  /** CSS translate applied after the projected position (the element's own anchor). */
  anchor?: string;
  /** `display` value used while the annotation is shown. */
  display?: string;
}

interface Entry {
  element: HTMLElement;
  anchor: string;
  display: string;
  shown: boolean | null;
  x: number;
  y: number;
  text: string | null;
  transform: string | null;
  width: number;
}

const entries = new Map<AnnotationKey, Entry>();
const callbacks = new Map<AnnotationKey, (element: HTMLElement | null) => void>();

/** Stable React ref callback for an annotation element; `null` on unmount releases the entry. */
export function annotationRef(
  key: AnnotationKey,
  options: AnnotationOptions = {},
): (element: HTMLElement | null) => void {
  let callback = callbacks.get(key);
  if (!callback) {
    callback = (element) => {
      const current = entries.get(key);
      if (!element) {
        entries.delete(key);
        return;
      }
      if (current?.element === element) return;
      entries.set(key, {
        element,
        anchor: options.anchor ?? "",
        display: options.display ?? "block",
        shown: null,
        x: Number.NaN,
        y: Number.NaN,
        text: null,
        transform: null,
        width: Number.NaN,
      });
    };
    callbacks.set(key, callback);
  }
  return callback;
}

export function hasAnnotation(key: AnnotationKey) {
  return entries.has(key);
}

export function setAnnotationVisible(key: AnnotationKey, shown: boolean) {
  const entry = entries.get(key);
  if (!entry || entry.shown === shown) return;
  entry.shown = shown;
  entry.element.style.display = shown ? entry.display : "none";
}

const quantize = (n: number) => Math.round(n * 4) / 4;

/** Places an annotation at a viewport pixel position with a transform-only write. */
export function setAnnotationPosition(key: AnnotationKey, x: number, y: number) {
  const entry = entries.get(key);
  if (!entry) return;
  const qx = quantize(x),
    qy = quantize(y);
  if (qx === entry.x && qy === entry.y) return;
  if (Number.isNaN(entry.x)) {
    entry.element.style.left = "0px";
    entry.element.style.top = "0px";
  }
  entry.x = qx;
  entry.y = qy;
  entry.element.style.transform = `translate3d(${qx}px,${qy}px,0) ${entry.anchor}`;
}

export function setAnnotationWidth(key: AnnotationKey, width: number) {
  const entry = entries.get(key);
  if (!entry) return;
  const rounded = Math.round(width);
  if (rounded === entry.width) return;
  entry.width = rounded;
  entry.element.style.width = rounded + "px";
}

export function setAnnotationText(key: AnnotationKey, text: string) {
  const entry = entries.get(key);
  if (!entry || entry.text === text) return;
  entry.text = text;
  entry.element.textContent = text;
}

/** Writes a full CSS transform (e.g. `scaleX(..)`) for non-projected elements. */
export function setAnnotationTransform(key: AnnotationKey, transform: string) {
  const entry = entries.get(key);
  if (!entry || entry.transform === transform) return;
  entry.transform = transform;
  entry.element.style.transform = transform;
}

/** Per-frame telemetry published by the R3F loop. Reused object: copy what you keep. */
export interface FrameTelemetry {
  now: number;
  progress: number;
  localProgress: number;
  sceneId: string;
  beatId: string;
  frameMs: string;
  fps: string;
  quality: string;
  camera: string;
  theta: string;
  unwrap: string;
  drawCalls: number;
  triangles: number;
}
type FrameSubscriber = (telemetry: Readonly<FrameTelemetry>) => void;
const subscribers = new Set<FrameSubscriber>();
export function subscribeFrame(subscriber: FrameSubscriber) {
  subscribers.add(subscriber);
  return () => {
    subscribers.delete(subscriber);
  };
}
export function hasFrameSubscribers() {
  return subscribers.size > 0;
}
export function publishFrame(telemetry: Readonly<FrameTelemetry>) {
  for (const subscriber of subscribers) subscriber(telemetry);
}
