import { memo } from "react";
import { tileToWorld } from "../world/constants";
import { SCENERY, type SceneryItem } from "../world/scenery";

/**
 * Placeholder low-poly scenery built from primitives (TDD §9A).
 * Swap for glTF models later without touching the scenery data.
 */

const TRUNK = "#8d6e63";
const LEAF_DARK = "#2e7d32";
const LEAF = "#43a047";
const PALM_LEAF = "#558b2f";

function Palm() {
  const fronds = 7;
  return (
    <group>
      {/* Slightly leaning, segmented trunk */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[i * 0.08, 0.45 + i * 0.85, 0]} rotation={[0, 0, -0.06]} castShadow>
          <cylinderGeometry args={[0.16 - i * 0.015, 0.2 - i * 0.015, 0.85, 6]} />
          <meshLambertMaterial color={i % 2 ? "#a1887f" : TRUNK} flatShading />
        </mesh>
      ))}
      <group position={[0.3, 3.75, 0]}>
        {Array.from({ length: fronds }, (_, i) => (
          <group key={i} rotation={[0, (i / fronds) * Math.PI * 2, 0]}>
            <mesh position={[0.75, -0.18, 0]} rotation={[0, 0, -0.45]} castShadow>
              <boxGeometry args={[1.6, 0.06, 0.42]} />
              <meshLambertMaterial color={PALM_LEAF} flatShading />
            </mesh>
          </group>
        ))}
        <mesh castShadow>
          <icosahedronGeometry args={[0.22, 0]} />
          <meshLambertMaterial color="#6d4c41" flatShading />
        </mesh>
      </group>
    </group>
  );
}

export function FruitTree() {
  return (
    <group>
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.22, 1.2, 6]} />
        <meshLambertMaterial color={TRUNK} flatShading />
      </mesh>
      <mesh position={[0, 1.75, 0]} castShadow>
        <icosahedronGeometry args={[0.95, 0]} />
        <meshLambertMaterial color={LEAF} flatShading />
      </mesh>
      <mesh position={[0.45, 1.45, 0.3]} castShadow>
        <icosahedronGeometry args={[0.55, 0]} />
        <meshLambertMaterial color={LEAF_DARK} flatShading />
      </mesh>
      {/* A few fruits so it reads as a fruit tree, not a generic one */}
      {[
        [0.7, 1.5, -0.2],
        [-0.55, 1.6, 0.55],
        [0.1, 1.2, 0.85],
      ].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]}>
          <sphereGeometry args={[0.11, 6, 4]} />
          <meshLambertMaterial color="#ffb300" />
        </mesh>
      ))}
    </group>
  );
}

function Bush() {
  return (
    <group>
      <mesh position={[0, 0.3, 0]} castShadow>
        <icosahedronGeometry args={[0.45, 0]} />
        <meshLambertMaterial color={LEAF} flatShading />
      </mesh>
      <mesh position={[0.35, 0.22, 0.15]} castShadow>
        <icosahedronGeometry args={[0.3, 0]} />
        <meshLambertMaterial color={LEAF_DARK} flatShading />
      </mesh>
    </group>
  );
}

function Rock() {
  return (
    <group>
      <mesh position={[0, 0.2, 0]} scale={[1, 0.65, 0.85]} castShadow receiveShadow>
        <dodecahedronGeometry args={[0.5, 0]} />
        <meshLambertMaterial color="#9e9e9e" flatShading />
      </mesh>
      <mesh position={[0.45, 0.1, 0.2]} scale={[1, 0.6, 1]} castShadow>
        <dodecahedronGeometry args={[0.25, 0]} />
        <meshLambertMaterial color="#bdbdbd" flatShading />
      </mesh>
    </group>
  );
}

const MODELS: Record<SceneryItem["type"], () => React.JSX.Element> = {
  palm: Palm,
  fruitTree: FruitTree,
  bush: Bush,
  rock: Rock,
};

export const Nature = memo(function Nature() {
  return (
    <group>
      {SCENERY.map((item) => {
        const Model = MODELS[item.type];
        const [x, z] = tileToWorld(item.gx, item.gz);
        return (
          <group key={item.id} position={[x, 0, z]} rotation={[0, item.rotation, 0]} scale={item.scale}>
            <Model />
          </group>
        );
      })}
    </group>
  );
});
