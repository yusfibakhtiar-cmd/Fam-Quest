export const QUEST_CATEGORIES = ["deen", "family", "growth", "finance", "health", "contribution"] as const;
export type QuestCategory = (typeof QUEST_CATEGORIES)[number];

export const QUEST_TYPES = ["daily", "weekly", "project", "milestone"] as const;
export type QuestType = (typeof QUEST_TYPES)[number];

/**
 * Narrowed from TDD §4.1: "completed" is dropped (approved is terminal) and "locked" is
 * deferred until quests can depend on each other. Rejected quests can be worked on and resubmitted.
 */
export type QuestStatus = "available" | "in_progress" | "submitted" | "approved" | "rejected" | "cancelled";

export type Quest = {
  id: string;
  title: string;
  description: string;
  category: QuestCategory;
  questType: QuestType;
  assignedTo: string[]; // member ids
  targetValue?: number; // e.g. 30 = a 30-day project; not a score
  currentValue: number;
  startDate: string;
  dueDate?: string;
  status: QuestStatus;
  createdBy: string;
  /** Achievement granted when a parent approves this quest (optional). */
  achievementId?: string;
};

/** TDD §5 quest_submissions. One row per submit; review fields fill in when a parent decides. */
export type QuestSubmission = {
  id: string;
  questId: string;
  submittedBy: string;
  note: string;
  submittedAt: string;
  decision?: "approved" | "rejected";
  reviewedBy?: string;
  reviewNote?: string;
  reviewedAt?: string;
};

export const CATEGORY_LABEL: Record<QuestCategory, string> = {
  deen: "Ibadah",
  family: "Keluarga",
  growth: "Belajar & Tumbuh",
  finance: "Keuangan",
  health: "Kesehatan",
  contribution: "Kontribusi",
};

export const QUEST_TYPE_LABEL: Record<QuestType, string> = {
  daily: "Harian",
  weekly: "Mingguan",
  project: "Proyek",
  milestone: "Milestone",
};

export const STATUS_LABEL: Record<QuestStatus, string> = {
  available: "Belum dimulai",
  in_progress: "Berjalan",
  submitted: "Menunggu persetujuan",
  approved: "Disetujui",
  rejected: "Perlu diperbaiki",
  cancelled: "Dibatalkan",
};
