import type { Quest } from "../quests/types";
import { ACHIEVEMENTS, type AchievementDefinition } from "./definitions";

const OPEN_STATUSES = new Set<Quest["status"]>(["available", "in_progress", "submitted", "rejected"]);

export type AchievementState =
  | { kind: "claimed" }
  | { kind: "linked"; quest: Quest } // an open quest will grant it on approval
  | { kind: "available" } // a parent can attach it to a new quest
  | { kind: "starter" }; // granted on first launch, never attached to quests

/**
 * Decision 2026-11-22 (option a): a parent picks the achievement when creating a quest.
 * An achievement can be attached to at most one open quest, and never once claimed —
 * otherwise a second approval would silently grant nothing.
 */
export function achievementState(def: AchievementDefinition, quests: Quest[], claimedIds: Set<string>): AchievementState {
  if (claimedIds.has(def.id)) return { kind: "claimed" };
  if (def.starter) return { kind: "starter" };
  const quest = quests.find((q) => q.achievementId === def.id && OPEN_STATUSES.has(q.status));
  return quest ? { kind: "linked", quest } : { kind: "available" };
}

export function attachableAchievementIds(quests: Quest[], claimedIds: Set<string>): Set<string> {
  return new Set(ACHIEVEMENTS.filter((a) => achievementState(a, quests, claimedIds).kind === "available").map((a) => a.id));
}
