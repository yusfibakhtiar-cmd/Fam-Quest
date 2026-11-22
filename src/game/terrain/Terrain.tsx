import { useMemo } from "react";
import { BufferAttribute, Color, PlaneGeometry } from "three";
import { GRID_SIZE, TILE_SIZE, WORLD_SIZE, tileToWorld } from "../world/constants";
import { PATH_TILES } from "../world/scenery";
import { createRng } from "../../utils/random";

const SOIL_DEPTH = 2.4;
const GRASS_A = new Color("#7cb342");
const GRASS_B = new Color("#9ccc65");
const GRASS_C = new Color("#689f38");

/** Grass top with per-vertex colour noise — flat on purpose so the grid stays exact for placement. */
function useGrassGeometry() {
  return useMemo(() => {
    const segments = GRID_SIZE * 2;
    const geo = new PlaneGeometry(WORLD_SIZE, WORLD_SIZE, segments, segments);
    geo.rotateX(-Math.PI / 2);
    const rng = createRng(7);
    const count = geo.attributes.position.count;
    const colors = new Float32Array(count * 3);
    const c = new Color();
    for (let i = 0; i < count; i++) {
      const x = geo.attributes.position.getX(i);
      const z = geo.attributes.position.getZ(i);
      // Low-frequency patches plus a little per-vertex jitter.
      const patch = Math.sin(x * 0.23) * Math.cos(z * 0.19) * 0.5 + 0.5;
      c.copy(GRASS_A).lerp(GRASS_B, patch * 0.7);
      c.lerp(GRASS_C, rng() * 0.35);
      colors.set([c.r, c.g, c.b], i * 3);
    }
    geo.setAttribute("color", new BufferAttribute(colors, 3));
    return geo;
  }, []);
}

export function Terrain() {
  const grass = useGrassGeometry();

  return (
    <group>
      <mesh geometry={grass} receiveShadow>
        <meshLambertMaterial vertexColors />
      </mesh>

      {/* Soil block underneath: gives the land a "diorama" edge instead of a floating sheet. */}
      <mesh position={[0, -0.27, 0]} receiveShadow>
        <boxGeometry args={[WORLD_SIZE, 0.5, WORLD_SIZE]} />
        <meshLambertMaterial color="#6b8e23" />
      </mesh>
      <mesh position={[0, -0.5 - SOIL_DEPTH / 2, 0]}>
        <boxGeometry args={[WORLD_SIZE - 0.01, SOIL_DEPTH, WORLD_SIZE - 0.01]} />
        <meshLambertMaterial color="#8d6e63" />
      </mesh>

      {PATH_TILES.map(([gx, gz]) => {
        const [x, z] = tileToWorld(gx, gz);
        return (
          <mesh key={`${gx},${gz}`} position={[x, 0.02, z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[TILE_SIZE, TILE_SIZE]} />
            <meshLambertMaterial color="#d7b98e" />
          </mesh>
        );
      })}
    </group>
  );
}
