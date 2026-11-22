import type { BuildingId } from "../../features/builder/catalog";
import { rotatedFootprint, type Rotation } from "../../features/builder/grid";
import { HALF_WORLD, TILE_SIZE } from "../world/constants";

/** World-space centre of an object's footprint. Rotation turns the model around this point. */
export function footprintCenter(type: BuildingId, gx: number, gz: number, rotation: Rotation): [number, number] {
  const fp = rotatedFootprint(type, rotation);
  return [
    -HALF_WORLD + (gx + fp.width / 2) * TILE_SIZE,
    -HALF_WORLD + (gz + fp.depth / 2) * TILE_SIZE,
  ];
}

export function worldToTile(x: number, z: number): [number, number] {
  return [Math.floor((x + HALF_WORLD) / TILE_SIZE), Math.floor((z + HALF_WORLD) / TILE_SIZE)];
}

export const rotationRadians = (r: Rotation) => -r * (Math.PI / 2);
