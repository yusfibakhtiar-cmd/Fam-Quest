import { create } from "zustand";

export type Screen = "world" | "quests" | "family";

export const useUiStore = create<{ screen: Screen; go: (s: Screen) => void }>((set) => ({
  screen: "world", // TDD §6: My World is the first screen
  go: (screen) => set({ screen }),
}));
