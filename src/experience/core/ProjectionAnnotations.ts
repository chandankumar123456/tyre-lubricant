import type { Camera, Vector3 } from "three";
import {
  hasAnnotation,
  setAnnotationPosition,
  setAnnotationVisible,
  type AnnotationKey,
} from "./AnnotationRegistry";

/** Projects a world point into a registered annotation. Mutates `point` into NDC. */
export function projectCaption(
  key: AnnotationKey,
  point: Vector3,
  camera: Camera,
  size: { width: number; height: number },
  visible: boolean,
) {
  if (!hasAnnotation(key)) return false;
  point.project(camera);
  const inFrame =
    visible &&
    Number.isFinite(point.x) &&
    Number.isFinite(point.y) &&
    Math.abs(point.x) <= 1 &&
    Math.abs(point.y) <= 1 &&
    point.z > -1 &&
    point.z < 1;
  setAnnotationVisible(key, inFrame);
  if (inFrame)
    setAnnotationPosition(
      key,
      ((point.x + 1) * size.width) / 2,
      ((1 - point.y) * size.height) / 2,
    );
  return inFrame;
}
