import { describe, expect, it } from "vitest";
import { anchorForPointer, buildOccupancy, checkPlacement, rotatedFootprint, type PlacedObject } from "./grid";

const house: PlacedObject = { id: "h", type: "house_basic", gx: 5, gz: 5, rotation: 0, level: 1 };

describe("grid placement", () => {
  it("swaps footprint on odd rotations", () => {
    expect(rotatedFootprint("vegetable_garden", 0)).toEqual({ width: 4, depth: 3 });
    expect(rotatedFootprint("vegetable_garden", 1)).toEqual({ width: 3, depth: 4 });
    expect(rotatedFootprint("vegetable_garden", 2)).toEqual({ width: 4, depth: 3 });
  });

  it("rejects overlap, accepts edge-adjacent", () => {
    const occ = buildOccupancy([house], []);
    expect(checkPlacement("well", 9, 9, 0, occ)).toEqual({ ok: false, reason: "overlap" }); // corner shares tile 9,9
    expect(checkPlacement("well", 10, 5, 0, occ)).toEqual({ ok: true }); // touches house's right edge
  });

  it("rejects out of bounds, including after rotation", () => {
    const occ = new Set<string>();
    expect(checkPlacement("vegetable_garden", 16, 0, 0, occ)).toEqual({ ok: true });
    expect(checkPlacement("vegetable_garden", 17, 0, 0, occ).ok).toBe(false);
    expect(checkPlacement("vegetable_garden", 17, 0, 1, occ)).toEqual({ ok: true }); // 3 wide when rotated
    expect(checkPlacement("well", -1, 0, 0, occ).ok).toBe(false);
  });

  it("treats static blockers as occupied", () => {
    const occ = buildOccupancy([], [[3, 3]]);
    expect(checkPlacement("fruit_tree", 3, 3, 0, occ).ok).toBe(false);
  });

  it("can ignore an object (for future move)", () => {
    const occ = buildOccupancy([house], [], "h");
    expect(checkPlacement("house_basic", 5, 5, 0, occ)).toEqual({ ok: true });
  });

  it("centres and clamps the anchor", () => {
    expect(anchorForPointer(10, 10, { width: 5, depth: 5 })).toEqual([8, 8]);
    expect(anchorForPointer(0, 19, { width: 5, depth: 5 })).toEqual([0, 15]);
  });
});
