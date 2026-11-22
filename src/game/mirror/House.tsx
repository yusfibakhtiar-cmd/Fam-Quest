import type { WorldState } from "../../domain/deriveWorld";
import { BoxGeometry, EdgesGeometry } from "three";
import { COLORS } from "./layout";

const W = 6;
const D = 5;
const H = 2.2;
const OUTLINE = new EdgesGeometry(new BoxGeometry(W, H, D)); // planned outline of the next floor

function Floor({ index, lit }: { index: number; lit: boolean }) {
  const y = index * H;
  const windowColor = lit ? COLORS.windowLit : COLORS.windowDark;
  const windows = index === 0 ? [-2, 2] : [-2, 0, 2];
  return (
    <group position={[0, y, 0]}>
      <mesh position={[0, H / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[W, H, D]} />
        <meshLambertMaterial color={COLORS.wall} />
      </mesh>
      <mesh position={[0, H - 0.06, 0]}>
        <boxGeometry args={[W + 0.16, 0.12, D + 0.16]} />
        <meshLambertMaterial color={COLORS.wood} />
      </mesh>
      {windows.map((x) => (
        <mesh key={x} position={[x, H * 0.55, D / 2 + 0.01]}>
          <boxGeometry args={[0.8, 0.8, 0.04]} />
          <meshBasicMaterial color={windowColor} toneMapped={false} />
        </mesh>
      ))}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * (W / 2 + 0.01), H * 0.55, 0]}>
          <boxGeometry args={[0.04, 0.8, 0.8]} />
          <meshBasicMaterial color={windowColor} toneMapped={false} />
        </mesh>
      ))}
      {index === 0 && (
        <mesh position={[0, 0.8, D / 2 + 0.02]}>
          <boxGeometry args={[1, 1.6, 0.04]} />
          <meshLambertMaterial color={COLORS.wood} />
        </mesh>
      )}
    </group>
  );
}

/** Floor under construction: walls rise with the bookmark, inside four scaffold poles. */
function Construction({ index, progress }: { index: number; progress: number }) {
  const y = index * H;
  const h = Math.max(0.05, progress * H);
  return (
    <group position={[0, y, 0]}>
      <mesh position={[0, h / 2, 0]} castShadow>
        <boxGeometry args={[W - 0.1, h, D - 0.1]} />
        <meshLambertMaterial color={COLORS.wall} transparent opacity={0.85} />
      </mesh>
      <lineSegments position={[0, H / 2, 0]} geometry={OUTLINE}>
        <lineBasicMaterial color={COLORS.wood} />
      </lineSegments>
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz], i) => (
        <mesh key={i} position={[sx * (W / 2 + 0.2), H / 2 + 0.1, sz * (D / 2 + 0.2)]} castShadow>
          <boxGeometry args={[0.12, H + 0.2, 0.12]} />
          <meshLambertMaterial color={COLORS.wood} />
        </mesh>
      ))}
    </group>
  );
}

export function House({ house }: { house: WorldState["house"] }) {
  const levels = house.floorsDone + (house.buildingFloor ? 1 : 0);
  const roofY = levels * H + (house.buildingFloor ? 0.2 : 0);
  return (
    <group>
      {Array.from({ length: house.floorsDone }, (_, i) => (
        <Floor key={i} index={i} lit={house.windowsLit} />
      ))}
      {house.buildingFloor && <Construction index={house.floorsDone} progress={house.buildProgress} />}
      <mesh position={[0, roofY + 1.1, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[(Math.max(W, D) / 2) * 1.55, 2.2, 4]} />
        <meshLambertMaterial color={COLORS.roof} flatShading />
      </mesh>
      {Array.from({ length: house.roofLanterns }, (_, i) => {
        const a = (i / Math.max(1, house.roofLanterns)) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 2.6, roofY + 0.3, Math.sin(a) * 2.2]}>
            <sphereGeometry args={[0.18, 8, 6]} />
            <meshBasicMaterial color={COLORS.lantern} toneMapped={false} />
          </mesh>
        );
      })}
    </group>
  );
}
