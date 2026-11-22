import type { MaterialCost } from "../inventory/materials";
import type { BuildingId } from "../builder/catalog";

/**
 * Decision (2026-11-22): an achievement grants blueprints AND a fixed material amount.
 * Invariant (tested): materials granted >= construction cost of every blueprint it unlocks,
 * so an unlocked blueprint is always buildable at least once.
 *
 * Unlock *conditions* (which quests complete an achievement) arrive in Milestone 4;
 * here we only define what each achievement rewards.
 */
export type AchievementDefinition = {
  id: string;
  title: string;
  description: string;
  reward: { blueprints: BuildingId[]; materials: MaterialCost };
  /** Granted automatically on first launch. */
  starter?: boolean;
};

export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: "first_step",
    title: "Langkah Pertama",
    description: "Memulai perjalanan keluarga di tanah baru.",
    reward: { blueprints: ["house_basic", "fruit_tree"], materials: { wood: 22, stone: 10, seeds: 6 } },
    starter: true,
  },
  {
    id: "water_keeper",
    title: "The Water Keeper",
    description: "Proyek kemandirian keluarga selesai.",
    reward: { blueprints: ["well"], materials: { wood: 10, stone: 8 } },
  },
  {
    id: "family_garden",
    title: "Kebun Keluarga",
    description: "Proyek kebun keluarga 30 hari selesai.",
    reward: { blueprints: ["vegetable_garden"], materials: { wood: 6, seeds: 8 } },
  },
  {
    id: "organized_home",
    title: "Rumah yang Tertata",
    description: "Proyek merapikan rumah bersama selesai.",
    reward: { blueprints: ["warehouse"], materials: { wood: 15, stone: 10 } },
  },
  {
    id: "gathering_place",
    title: "Tempat Berkumpul",
    description: "Rutinitas berkumpul keluarga terjaga.",
    reward: { blueprints: ["gazebo"], materials: { wood: 12, stone: 5 } },
  },
];

export const ACHIEVEMENT_BY_BLUEPRINT = new Map<BuildingId, AchievementDefinition>(
  ACHIEVEMENTS.flatMap((a) => a.reward.blueprints.map((b) => [b, a] as const)),
);
