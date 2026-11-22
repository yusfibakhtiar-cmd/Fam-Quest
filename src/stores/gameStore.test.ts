import { beforeEach, describe, expect, it } from "vitest";
import { useGameStore } from "./gameStore";
import { EMPTY_MATERIALS } from "../features/inventory/materials";

const reset = () =>
  useGameStore.setState({ materials: { ...EMPTY_MATERIALS }, unlockedBlueprints: [], rewardClaims: [], objects: [] });

describe("game store", () => {
  beforeEach(reset);

  it("grants an achievement reward only once", () => {
    const g = useGameStore.getState();
    expect(g.grantAchievement("water_keeper")).toBe(true);
    expect(g.grantAchievement("water_keeper")).toBe(false);
    const s = useGameStore.getState();
    expect(s.materials).toMatchObject({ wood: 10, stone: 8 });
    expect(s.unlockedBlueprints).toEqual(["well"]);
  });

  it("refuses locked blueprints", () => {
    expect(useGameStore.getState().placeBuilding("well", 8, 8, 0)).toEqual({ ok: false, reason: "locked" });
  });

  it("deducts materials exactly once on successful placement", () => {
    const g = useGameStore.getState();
    g.grantStarterRewards();
    const r = g.placeBuilding("house_basic", 7, 7, 0);
    expect(r.ok).toBe(true);
    const s = useGameStore.getState();
    expect(s.materials).toEqual({ wood: 2, stone: 0, brick: 0, seeds: 6 });
    expect(s.objects).toHaveLength(1);
  });

  it("does not charge for an invalid placement", () => {
    const g = useGameStore.getState();
    g.grantStarterRewards();
    g.placeBuilding("fruit_tree", 7, 7, 0);
    const before = useGameStore.getState().materials;
    expect(g.placeBuilding("fruit_tree", 7, 7, 0)).toEqual({ ok: false, reason: "overlap" });
    expect(useGameStore.getState().materials).toEqual(before);
  });

  it("refuses when materials run out", () => {
    const g = useGameStore.getState();
    g.grantStarterRewards();
    g.placeBuilding("fruit_tree", 7, 7, 0);
    g.placeBuilding("fruit_tree", 8, 7, 0);
    expect(g.placeBuilding("fruit_tree", 9, 7, 0)).toEqual({ ok: false, reason: "insufficient" });
  });
});
