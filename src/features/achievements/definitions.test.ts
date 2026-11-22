import { describe, expect, it } from "vitest";
import { ACHIEVEMENTS } from "./definitions";
import { CATALOG, CATALOG_ORDER } from "../builder/catalog";
import { canAfford, EMPTY_MATERIALS, add } from "../inventory/materials";

describe("reward economy invariants", () => {
  it.each(ACHIEVEMENTS)("$id grants enough material to build each blueprint it unlocks", (a) => {
    const granted = add(EMPTY_MATERIALS, a.reward.materials);
    for (const b of a.reward.blueprints) expect(canAfford(granted, CATALOG[b].constructionCost)).toBe(true);
  });

  it("every catalog building is unlocked by exactly one achievement", () => {
    const unlocks = ACHIEVEMENTS.flatMap((a) => a.reward.blueprints);
    expect([...unlocks].sort()).toEqual([...CATALOG_ORDER].sort());
  });

  it("starter reward covers the first house", () => {
    const starter = ACHIEVEMENTS.filter((a) => a.starter);
    expect(starter).toHaveLength(1);
    expect(canAfford(add(EMPTY_MATERIALS, starter[0].reward.materials), CATALOG.house_basic.constructionCost)).toBe(true);
  });
});
