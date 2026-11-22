import { describe, expect, it } from "vitest";
import { memoryRepository } from "../data/repository";
import { createFamilyStore } from "./familyStore";

describe("family store persistence", () => {
  it("writes every change through and reloads it in a fresh store (simulated app restart)", () => {
    const repo = memoryRepository();
    const s1 = createFamilyStore(repo);
    s1.getState().createFamily({ familyName: "Uji", parents: ["Ayah", "Ibu", " "], children: ["Si Kecil"] });
    const [ayah] = s1.getState().data!.family.members;
    s1.getState().toggleToday("2026-11-22", ayah.id);
    s1.getState().movePage(3);
    s1.getState().setAnchor("x".repeat(200));

    const s2 = createFamilyStore(repo); // reopen
    const d = s2.getState().data!;
    expect(d.family.members.map((m) => m.name)).toEqual(["Ayah", "Ibu", "Si Kecil"]);
    expect(d.readings["2026-11-22"][ayah.id]).toBe(true);
    expect(d.quran.page).toBe(4);
    expect(d.quran.anchor).toHaveLength(140);
  });
});
