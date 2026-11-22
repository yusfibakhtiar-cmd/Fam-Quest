import type { JSX } from "react";
import type { BuildingId } from "../../features/builder/catalog";
import { FruitTree } from "../objects/Nature";

/**
 * Low-poly placeholder buildings from primitives (TDD §9A), tropical-village style.
 * Each model is centred on the origin and sized to its rotation-0 footprint
 * (width along X, depth along Z, 2 world units per tile). Replace with glTF later.
 */

const WOOD = "#a1704a";
const WOOD_DARK = "#6d4c41";
const WALL = "#f3e5c8";
const ROOF = "#c8553d";
const STONE = "#9e9e9e";
const THATCH = "#c9a66b";

function HouseBasic() {
  // Rumah panggung: raised floor on stilts, woven walls, steep terracotta roof. 5×5 tiles = 10×10 units.
  const stilts: Array<[number, number]> = [[-3.2, -3.2], [3.2, -3.2], [-3.2, 3.2], [3.2, 3.2], [0, -3.2], [0, 3.2]];
  return (
    <group>
      {stilts.map(([x, z], i) => (
        <mesh key={i} position={[x, 0.5, z]} castShadow>
          <boxGeometry args={[0.35, 1, 0.35]} />
          <meshLambertMaterial color={WOOD_DARK} />
        </mesh>
      ))}
      <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[7.6, 0.25, 7.6]} />
        <meshLambertMaterial color={WOOD} />
      </mesh>
      <mesh position={[0, 2.5, -0.4]} castShadow receiveShadow>
        <boxGeometry args={[6.4, 2.6, 5.6]} />
        <meshLambertMaterial color={WALL} />
      </mesh>
      {/* Hip roof: 4-sided cone rotated 45° so its edges align with the walls */}
      <mesh position={[0, 5.0, -0.4]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[5.6, 2.6, 4]} />
        <meshLambertMaterial color={ROOF} flatShading />
      </mesh>
      {/* Door and windows face +Z (the front) */}
      <mesh position={[0, 2.1, 2.42]}>
        <boxGeometry args={[1.1, 1.8, 0.08]} />
        <meshLambertMaterial color={WOOD_DARK} />
      </mesh>
      {[-2, 2].map((x) => (
        <mesh key={x} position={[x, 2.8, 2.42]}>
          <boxGeometry args={[0.9, 0.8, 0.08]} />
          <meshLambertMaterial color="#5d8aa8" />
        </mesh>
      ))}
      {/* Front steps down to the ground */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, 0.85 - i * 0.3, 4.05 + i * 0.35]} castShadow>
          <boxGeometry args={[1.6, 0.15, 0.4]} />
          <meshLambertMaterial color={WOOD} />
        </mesh>
      ))}
    </group>
  );
}

function Well() {
  return (
    <group>
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1, 1.1, 0.8, 10, 1, true]} />
        <meshLambertMaterial color={STONE} flatShading side={2} />
      </mesh>
      <mesh position={[0, 0.55, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.95, 10]} />
        <meshLambertMaterial color="#3d7ea6" />
      </mesh>
      {[-1, 1].map((x) => (
        <mesh key={x} position={[x * 0.95, 1.2, 0]} castShadow>
          <boxGeometry args={[0.15, 2.4, 0.15]} />
          <meshLambertMaterial color={WOOD_DARK} />
        </mesh>
      ))}
      <mesh position={[0, 1.9, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.07, 0.07, 1.9, 6]} />
        <meshLambertMaterial color={WOOD} />
      </mesh>
      <mesh position={[0, 2.65, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[1.6, 0.8, 4]} />
        <meshLambertMaterial color={ROOF} flatShading />
      </mesh>
    </group>
  );
}

function VegetableGarden() {
  // 4×3 tiles = 8×6 units: raised beds with rows of crops and a low bamboo fence.
  const rows = [-2, 0, 2];
  return (
    <group>
      {rows.map((z) => (
        <group key={z} position={[0, 0, z]}>
          <mesh position={[0, 0.15, 0]} receiveShadow castShadow>
            <boxGeometry args={[6.8, 0.3, 1.2]} />
            <meshLambertMaterial color="#6d4c41" />
          </mesh>
          {Array.from({ length: 8 }, (_, i) => (
            <mesh key={i} position={[-3 + i * 0.86, 0.5, 0]} castShadow>
              <icosahedronGeometry args={[0.3, 0]} />
              <meshLambertMaterial color={i % 3 === 0 ? "#7cb342" : "#558b2f"} flatShading />
            </mesh>
          ))}
        </group>
      ))}
      {[
        { p: [0, 0.35, -2.85], s: [7.8, 0.08, 0.08] },
        { p: [0, 0.35, 2.85], s: [7.8, 0.08, 0.08] },
        { p: [-3.85, 0.35, 0], s: [0.08, 0.08, 5.7] },
        { p: [3.85, 0.35, 0], s: [0.08, 0.08, 5.7] },
      ].map((r, i) => (
        <mesh key={i} position={r.p as [number, number, number]}>
          <boxGeometry args={r.s as [number, number, number]} />
          <meshLambertMaterial color={THATCH} />
        </mesh>
      ))}
    </group>
  );
}

function Warehouse() {
  // 3×3 tiles = 6×6 units, gable roof made from a 3-sided prism.
  return (
    <group>
      <mesh position={[0, 1.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.8, 2.6, 4.4]} />
        <meshLambertMaterial color={WOOD} />
      </mesh>
      <mesh position={[0, 3.05, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[1.5, 1.5, 5.2, 3]} />
        <meshLambertMaterial color={THATCH} flatShading />
      </mesh>
      <mesh position={[0, 1.0, 2.22]}>
        <boxGeometry args={[1.8, 2, 0.08]} />
        <meshLambertMaterial color={WOOD_DARK} />
      </mesh>
    </group>
  );
}

function Gazebo() {
  const posts: Array<[number, number]> = [[-2, -2], [2, -2], [-2, 2], [2, 2]];
  return (
    <group>
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[5, 0.4, 5]} />
        <meshLambertMaterial color={WOOD} />
      </mesh>
      {posts.map(([x, z], i) => (
        <mesh key={i} position={[x, 1.5, z]} castShadow>
          <cylinderGeometry args={[0.13, 0.13, 2.4, 6]} />
          <meshLambertMaterial color={WOOD_DARK} />
        </mesh>
      ))}
      <mesh position={[0, 3.3, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[3.9, 1.6, 4]} />
        <meshLambertMaterial color={THATCH} flatShading />
      </mesh>
    </group>
  );
}

export const BUILDING_MODELS: Record<BuildingId, () => JSX.Element> = {
  house_basic: HouseBasic,
  well: Well,
  vegetable_garden: VegetableGarden,
  fruit_tree: FruitTree,
  warehouse: Warehouse,
  gazebo: Gazebo,
};
