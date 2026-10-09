import { describe, expect, it } from "vitest";
import {
  annotationRef,
  publishFrame,
  setAnnotationPosition,
  setAnnotationText,
  setAnnotationVisible,
  subscribeFrame,
  type FrameTelemetry,
} from "./AnnotationRegistry";

function fakeElement() {
  let writes = 0;
  const style = new Proxy({} as Record<string, string>, {
    set(target, key, value) {
      writes++;
      target[key as string] = value;
      return true;
    },
  });
  let text = "";
  return {
    style,
    get textContent() {
      return text;
    },
    set textContent(value: string) {
      writes++;
      text = value;
    },
    get writes() {
      return writes;
    },
  };
}

describe("screen-space annotation registry", () => {
  it("returns stable ref callbacks and skips unchanged writes", () => {
    const ref = annotationRef("caption-normal-mean", {
      anchor: "translate(-50%,-100%)",
    });
    expect(annotationRef("caption-normal-mean")).toBe(ref);
    const element = fakeElement();
    ref(element as unknown as HTMLElement);
    setAnnotationVisible("caption-normal-mean", true);
    setAnnotationPosition("caption-normal-mean", 100.1, 50);
    const afterFirst = element.writes;
    expect(element.style.display).toBe("block");
    expect(element.style.transform).toBe(
      "translate3d(100px,50px,0) translate(-50%,-100%)",
    );
    setAnnotationVisible("caption-normal-mean", true);
    setAnnotationPosition("caption-normal-mean", 100.05, 50.01);
    expect(element.writes).toBe(afterFirst);
    ref(null);
    setAnnotationPosition("caption-normal-mean", 10, 10);
    expect(element.writes).toBe(afterFirst);
  });
  it("rewrites a remounted element from a clean cache", () => {
    const ref = annotationRef("encoder-angle");
    const first = fakeElement();
    ref(first as unknown as HTMLElement);
    setAnnotationText("encoder-angle", "120°");
    ref(null);
    const second = fakeElement();
    ref(second as unknown as HTMLElement);
    setAnnotationText("encoder-angle", "120°");
    expect(second.textContent).toBe("120°");
    setAnnotationText("encoder-angle", "120°");
    expect(second.writes).toBe(1);
  });
  it("delivers frame telemetry to subscribers until unsubscribed", () => {
    const seen: number[] = [];
    const unsubscribe = subscribeFrame((t) => seen.push(t.progress));
    publishFrame({ progress: 0.25 } as FrameTelemetry);
    unsubscribe();
    publishFrame({ progress: 0.5 } as FrameTelemetry);
    expect(seen).toEqual([0.25]);
  });
});
