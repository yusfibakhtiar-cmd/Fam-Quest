import { create } from "zustand";
import { ACHIEVEMENTS } from "../features/achievements/definitions";
import { CATALOG, type BuildingId } from "../features/builder/catalog";
import { buildOccupancy, checkPlacement, type PlacedObject, type Rotation } from "../features/builder/grid";
import { add, canAfford, EMPTY_MATERIALS, subtract, type Materials } from "../features/inventory/materials";
import { STATIC_BLOCKED } from "../game/world/scenery";

export type PlaceResult =
  | { ok: true; object: PlacedObject }
  | { ok: false; reason: "locked" | "insufficient" | "out_of_bounds" | "overlap" };

/** TDD §5 reward_claims: one row per achievement ever granted. */
export type RewardClaim = {
  achievementId: string;
  claimedAt: string;
  /** Quest whose approval earned it; absent for the starter reward and dev claims. */
  questId?: string;
  approvedBy?: string;
};

type GameState = {
  materials: Materials;
  unlockedBlueprints: BuildingId[];
  /** Guards "reward belum pernah diberikan": an achievement appears here at most once. */
  rewardClaims: RewardClaim[];
  objects: PlacedObject[];

  /** Grant an achievement's reward exactly once. Returns false if already claimed / unknown. */
  grantAchievement: (id: string, source?: { questId: string; approvedBy: string }) => boolean;
  grantStarterRewards: () => void;
  placeBuilding: (type: BuildingId, gx: number, gz: number, rotation: Rotation) => PlaceResult;
};

let nextId = 1;
const newObjectId = () => `obj-${Date.now().toString(36)}-${(nextId++).toString(36)}`;

export const useGameStore = create<GameState>((set, get) => ({
  materials: { ...EMPTY_MATERIALS },
  unlockedBlueprints: [],
  rewardClaims: [],
  objects: [],

  grantAchievement: (id, source) => {
    const def = ACHIEVEMENTS.find((a) => a.id === id);
    const s = get();
    if (!def || s.rewardClaims.some((c) => c.achievementId === id)) return false;
    set({
      rewardClaims: [...s.rewardClaims, { achievementId: id, claimedAt: new Date().toISOString(), ...source }],
      materials: add(s.materials, def.reward.materials),
      unlockedBlueprints: [...new Set([...s.unlockedBlueprints, ...def.reward.blueprints])],
    });
    return true;
  },

  grantStarterRewards: () => {
    for (const a of ACHIEVEMENTS) if (a.starter) get().grantAchievement(a.id);
  },

  // Validation and the material deduction happen in one synchronous update, so a
  // building can never be placed without paying, or paid for without being placed.
  placeBuilding: (type, gx, gz, rotation) => {
    const s = get();
    if (!s.unlockedBlueprints.includes(type)) return { ok: false, reason: "locked" };
    const cost = CATALOG[type].constructionCost;
    if (!canAfford(s.materials, cost)) return { ok: false, reason: "insufficient" };
    const check = checkPlacement(type, gx, gz, rotation, buildOccupancy(s.objects, STATIC_BLOCKED));
    if (!check.ok) return check;
    const object: PlacedObject = { id: newObjectId(), type, gx, gz, rotation, level: 1 };
    set({ objects: [...s.objects, object], materials: subtract(s.materials, cost) });
    return { ok: true, object };
  },
}));
