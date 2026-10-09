import { describe, it, expect } from "vitest";
import { PerspectiveCamera, Vector3 } from "three";
import { blendProjection } from "./cameraMath";
import { cameraAt } from "./CameraDirector";
describe("projection continuity", () => {
  it("includes both the departing hero and next tyre in the mobile finale", () => {
    const camera = new PerspectiveCamera(42, 412 / 839, 0.1, 100);
    const pose = cameraAt(5, 1, "mobile");
    camera.position.set(...pose.position);
    camera.lookAt(new Vector3(...pose.target));
    camera.updateMatrixWorld();
    for (const x of [-1.47, 1.47, 2.53, 5.47]) {
      const point = new Vector3(x, 1.1, 0).project(camera);
      expect(Math.abs(point.x)).toBeLessThan(0.97);
    }
  });
  it("keeps the compact tablet analytical field inside the readable viewport", () => {
    const camera = new PerspectiveCamera(36, 900 / 1100, 0.1, 100);
    for (const scene of [3, 4]) {
      const pose = cameraAt(scene, 0.85, "tablet");
      camera.position.set(...pose.position);
      camera.lookAt(new Vector3(...pose.target));
      camera.fov = pose.fov;
      camera.updateProjectionMatrix();
      camera.updateMatrixWorld();
      camera.projectionMatrix.copy(
        blendProjection(
          camera.projectionMatrix,
          camera.position.distanceTo(new Vector3(...pose.target)),
          pose.fov,
          camera.aspect,
          0.1,
          100,
          1,
        ),
      );
      for (const x of [-1.74, 1.74])
        for (const y of [0.85, 1.85]) {
          const point = new Vector3(x, y, 0).project(camera);
          expect(Math.abs(point.x)).toBeLessThan(0.85);
          expect(Math.abs(point.y)).toBeLessThan(0.7);
        }
    }
  });
  it("preserves target-plane scale through perspective to orthographic and reverses exactly", () => {
    const camera = new PerspectiveCamera(36, 1.6, 0.1, 100);
    const original = camera.projectionMatrix.clone();
    const v = new Vector3(1, 0, -10);
    const a = v.clone().applyMatrix4(original);
    const middle = blendProjection(original, 10, 36, 1.6, 0.1, 100, 0.5);
    const end = blendProjection(original, 10, 36, 1.6, 0.1, 100, 1);
    expect(v.clone().applyMatrix4(middle).x).toBeCloseTo(a.x, 8);
    expect(v.clone().applyMatrix4(end).x).toBeCloseTo(a.x, 8);
    expect(
      blendProjection(original, 10, 36, 1.6, 0.1, 100, 0).elements,
    ).toEqual(original.elements);
    expect(
      blendProjection(original, 10, 36, 1.6, 0.1, 100, 1).elements,
    ).toEqual(end.elements);
  });
});
