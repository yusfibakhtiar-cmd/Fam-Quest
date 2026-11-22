import { MATERIAL_KEYS, MATERIAL_LABEL, type MaterialCost, type Materials } from "../../features/inventory/materials";

export function CostList({ cost, have }: { cost: MaterialCost; have?: Materials }) {
  return (
    <span className="cost">
      {MATERIAL_KEYS.filter((k) => cost[k]).map((k) => (
        <span key={k} className={have && have[k] < (cost[k] ?? 0) ? "short" : undefined}>
          {MATERIAL_LABEL[k].icon} {cost[k]}
        </span>
      ))}
    </span>
  );
}
