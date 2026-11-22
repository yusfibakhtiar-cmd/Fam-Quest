import { isParent, type Member } from "../family/types";
import type { Quest, QuestCategory, QuestSubmission, QuestType } from "./types";

/**
 * Pure quest state machine with permission checks. The store only applies results,
 * so every rule here is unit-tested without React.
 *
 *   available ─progress─▶ in_progress ─submit─▶ submitted ─approve─▶ approved
 *        │                     ▲                    │
 *        └──────submit─────────┼────────────────────┤ reject (note required)
 *                              └──── rejected ◀─────┘
 *   any non-approved state ─cancel (parent)─▶ cancelled
 */

export type Fail = { ok: false; reason: QuestError };
export type Result<T> = { ok: true; value: T } | Fail;

export type QuestError =
  | "not_parent"
  | "not_assigned"
  | "invalid_input"
  | "wrong_status"
  | "target_not_met"
  | "self_review"
  | "note_required";

export const ERROR_LABEL: Record<QuestError, string> = {
  not_parent: "Hanya orang tua yang boleh melakukan ini.",
  not_assigned: "Quest ini tidak ditugaskan kepadamu.",
  invalid_input: "Data quest belum lengkap atau tidak valid.",
  wrong_status: "Aksi ini tidak tersedia untuk status quest sekarang.",
  target_not_met: "Target belum tercapai.",
  self_review: "Pengajuanmu sendiri harus disetujui orang tua lain.",
  note_required: "Tuliskan alasan agar bisa diperbaiki.",
};

const fail = (reason: QuestError): Fail => ({ ok: false, reason });
const ok = <T>(value: T): Result<T> => ({ ok: true, value });

const WORKABLE = new Set<Quest["status"]>(["available", "in_progress", "rejected"]);

export type NewQuestInput = {
  title: string;
  description?: string;
  category: QuestCategory;
  questType: QuestType;
  assignedTo: string[];
  targetValue?: number;
  dueDate?: string;
};

export function createQuest(
  actor: Member,
  input: NewQuestInput,
  members: Member[],
  ids: { id: string; now: string },
): Result<Quest> {
  if (!isParent(actor)) return fail("not_parent");
  const title = input.title.trim();
  const memberIds = new Set(members.map((m) => m.id));
  const assigned = [...new Set(input.assignedTo)];
  const targetOk =
    input.targetValue === undefined || (Number.isInteger(input.targetValue) && input.targetValue > 0);
  if (!title || assigned.length === 0 || !assigned.every((id) => memberIds.has(id)) || !targetOk) {
    return fail("invalid_input");
  }
  return ok({
    id: ids.id,
    title,
    description: input.description?.trim() ?? "",
    category: input.category,
    questType: input.questType,
    assignedTo: assigned,
    targetValue: input.targetValue,
    currentValue: 0,
    startDate: ids.now,
    dueDate: input.dueDate || undefined,
    status: "available",
    createdBy: actor.id,
  });
}

/** Assigned members (and parents, to help younger children) can record progress. */
export function setProgress(actor: Member, quest: Quest, value: number): Result<Quest> {
  if (!quest.assignedTo.includes(actor.id) && !isParent(actor)) return fail("not_assigned");
  if (!WORKABLE.has(quest.status)) return fail("wrong_status");
  const max = quest.targetValue ?? Number.POSITIVE_INFINITY;
  const currentValue = Math.max(0, Math.min(max, Math.round(value)));
  return ok({ ...quest, currentValue, status: "in_progress" });
}

export function submitQuest(
  actor: Member,
  quest: Quest,
  note: string,
  ids: { id: string; now: string },
): Result<{ quest: Quest; submission: QuestSubmission }> {
  if (!quest.assignedTo.includes(actor.id)) return fail("not_assigned");
  if (!WORKABLE.has(quest.status)) return fail("wrong_status");
  if (quest.targetValue !== undefined && quest.currentValue < quest.targetValue) return fail("target_not_met");
  return ok({
    quest: { ...quest, status: "submitted" },
    submission: { id: ids.id, questId: quest.id, submittedBy: actor.id, note: note.trim(), submittedAt: ids.now },
  });
}

/**
 * Only parents review. A parent may not approve their own submission while another
 * parent exists; a single-parent family is allowed to self-approve (otherwise their quests could never finish).
 */
export function reviewQuest(
  actor: Member,
  quest: Quest,
  submission: QuestSubmission,
  decision: "approved" | "rejected",
  reviewNote: string,
  members: Member[],
  now: string,
): Result<{ quest: Quest; submission: QuestSubmission }> {
  if (!isParent(actor)) return fail("not_parent");
  if (quest.status !== "submitted" || submission.questId !== quest.id || submission.decision) {
    return fail("wrong_status");
  }
  const otherParents = members.filter((m) => isParent(m) && m.id !== actor.id);
  if (submission.submittedBy === actor.id && otherParents.length > 0) return fail("self_review");
  if (decision === "rejected" && !reviewNote.trim()) return fail("note_required");
  return ok({
    quest: { ...quest, status: decision },
    submission: { ...submission, decision, reviewedBy: actor.id, reviewNote: reviewNote.trim(), reviewedAt: now },
  });
}

export function cancelQuest(actor: Member, quest: Quest): Result<Quest> {
  if (!isParent(actor)) return fail("not_parent");
  if (quest.status === "approved" || quest.status === "cancelled") return fail("wrong_status");
  return ok({ ...quest, status: "cancelled" });
}
