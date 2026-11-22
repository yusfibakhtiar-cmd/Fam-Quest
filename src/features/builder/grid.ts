import { GRID_SIZE } from "../../game/world/constants";
import { CATALOG, type BuildingId } from "./catalog";

/** Quarter turns, 0..3. */
export type Rotation = 0 | 1 | 2 | 3;

/**
 * Persisted world object (TDD §5.2). Anchor convention: (gx, gz) is the tile with the
 * smallest x and z the object covers *after* rotation — i.e. its top-left corner tile.
 */
export type PlacedObject = {
  id: string;
  type: BuildingId;
  gx: number;
  gz: number;
  rotation: Rotation;
  level: number;
};

export type Footprint = { width: number; depth: number };

/** Odd quarter turns swap width and depth (a 4×3 garden becomes 3×4). */
export function rotatedFootprint(type: BuildingId, rotation: Rotation): Footprint {
  const { width, depth } = CATALOG[type].footprint;
  return rotation % 2 === 0 ? { width, depth } : { width: depth, depth: width };
}

export function tilesOf(gx: number, gz: number, fp: Footprint): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  for (let x = gx; x < gx + fp.width; x++) for (let z = gz; z < gz + fp.depth; z++) out.push([x, z]);
  return out;
}

const key = (x: number, z: number) => `${x},${z}`;

/** Set of occupied tiles from static blockers (scenery, path) plus placed objects. */
export function buildOccupancy(
  objects: PlacedObject[],
  staticBlocked: Iterable<[number, number]>,
  ignoreId?: string,
): Set<string> {
  const occ = new Set<string>();
  for (const [x, z] of staticBlocked) occ.add(key(x, z));
  for (const o of objects) {
    if (o.id === ignoreId) continue;
    for (const [x, z] of tilesOf(o.gx, o.gz, rotatedFootprint(o.type, o.rotation))) occ.add(key(x, z));
  }
  return occ;
}

export type PlacementCheck = { ok: true } | { ok: false; reason: "out_of_bounds" | "overlap" };

export function checkPlacement(
  type: BuildingId,
  gx: number,
  gz: number,
  rotation: Rotation,
  occupancy: Set<string>,
): PlacementCheck {
  const fp = rotatedFootprint(type, rotation);
  if (gx < 0 || gz < 0 || gx + fp.width > GRID_SIZE || gz + fp.depth > GRID_SIZE) {
    return { ok: false, reason: "out_of_bounds" };
  }
  for (const [x, z] of tilesOf(gx, gz, fp)) if (occupancy.has(key(x, z))) return { ok: false, reason: "overlap" };
  return { ok: true };
}

/** Anchor such that the footprint is centred on the pointed tile, clamped to stay on the land. */
export function anchorForPointer(tileX: number, tileZ: number, fp: Footprint): [number, number] {
  const gx = tileX - Math.floor((fp.width - 1) / 2);
  const gz = tileZ - Math.floor((fp.depth - 1) / 2);
  return [
    Math.min(GRID_SIZE - fp.width, Math.max(0, gx)),
    Math.min(GRID_SIZE - fp.depth, Math.max(0, gz)),
  ];
}
