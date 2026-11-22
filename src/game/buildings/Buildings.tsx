import { useGameStore } from "../../stores/gameStore";
import { BUILDING_MODELS } from "./models";
import { footprintCenter, rotationRadians } from "./placementMath";

/** Renders the persisted world state (TDD §5.2): just type + grid position + rotation per object. */
export function Buildings() {
  const objects = useGameStore((s) => s.objects);
  return (
    <group>
      {objects.map((o) => {
        const Model = BUILDING_MODELS[o.type];
        const [x, z] = footprintCenter(o.type, o.gx, o.gz, o.rotation);
        return (
          <group key={o.id} position={[x, 0, z]} rotation={[0, rotationRadians(o.rotation), 0]}>
            <Model />
          </group>
        );
      })}
    </group>
  );
}
