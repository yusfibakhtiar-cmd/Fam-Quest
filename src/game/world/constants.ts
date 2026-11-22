/** World dimensions — see TDD §3.1. Grid coordinates are integer tile indices 0..GRID_SIZE-1. */
export const GRID_SIZE = 20;
export const TILE_SIZE = 2;
export const WORLD_SIZE = GRID_SIZE * TILE_SIZE; // 40 world units
export const HALF_WORLD = WORLD_SIZE / 2;

/** Centre of tile (gx, gz) in world space. The land is centred on the origin. */
export function tileToWorld(gx: number, gz: number): [number, number] {
  return [
    -HALF_WORLD + gx * TILE_SIZE + TILE_SIZE / 2,
    -HALF_WORLD + gz * TILE_SIZE + TILE_SIZE / 2,
  ];
}

/** Camera tuning. Zoom is pixels per world unit (orthographic). */
export const CAMERA = {
  elevationDeg: 40, // TDD: 35–45°
  distance: 80,
  minZoom: 5,
  maxZoom: 70,
  /** How far beyond the land edge the camera target may pan. */
  panMargin: 4,
} as const;
