import { useMemo } from "react";
import { BufferGeometry, Float32BufferAttribute } from "three";
import { GRID_SIZE, HALF_WORLD, TILE_SIZE } from "../world/constants";

/** Tile grid lines — the same grid Milestone 2 uses for placement and collision. */
export function GridOverlay() {
  const geometry = useMemo(() => {
    const pts: number[] = [];
    for (let i = 0; i <= GRID_SIZE; i++) {
      const p = -HALF_WORLD + i * TILE_SIZE;
      pts.push(p, 0, -HALF_WORLD, p, 0, HALF_WORLD);
      pts.push(-HALF_WORLD, 0, p, HALF_WORLD, 0, p);
    }
    const g = new BufferGeometry();
    g.setAttribute("position", new Float32BufferAttribute(pts, 3));
    return g;
  }, []);

  return (
    <lineSegments geometry={geometry} position={[0, 0.04, 0]}>
      <lineBasicMaterial color="#ffffff" transparent opacity={0.35} />
    </lineSegments>
  );
}
