import { GRID_SIZE } from "./constants";
import { createRng } from "../../utils/random";

export type SceneryType = "palm" | "fruitTree" | "bush" | "rock";

/**
 * Decorative scenery as plain data on the same grid buildings will use.
 * Milestone 2's placement system must treat these tiles as occupied (or let the player clear them).
 */
export type SceneryItem = {
  id: string;
  type: SceneryType;
  gx: number;
  gz: number;
  rotation: number; // radians, visual only
  scale: number;
};

/** Dirt path from the front edge toward the centre (TDD §3.1 "jalan"). */
export const PATH_TILES: Array<[number, number]> = [];
for (let gz = 13; gz < GRID_SIZE; gz++) PATH_TILES.push([9, gz], [10, gz]);

const SEED = 20261122;

function generateScenery(): SceneryItem[] {
  const rng = createRng(SEED);
  const taken = new Set(PATH_TILES.map(([x, z]) => `${x},${z}`));
  const items: SceneryItem[] = [];

  const add = (type: SceneryType, gx: number, gz: number, scaleMin = 0.85, scaleMax = 1.15) => {
    const key = `${gx},${gz}`;
    if (taken.has(key)) return;
    taken.add(key);
    items.push({
      id: `scenery-${items.length}`,
      type,
      gx,
      gz,
      rotation: rng() * Math.PI * 2,
      scale: scaleMin + rng() * (scaleMax - scaleMin),
    });
  };

  // Trees cluster along the border ring so the centre stays open for building.
  for (let gx = 0; gx < GRID_SIZE; gx++) {
    for (let gz = 0; gz < GRID_SIZE; gz++) {
      const edgeDist = Math.min(gx, gz, GRID_SIZE - 1 - gx, GRID_SIZE - 1 - gz);
      const r = rng();
      if (edgeDist === 0 && r < 0.38) add(r < 0.2 ? "palm" : "fruitTree", gx, gz);
      else if (edgeDist === 1 && r < 0.14) add(r < 0.06 ? "palm" : "bush", gx, gz, 0.7, 1.1);
      else if (edgeDist >= 3 && r < 0.025) add(r < 0.012 ? "rock" : "bush", gx, gz, 0.6, 1.0);
    }
  }
  return items;
}

export const SCENERY: SceneryItem[] = generateScenery();

/** Tiles no building may use in Milestone 2 (clearing trees is a later feature). */
export const STATIC_BLOCKED: Array<[number, number]> = [
  ...PATH_TILES,
  ...SCENERY.map((s) => [s.gx, s.gz] as [number, number]),
];
