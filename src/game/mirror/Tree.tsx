import { useMemo } from "react";
import type { TreeState } from "../../domain/deriveWorld";
import { COLORS } from "./layout";

/** Model size multiplier so even a day-0 tree (scale 0.6) reads clearly against border scenery. */
const BASE = 1.7;

/** A parent's tree: size and fruit come from cumulative reading days only (never shrinks). */
export function Tree({ tree, leaf }: { tree: TreeState; leaf: string }) {
  const fruits = useMemo(
    () =>
      Array.from({ length: tree.fruits }, (_, i) => {
        const a = i * 2.39996; // golden angle spreads fruit evenly
        const r = 0.85;
        return [Math.cos(a) * r, 2.0 + ((i % 3) - 1) * 0.35, Math.sin(a) * r] as [number, number, number];
      }),
    [tree.fruits],
  );
  return (
    <group>
      {tree.goldRing && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
          <ringGeometry args={[1.5, 1.8, 32]} />
          <meshBasicMaterial color={COLORS.gold} toneMapped={false} />
        </mesh>
      )}
      <group scale={tree.scale * BASE}>
        <mesh position={[0, 0.75, 0]} castShadow>
          <cylinderGeometry args={[0.14, 0.22, 1.5, 6]} />
          <meshLambertMaterial color={COLORS.wood} flatShading />
        </mesh>
        <mesh position={[0, 2.0, 0]} castShadow>
          <icosahedronGeometry args={[0.95, 0]} />
          <meshLambertMaterial color={leaf} flatShading />
        </mesh>
        <mesh position={[0.35, 2.55, -0.2]} castShadow>
          <icosahedronGeometry args={[0.6, 0]} />
          <meshLambertMaterial color={leaf} flatShading />
        </mesh>
        {fruits.map((p, i) => (
          <mesh key={i} position={p}>
            <sphereGeometry args={[0.12, 8, 6]} />
            <meshLambertMaterial color={COLORS.gold} emissive={COLORS.gold} emissiveIntensity={0.25} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
