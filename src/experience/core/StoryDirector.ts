import { beatAt, resolveJourney } from "./JourneyController";
import { useExperienceStore } from "../state/experienceStore";
export function directStory(progress: number) {
  const j = resolveJourney(progress);
  const beat = beatAt(j.sceneIndex, j.localProgress);
  const state = useExperienceStore.getState();
  if (state.sceneIndex !== j.sceneIndex || state.beatId !== beat.id)
    state.setSemantic(j.sceneIndex, beat.id);
  return { ...j, beat };
}
