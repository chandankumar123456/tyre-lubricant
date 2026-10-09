import { describe, expect, it } from "vitest";
import { OrthographicCamera, Vector3 } from "three";
import { annotationRef } from "./AnnotationRegistry";
import { projectCaption } from "./ProjectionAnnotations";

describe("projected annotation visibility", () => {
  it("projects an in-frame world anchor and hides anchors outside the frustum", () => {
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 5;
    camera.updateMatrixWorld();
    const element = { style: {} } as HTMLElement;
    const ref = annotationRef("caption-normal-variation");
    ref(element);
    const size = { width: 800, height: 600 };
    expect(
      projectCaption("caption-normal-variation", new Vector3(), camera, size, true),
    ).toBe(true);
    expect(element.style.transform).toContain("translate3d(400px,300px,0)");
    for (const point of [
      new Vector3(2, 0, 0),
      new Vector3(0, 2, 0),
      new Vector3(0, 0, 6),
      new Vector3(Number.NaN, 0, 0),
    ]) {
      expect(
        projectCaption("caption-normal-variation", point, camera, size, true),
      ).toBe(false);
      expect(element.style.display).toBe("none");
    }
    expect(
      projectCaption("caption-normal-variation", new Vector3(), camera, size, false),
    ).toBe(false);
    ref(null);
  });
});
