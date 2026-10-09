import {
  setAnnotationText,
  setAnnotationTransform,
} from "./AnnotationRegistry";
import { experienceClock } from "./ExperienceClock";
import { resolveJourney } from "./JourneyController";
import { worldAt } from "../world/WorldDirector";

/** Encoder angle text and coverage bar; no-ops while the Scene 01 overlay is unmounted. */
export function writeEncoderReadout(rotation: number, acquisition: number) {
  setAnnotationText(
    "encoder-angle",
    ((rotation * 180) / Math.PI).toFixed(0) + "°",
  );
  setAnnotationTransform(
    "encoder-coverage",
    `scaleX(${acquisition.toFixed(4)})`,
  );
}

/** Seeds a freshly mounted readout from the current clock so it never shows a stale first frame. */
export function seedEncoderReadout() {
  const j = resolveJourney(experienceClock.progress),
    s = worldAt(j.sceneIndex, j.localProgress);
  writeEncoderReadout(s.rotation, s.acquisition);
}
