import { beforeEach, describe, expect, it } from "vitest";
import { useFamilyStore } from "./familyStore";
import { useQuestStore } from "./questStore";

describe("quest store acts as the active member", () => {
  beforeEach(() => {
    useFamilyStore.setState({ family: null, activeMemberId: null });
    useQuestStore.setState({ quests: [], submissions: [] });
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
});
