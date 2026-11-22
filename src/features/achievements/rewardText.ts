import { CATALOG } from "../builder/catalog";
import { MATERIAL_KEYS, MATERIAL_LABEL } from "../inventory/materials";
import type { AchievementDefinition } from "./definitions";

export function rewardText(a: AchievementDefinition): string {
  const blueprints = a.reward.blueprints.map((b) => CATALOG[b].name).join(", ");
  const mats = MATERIAL_KEYS.filter((k) => a.reward.materials[k])
    .map((k) => `${a.reward.materials[k]} ${MATERIAL_LABEL[k].name}`)
    .join(", ");
  return [blueprints && `Blueprint ${blueprints}`, mats].filter(Boolean).join(" + ");
}
