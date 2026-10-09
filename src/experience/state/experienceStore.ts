import { create } from "zustand";
export interface ExperienceState {
  sceneIndex: number;
  beatId: string;
  reducedMotion: boolean;
  lowPower: boolean;
  webglAvailable: boolean;
  assetsReady: boolean;
  candidateNozzle: number;
  candidateFlow: number;
  setCandidateNozzle: (value: number) => void;
  setCandidateFlow: (value: number) => void;
  setSemantic: (sceneIndex: number, beatId: string) => void;
  setReducedMotion: (value: boolean) => void;
  setLowPower: (value: boolean) => void;
  setWebgl: (value: boolean) => void;
  setReady: () => void;
}
export const useExperienceStore = create<ExperienceState>((set) => ({
  sceneIndex: 0,
  beatId: "",
  reducedMotion: false,
  lowPower: false,
  webglAvailable: true,
  assetsReady: false,
  candidateNozzle: 0.5,
  candidateFlow: 1,
  setCandidateNozzle: (candidateNozzle) => set({ candidateNozzle }),
  setCandidateFlow: (candidateFlow) => set({ candidateFlow }),
  setSemantic: (sceneIndex, beatId) => set({ sceneIndex, beatId }),
  setReducedMotion: (reducedMotion) => set({ reducedMotion }),
  setLowPower: (lowPower) => set({ lowPower }),
  setWebgl: (webglAvailable) => set({ webglAvailable }),
  setReady: () => set({ assetsReady: true }),
}));
