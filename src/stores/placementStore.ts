import { create } from "zustand";
import type { BuildingId } from "../features/builder/catalog";
import { anchorForPointer, rotatedFootprint, type Rotation } from "../features/builder/grid";
import { GRID_SIZE } from "../game/world/constants";

type PlacementState = {
  menuOpen: boolean;
  /** Blueprint currently being placed; null = not in placement mode. */
  activeType: BuildingId | null;
  rotation: Rotation;
  gx: number;
  gz: number;
  /** Tile the pointer last aimed at, so rotating keeps the ghost under the finger. */
  pointerTile: [number, number];

  openMenu: () => void;
  closeMenu: () => void;
  start: (type: BuildingId) => void;
  cancel: () => void;
  rotate: () => void;
  aimAt: (tileX: number, tileZ: number) => void;
};

const CENTER = Math.floor(GRID_SIZE / 2);

export const usePlacementStore = create<PlacementState>((set, get) => ({
  menuOpen: false,
  activeType: null,
  rotation: 0,
  gx: 0,
  gz: 0,
  pointerTile: [CENTER, CENTER],

  openMenu: () => set({ menuOpen: true }),
  closeMenu: () => set({ menuOpen: false }),
  start: (type) => {
    set({ activeType: type, rotation: 0, menuOpen: false });
    const [x, z] = get().pointerTile;
    get().aimAt(x, z);
  },
  cancel: () => set({ activeType: null }),
  rotate: () => {
    set((s) => ({ rotation: ((s.rotation + 1) % 4) as Rotation }));
    const [x, z] = get().pointerTile;
    get().aimAt(x, z);
  },
  aimAt: (tileX, tileZ) => {
    const { activeType, rotation } = get();
    if (!activeType) return set({ pointerTile: [tileX, tileZ] });
    const [gx, gz] = anchorForPointer(tileX, tileZ, rotatedFootprint(activeType, rotation));
    set({ pointerTile: [tileX, tileZ], gx, gz });
  },
}));
