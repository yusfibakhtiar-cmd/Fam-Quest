import type { MaterialCost } from "../inventory/materials";

export type BuildingId = "house_basic" | "well" | "vegetable_garden" | "fruit_tree" | "warehouse" | "gazebo";

/** TDD §4.4. `modelId` stands in for `modelPath` until real glTF models exist. */
export type BuildingDefinition = {
  id: BuildingId;
  name: string;
  category: "home" | "water" | "farm" | "storage" | "social";
  modelId: BuildingId;
  footprint: { width: number; depth: number }; // tiles, at rotation 0
  constructionCost: MaterialCost;
  maxLevel: number;
};

// Gameplay parameters from TDD §4.4 — not real-world costs.
export const CATALOG: Record<BuildingId, BuildingDefinition> = {
  house_basic: {
    id: "house_basic", name: "Rumah Sederhana", category: "home", modelId: "house_basic",
    footprint: { width: 5, depth: 5 }, constructionCost: { wood: 20, stone: 10 }, maxLevel: 3,
  },
  well: {
    id: "well", name: "Sumur", category: "water", modelId: "well",
    footprint: { width: 2, depth: 2 }, constructionCost: { wood: 10, stone: 8 }, maxLevel: 2,
  },
  vegetable_garden: {
    id: "vegetable_garden", name: "Kebun Sayur", category: "farm", modelId: "vegetable_garden",
    footprint: { width: 4, depth: 3 }, constructionCost: { wood: 6, seeds: 5 }, maxLevel: 3,
  },
  fruit_tree: {
    id: "fruit_tree", name: "Pohon Buah", category: "farm", modelId: "fruit_tree",
    footprint: { width: 1, depth: 1 }, constructionCost: { seeds: 3 }, maxLevel: 1,
  },
  warehouse: {
    id: "warehouse", name: "Gudang", category: "storage", modelId: "warehouse",
    footprint: { width: 3, depth: 3 }, constructionCost: { wood: 15, stone: 10 }, maxLevel: 2,
  },
  gazebo: {
    id: "gazebo", name: "Gazebo", category: "social", modelId: "gazebo",
    footprint: { width: 3, depth: 3 }, constructionCost: { wood: 12, stone: 5 }, maxLevel: 1,
  },
};

export const CATALOG_ORDER: BuildingId[] = [
  "house_basic", "fruit_tree", "well", "vegetable_garden", "warehouse", "gazebo",
];
