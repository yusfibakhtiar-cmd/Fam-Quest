import { create } from "zustand";

export type Screen = "home" | "quran" | "family";
export type Selection = { kind: "house" } | { kind: "tree"; memberId: string } | { kind: "garden" };

type UiState = {
  screen: Screen;
  selected: Selection | null;
  go: (s: Screen) => void;
  select: (s: Selection | null) => void;
};

export const useUiStore = create<UiState>((set) => ({
  screen: "home",
  selected: null,
  go: (screen) => set({ screen, selected: null }),
  select: (selected) => set({ selected }),
}));
