import { create } from "zustand";
import {
  cancelQuest, createQuest, reviewQuest, setProgress, submitQuest,
  type NewQuestInput, type QuestError,
} from "../features/quests/rules";
import type { Quest, QuestSubmission } from "../features/quests/types";
import { newId, nowIso } from "../utils/id";
import { useActiveMember, useFamilyStore } from "./familyStore";
import { useGameStore } from "./gameStore";
import { attachableAchievementIds } from "../features/achievements/availability";
import { ACHIEVEMENTS, type AchievementDefinition } from "../features/achievements/definitions";

type Outcome = { ok: true; granted?: AchievementDefinition } | { ok: false; reason: QuestError | "no_actor" };

const claimedIds = () => new Set(useGameStore.getState().rewardClaims.map((c) => c.achievementId));

type QuestState = {
  quests: Quest[];
  submissions: QuestSubmission[];
  create: (input: NewQuestInput) => Outcome;
  progress: (questId: string, value: number) => Outcome;
  submit: (questId: string, note: string) => Outcome;
  review: (questId: string, decision: "approved" | "rejected", note: string) => Outcome;
  cancel: (questId: string) => Outcome;
};

/** The pending (unreviewed) submission for a quest, if any. */
export const pendingSubmission = (subs: QuestSubmission[], questId: string) =>
  subs.find((s) => s.questId === questId && !s.decision);

const NO_ACTOR = { ok: false, reason: "no_actor" } as const;

export const useQuestStore = create<QuestState>((set, get) => {
  /** All actions act as the currently active family member; rules decide what they may do. */
  const ctx = () => {
    const actor = useActiveMember.get();
    const members = useFamilyStore.getState().family?.members ?? [];
    return { actor, members };
  };
  const replace = (q: Quest) => set((s) => ({ quests: s.quests.map((x) => (x.id === q.id ? q : x)) }));
  const find = (id: string) => get().quests.find((q) => q.id === id);

  return {
    quests: [],
    submissions: [],

    create: (input) => {
      const { actor, members } = ctx();
      if (!actor) return NO_ACTOR;
      const attachable = attachableAchievementIds(get().quests, claimedIds());
      const r = createQuest(actor, input, members, { id: newId("q"), now: nowIso() }, attachable);
      if (!r.ok) return r;
      set((s) => ({ quests: [r.value, ...s.quests] }));
      return { ok: true };
    },

    progress: (questId, value) => {
      const { actor } = ctx();
      const q = find(questId);
      if (!actor || !q) return NO_ACTOR;
      const r = setProgress(actor, q, value);
      if (!r.ok) return r;
      replace(r.value);
      return { ok: true };
    },

    submit: (questId, note) => {
      const { actor } = ctx();
      const q = find(questId);
      if (!actor || !q) return NO_ACTOR;
      const r = submitQuest(actor, q, note, { id: newId("sub"), now: nowIso() });
      if (!r.ok) return r;
      replace(r.value.quest);
      set((s) => ({ submissions: [...s.submissions, r.value.submission] }));
      return { ok: true };
    },

    review: (questId, decision, note) => {
      const { actor, members } = ctx();
      const q = find(questId);
      const sub = pendingSubmission(get().submissions, questId);
      if (!actor || !q || !sub) return NO_ACTOR;
      const r = reviewQuest(actor, q, sub, decision, note, members, nowIso());
      if (!r.ok) return r;
      replace(r.value.quest);
      set((s) => ({ submissions: s.submissions.map((x) => (x.id === sub.id ? r.value.submission : x)) }));
      // Approval → achievement → blueprint + materials (TDD §4.2). grantAchievement is idempotent,
      // so even a duplicate link could never pay out twice.
      if (decision === "approved" && q.achievementId) {
        const granted = useGameStore.getState().grantAchievement(q.achievementId, { questId: q.id, approvedBy: actor.id });
        if (granted) return { ok: true, granted: ACHIEVEMENTS.find((a) => a.id === q.achievementId) };
      }
      return { ok: true };
    },

    cancel: (questId) => {
      const { actor } = ctx();
      const q = find(questId);
      if (!actor || !q) return NO_ACTOR;
      const r = cancelQuest(actor, q);
      if (!r.ok) return r;
      replace(r.value);
      return { ok: true };
    },
  };
});
