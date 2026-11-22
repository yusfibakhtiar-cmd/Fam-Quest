import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { usePlacementStore } from "../../stores/placementStore";
import { useGameStore } from "../../stores/gameStore";
import { STATIC_BLOCKED } from "../../game/world/scenery";
import { CATALOG } from "./catalog";
import { buildOccupancy, checkPlacement } from "./grid";
import { canAfford, shortfall } from "../inventory/materials";

/** Live validity of the ghost: shared by the 3D ghost colour and the confirm button. */
export function usePlacementStatus() {
  const { activeType, gx, gz, rotation } = usePlacementStore(
    useShallow((s) => ({ activeType: s.activeType, gx: s.gx, gz: s.gz, rotation: s.rotation })),
  );
  const objects = useGameStore((s) => s.objects);
  const materials = useGameStore((s) => s.materials);
  const occupancy = useMemo(() => buildOccupancy(objects, STATIC_BLOCKED), [objects]);

  return useMemo(() => {
    if (!activeType) return null;
    const cost = CATALOG[activeType].constructionCost;
    const placement = checkPlacement(activeType, gx, gz, rotation, occupancy);
    const affordable = canAfford(materials, cost);
    return {
      type: activeType, gx, gz, rotation, placement, affordable,
      missing: shortfall(materials, cost),
      canConfirm: placement.ok && affordable,
    };
  }, [activeType, gx, gz, rotation, occupancy, materials]);
}
