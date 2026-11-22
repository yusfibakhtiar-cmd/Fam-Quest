import { create } from "zustand";

type CameraState = {
  /** Quarter-turn counter (TDD §3.3: 4 directions). Unbounded so the animation always turns the short way. */
  rotationStep: number;
  /** Bumped to request a reset / zoom change; the camera rig reacts to the change. */
  resetToken: number;
  zoomRequest: { factor: number; token: number };
  showGrid: boolean;
  rotate: (dir: 1 | -1) => void;
  zoomBy: (factor: number) => void;
  reset: () => void;
  toggleGrid: () => void;
};

export const useCameraStore = create<CameraState>((set) => ({
  rotationStep: 0,
  resetToken: 0,
  zoomRequest: { factor: 1, token: 0 },
  showGrid: false,
  rotate: (dir) => set((s) => ({ rotationStep: s.rotationStep + dir })),
  zoomBy: (factor) => set((s) => ({ zoomRequest: { factor, token: s.zoomRequest.token + 1 } })),
  // Snap back to the nearest "north-facing" step so reset never spins more than half a turn.
  reset: () =>
    set((s) => ({ resetToken: s.resetToken + 1, rotationStep: Math.round(s.rotationStep / 4) * 4 })),
  toggleGrid: () => set((s) => ({ showGrid: !s.showGrid })),
}));
