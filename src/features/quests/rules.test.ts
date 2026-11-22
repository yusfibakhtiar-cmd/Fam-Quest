import { describe, expect, it } from "vitest";
import type { Member } from "../family/types";
import { cancelQuest, createQuest, reviewQuest, setProgress, submitQuest, type Result } from "./rules";
import type { Quest } from "./types";

const ayah: Member = { id: "ayah", name: "Ayah", role: "parent" };
const ibu: Member = { id: "ibu", name: "Ibu", role: "parent" };
const aisyah: Member = { id: "aisyah", name: "Aisyah", role: "child" };
const umar: Member = { id: "umar", name: "Umar", role: "child" };
const family = [ayah, ibu, aisyah, umar];
const ids = (n = 1) => ({ id: `id-${n}`, now: "2026-11-22T00:00:00Z" });

function unwrap<T>(r: Result<T>): T {
  if (!r.ok) throw new Error(`expected ok, got ${r.reason}`);
  return r.value;
}

const garden = (assignedTo = ["aisyah"], targetValue = 3) =>
  unwrap(
    createQuest(ayah, { title: "Membangun Kebun Keluarga", category: "family", questType: "project", assignedTo, targetValue }, family, ids()),
  );

describe("createQuest", () => {
  it("only parents create quests", () => {
    expect(createQuest(aisyah, { title: "x", category: "family", questType: "daily", assignedTo: ["aisyah"] }, family, ids())).toEqual({
      ok: false, reason: "not_parent",
    });
  });
  it("validates title, assignees and target", () => {
    const base = { title: "Kebun", category: "family" as const, questType: "project" as const, assignedTo: ["aisyah"] };
    expect(createQuest(ayah, { ...base, title: "  " }, family, ids()).ok).toBe(false);
    expect(createQuest(ayah, { ...base, assignedTo: [] }, family, ids()).ok).toBe(false);
    expect(createQuest(ayah, { ...base, assignedTo: ["stranger"] }, family, ids()).ok).toBe(false);
    expect(createQuest(ayah, { ...base, targetValue: 0 }, family, ids()).ok).toBe(false);
    expect(createQuest(ayah, { ...base, targetValue: 2.5 }, family, ids()).ok).toBe(false);
    expect(garden().status).toBe("available");
  });
});

describe("progress and submit", () => {
  it("clamps progress to the target and starts the quest", () => {
    const q = unwrap(setProgress(aisyah, garden(), 99));
    expect(q).toMatchObject({ currentValue: 3, status: "in_progress" });
    expect(unwrap(setProgress(aisyah, q, -4)).currentValue).toBe(0);
  });
  it("non-assigned children cannot record progress; parents can help", () => {
    expect(setProgress(umar, garden(), 1)).toEqual({ ok: false, reason: "not_assigned" });
    expect(setProgress(ibu, garden(), 1).ok).toBe(true);
  });
  it("submission requires the target to be met and an assigned member", () => {
    const q = garden();
    expect(submitQuest(aisyah, q, "", ids()).ok).toBe(false);
    const done = unwrap(setProgress(aisyah, q, 3));
    expect(submitQuest(umar, done, "", ids())).toEqual({ ok: false, reason: "not_assigned" });
    const { quest, submission } = unwrap(submitQuest(aisyah, done, " sudah ditanam ", ids(2)));
    expect(quest.status).toBe("submitted");
    expect(submission).toMatchObject({ submittedBy: "aisyah", note: "sudah ditanam", questId: q.id });
  });
  it("quests without a target can be submitted any time", () => {
    const open = unwrap(createQuest(ayah, { title: "Membaca bersama", category: "growth", questType: "weekly", assignedTo: ["aisyah"] }, family, ids()));
    expect(open.targetValue).toBeUndefined();
    expect(submitQuest(aisyah, open, "", ids()).ok).toBe(true);
  });
  it("cannot record progress once submitted", () => {
    const { quest } = unwrap(submitQuest(aisyah, unwrap(setProgress(aisyah, garden(), 3)), "", ids()));
    expect(setProgress(aisyah, quest, 1)).toEqual({ ok: false, reason: "wrong_status" });
  });
});

describe("review (parents only)", () => {
  const submitted = () => unwrap(submitQuest(aisyah, unwrap(setProgress(aisyah, garden(), 3)), "", ids(2)));

  it("children cannot review", () => {
    const { quest, submission } = submitted();
    expect(reviewQuest(umar, quest, submission, "approved", "", family, "t")).toEqual({ ok: false, reason: "not_parent" });
  });
  it("a parent approves", () => {
    const { quest, submission } = submitted();
    const r = unwrap(reviewQuest(ibu, quest, submission, "approved", "", family, "t"));
    expect(r.quest.status).toBe("approved");
    expect(r.submission).toMatchObject({ decision: "approved", reviewedBy: "ibu" });
  });
  it("rejection needs a note and allows rework + resubmission", () => {
    const { quest, submission } = submitted();
    expect(reviewQuest(ibu, quest, submission, "rejected", " ", family, "t")).toEqual({ ok: false, reason: "note_required" });
    const r = unwrap(reviewQuest(ibu, quest, submission, "rejected", "Fotonya belum ada", family, "t"));
    expect(r.quest.status).toBe("rejected");
    expect(unwrap(submitQuest(aisyah, r.quest, "ini fotonya", ids(3))).quest.status).toBe("submitted");
  });
  it("a submission cannot be reviewed twice", () => {
    const { quest, submission } = submitted();
    const r = unwrap(reviewQuest(ibu, quest, submission, "approved", "", family, "t"));
    expect(reviewQuest(ayah, r.quest, r.submission, "approved", "", family, "t").ok).toBe(false);
  });
  it("a parent cannot approve their own submission when another parent exists", () => {
    const q = unwrap(createQuest(ayah, { title: "Lari pagi", category: "health", questType: "weekly", assignedTo: ["ayah"] }, family, ids()));
    const { quest, submission } = unwrap(submitQuest(ayah, q, "", ids(2)));
    expect(reviewQuest(ayah, quest, submission, "approved", "", family, "t")).toEqual({ ok: false, reason: "self_review" });
    expect(reviewQuest(ibu, quest, submission, "approved", "", family, "t").ok).toBe(true);
  });
  it("a single parent may approve their own submission", () => {
    const solo = [ayah, aisyah];
    const q = unwrap(createQuest(ayah, { title: "Lari pagi", category: "health", questType: "weekly", assignedTo: ["ayah"] }, solo, ids()));
    const { quest, submission } = unwrap(submitQuest(ayah, q, "", ids(2)));
    expect(reviewQuest(ayah, quest, submission, "approved", "", solo, "t").ok).toBe(true);
  });
});

describe("cancel", () => {
  it("parents cancel unfinished quests only", () => {
    const q: Quest = garden();
    expect(cancelQuest(aisyah, q).ok).toBe(false);
    expect(unwrap(cancelQuest(ayah, q)).status).toBe("cancelled");
    expect(cancelQuest(ayah, { ...q, status: "approved" }).ok).toBe(false);
  });
});
