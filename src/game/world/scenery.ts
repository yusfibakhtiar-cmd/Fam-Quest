import { GRID_SIZE } from "./constants";
import { createRng } from "../../utils/random";

export type SceneryType = "palm" | "fruitTree" | "bush" | "rock";

/**
 * Decorative scenery as plain data on the same grid buildings will use.
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
for (let gz = 15; gz < GRID_SIZE; gz++) PATH_TILES.push([9, gz], [10, gz]);

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

  // Scenery stays on the border ring; the centre belongs to the family's own elements.
  for (let gx = 0; gx < GRID_SIZE; gx++) {
    for (let gz = 0; gz < GRID_SIZE; gz++) {
      const edgeDist = Math.min(gx, gz, GRID_SIZE - 1 - gx, GRID_SIZE - 1 - gz);
      const r = rng();
      if (edgeDist === 0 && r < 0.38) add(r < 0.24 ? "palm" : "bush", gx, gz); // no fruit trees: fruit means a family tree
      else if (edgeDist === 1 && r < 0.14) add(r < 0.06 ? "palm" : "bush", gx, gz, 0.7, 1.1);
    }
  }
  return items;
}

export const SCENERY: SceneryItem[] = generateScenery();

