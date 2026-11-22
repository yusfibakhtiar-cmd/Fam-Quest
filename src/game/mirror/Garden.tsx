import type { WorldState } from "../../domain/deriveWorld";
import { COLORS } from "./layout";

const PETALS = ["#f48fb1", "#fff176", "#ce93d8", "#ffab91", "#80deea"];

/** Children's garden: one flower per day a child sat in. No targets, nothing to lose (P5, P3). */
export function Garden({ garden }: { garden: WorldState["garden"] }) {
  const slots: Array<[number, number]> = [];
  for (const bx of [-2.3, 2.3]) for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) slots.push([bx - 1 + c * 0.4, -0.4 + r * 0.4]);
  return (
    <group>
      {[-2.3, 2.3].map((x) => (
        <mesh key={x} position={[x, 0.12, 0]} receiveShadow castShadow>
          <boxGeometry args={[2.6, 0.24, 1.4]} />
          <meshLambertMaterial color={COLORS.soil} />
        </mesh>
      ))}
      {slots.slice(0, garden.flowers).map(([x, z], i) => (
        <group key={i} position={[x, 0.24, z]}>
          <mesh position={[0, 0.15, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.3, 4]} />
            <meshLambertMaterial color="#558b2f" />
          </mesh>
          <mesh position={[0, 0.32, 0]}>
            <icosahedronGeometry args={[0.1, 0]} />
            <meshLambertMaterial color={PETALS[i % PETALS.length]} flatShading />
          </mesh>
        </group>
      ))}
      {garden.litToday && (
        <mesh position={[0, 0.6, 0]}>
          <sphereGeometry args={[0.16, 8, 6]} />
          <meshBasicMaterial color={COLORS.lantern} toneMapped={false} />
        </mesh>
      )}
    </group>
  );
}
