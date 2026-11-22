import { useGameStore } from "../../stores/gameStore";
import { MATERIAL_KEYS, MATERIAL_LABEL } from "../../features/inventory/materials";

export function InventoryBar() {
  const materials = useGameStore((s) => s.materials);
  return (
    <div className="inventory" aria-label="Material">
      {MATERIAL_KEYS.map((k) => (
        <span key={k} className="chip" title={MATERIAL_LABEL[k].name}>
          <span aria-hidden>{MATERIAL_LABEL[k].icon}</span> {materials[k]}
          <span className="sr-only"> {MATERIAL_LABEL[k].name}</span>
        </span>
      ))}
    </div>
  );
}
