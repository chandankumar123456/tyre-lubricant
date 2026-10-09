import { scenes } from "./SceneRegistry";
import { clamp } from "./ExperienceClock";
const total = () => scenes.reduce((sum, s) => sum + s.weight, 0);
export function sceneRange(index: number): [number, number] {
  const before = scenes.slice(0, index).reduce((sum, s) => sum + s.weight, 0);
  return [before / total(), (before + scenes[index].weight) / total()];
}
export function resolveJourney(value: number) {
  const progress = clamp(value);
  let sceneIndex = scenes.findIndex((_, i) => progress < sceneRange(i)[1]);
  if (sceneIndex < 0) sceneIndex = scenes.length - 1;
  const [start, end] = sceneRange(sceneIndex);
  return {
    progress,
    sceneIndex,
    sceneId: scenes[sceneIndex].id,
    localProgress: clamp((progress - start) / (end - start)),
    previousScene: scenes[sceneIndex - 1]?.id,
    nextScene: scenes[sceneIndex + 1]?.id,
  };
}
export function beatAt(sceneIndex: number, p: number) {
  return (
    [...scenes[sceneIndex].beats].reverse().find((b) => p >= b.start) ??
    scenes[sceneIndex].beats[0]
  );
}
