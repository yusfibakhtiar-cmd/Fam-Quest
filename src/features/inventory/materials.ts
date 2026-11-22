export const MATERIAL_KEYS = ["wood", "stone", "brick", "seeds"] as const;
export type MaterialKey = (typeof MATERIAL_KEYS)[number];
export type Materials = Record<MaterialKey, number>;
export type MaterialCost = Partial<Materials>;

export const MATERIAL_LABEL: Record<MaterialKey, { name: string; icon: string }> = {
  wood: { name: "Kayu", icon: "🪵" },
  stone: { name: "Batu", icon: "🪨" },
  brick: { name: "Bata", icon: "🧱" },
  seeds: { name: "Bibit", icon: "🌱" },
};

export const EMPTY_MATERIALS: Materials = { wood: 0, stone: 0, brick: 0, seeds: 0 };

export function canAfford(have: Materials, cost: MaterialCost): boolean {
  return MATERIAL_KEYS.every((k) => have[k] >= (cost[k] ?? 0));
}

export function subtract(have: Materials, cost: MaterialCost): Materials {
  if (!canAfford(have, cost)) throw new Error("Insufficient materials");
  const next = { ...have };
  for (const k of MATERIAL_KEYS) next[k] -= cost[k] ?? 0;
  return next;
}

export function add(have: Materials, gain: MaterialCost): Materials {
  const next = { ...have };
  for (const k of MATERIAL_KEYS) next[k] += gain[k] ?? 0;
  return next;
}

/** What is still missing, for UI messages. */
export function shortfall(have: Materials, cost: MaterialCost): MaterialCost {
  const out: MaterialCost = {};
  for (const k of MATERIAL_KEYS) {
    const miss = (cost[k] ?? 0) - have[k];
    if (miss > 0) out[k] = miss;
  }
  return out;
}
