import { beforeEach, describe, expect, it } from "vitest";
import { useFamilyStore } from "./familyStore";
import { useQuestStore } from "./questStore";
import { useGameStore } from "./gameStore";
import { EMPTY_MATERIALS } from "../features/inventory/materials";

describe("quest store acts as the active member", () => {
  beforeEach(() => {
    useFamilyStore.setState({ family: null, activeMemberId: null });
    useQuestStore.setState({ quests: [], submissions: [] });
    useGameStore.setState({ materials: { ...EMPTY_MATERIALS }, unlockedBlueprints: [], rewardClaims: [], objects: [] });
    useFamilyStore.getState().createFamily("Keluarga Uji", "Ayah");
  });

  it("runs the full create → progress → submit → approve flow with role switching", () => {
    const fam = useFamilyStore.getState();
    expect(fam.addMember("Aisyah", "child")).toBe(true);
    const [ayah, aisyah] = useFamilyStore.getState().family!.members;
    const qs = useQuestStore.getState();

    expect(qs.create({ title: "Kebun", category: "family", questType: "project", assignedTo: [aisyah.id], targetValue: 2 })).toEqual({ ok: true });
    const id = useQuestStore.getState().quests[0].id;

    fam.setActiveMember(aisyah.id);
    expect(fam.addMember("Penyusup", "parent")).toBe(false); // children can't add members
    expect(qs.submit(id, "")).toEqual({ ok: false, reason: "target_not_met" });
    expect(qs.progress(id, 2)).toEqual({ ok: true });
    expect(qs.submit(id, "selesai")).toEqual({ ok: true });
    expect(qs.review(id, "approved", "")).toEqual({ ok: false, reason: "not_parent" });

    fam.setActiveMember(ayah.id);
    expect(qs.review(id, "approved", "Masya Allah")).toEqual({ ok: true });
    const s = useQuestStore.getState();
    expect(s.quests[0].status).toBe("approved");
    expect(s.submissions).toHaveLength(1);
    expect(s.submissions[0]).toMatchObject({ decision: "approved", reviewedBy: ayah.id, submittedBy: aisyah.id });
  });

  it("approving a linked quest grants its achievement exactly once, recording the source", () => {
    const fam = useFamilyStore.getState();
    fam.addMember("Aisyah", "child");
    const [ayah, aisyah] = useFamilyStore.getState().family!.members;
    const qs = useQuestStore.getState();
    const base = { title: "Sumur", category: "family" as const, questType: "project" as const, assignedTo: [aisyah.id] };

    expect(qs.create({ ...base, achievementId: "first_step" })).toEqual({ ok: false, reason: "achievement_unavailable" });
    expect(qs.create({ ...base, achievementId: "water_keeper" })).toEqual({ ok: true });
    expect(qs.create({ ...base, achievementId: "water_keeper" })).toEqual({ ok: false, reason: "achievement_unavailable" });
    const id = useQuestStore.getState().quests[0].id;

    fam.setActiveMember(aisyah.id);
    qs.submit(id, "");
    fam.setActiveMember(ayah.id);

    // Rejection must not grant anything.
    qs.review(id, "rejected", "belum");
    expect(useGameStore.getState().rewardClaims).toHaveLength(0);

    fam.setActiveMember(aisyah.id);
    qs.submit(id, "sudah");
    fam.setActiveMember(ayah.id);
    const r = qs.review(id, "approved", "");
    expect(r.ok && r.granted?.id).toBe("water_keeper");

    const g = useGameStore.getState();
    expect(g.unlockedBlueprints).toContain("well");
    expect(g.materials).toMatchObject({ wood: 10, stone: 8 });
    expect(g.rewardClaims).toEqual([expect.objectContaining({ achievementId: "water_keeper", questId: id, approvedBy: ayah.id })]);

    // Claimed achievements can no longer be attached.
    expect(qs.create({ ...base, achievementId: "water_keeper" })).toEqual({ ok: false, reason: "achievement_unavailable" });
  });
});
