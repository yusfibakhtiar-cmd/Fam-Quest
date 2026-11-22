import { describe, expect, it } from "vitest";
import { addDays, dateKeyIn, lastDays, mondayOf } from "./dates";
import { clampPage, cumulativeDays, juzOfPage, movePage, needsNotTwiceReminder, startNextKhatam, toggleReading } from "./quran";
import { deriveWorld, treeFruits, treeScale } from "./deriveWorld";
import { importV3 } from "./importV3";
import type { FamilyData, Member, Readings } from "./types";

const ayah: Member = { id: "a", name: "Ayah", role: "parent" };
const ibu: Member = { id: "i", name: "Ibu", role: "parent" };
const kecil: Member = { id: "k", name: "Si Kecil", role: "child" };

const data = (over: Partial<FamilyData> = {}): FamilyData => ({
  version: 1,
  family: { id: "f", name: "Uji", timeZone: "Asia/Jakarta", members: [ayah, ibu, kecil] },
  quran: { page: 1, khatam: 0, anchor: "", mode: "normal" },
  readings: {},
  ...over,
});

describe("dates", () => {
  it("uses the family time zone, not the device clock", () => {
    const t = new Date("2026-11-22T18:30:00Z"); // 01:30 on the 23rd in Jakarta (UTC+7)
    expect(dateKeyIn("Asia/Jakarta", t)).toBe("2026-11-23");
    expect(dateKeyIn("UTC", t)).toBe("2026-11-22");
  });
  it("adds days across month and year boundaries", () => {
    expect(addDays("2026-11-30", 1)).toBe("2026-12-01");
    expect(addDays("2027-01-01", -1)).toBe("2026-12-31");
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
  });
  it("finds the Monday of the week", () => {
    expect(mondayOf("2026-11-22")).toBe("2026-11-16"); // Sunday
    expect(mondayOf("2026-11-23")).toBe("2026-11-23"); // Monday
  });
  it("lists the last 28 days oldest first", () => {
    const d = lastDays("2026-11-22", 28);
    expect(d).toHaveLength(28);
    expect(d[0]).toBe("2026-10-26");
    expect(d[27]).toBe("2026-11-22");
  });
});

describe("quran", () => {
  it("juz approximation matches FEATURES.md", () => {
    expect([1, 21, 22, 41, 42, 582, 604].map(juzOfPage)).toEqual([1, 1, 2, 2, 3, 30, 30]);
  });
  it("clamps pages to 1..604", () => {
    expect(clampPage(0)).toBe(1);
    expect(clampPage(700)).toBe(604);
    expect(movePage({ page: 603, khatam: 0, anchor: "", mode: "normal" }, 2).page).toBe(604);
  });
  it("khatam only advances from page 604", () => {
    const q = { page: 300, khatam: 0, anchor: "", mode: "normal" as const };
    expect(startNextKhatam(q)).toBe(q);
    expect(startNextKhatam({ ...q, page: 604 })).toMatchObject({ page: 1, khatam: 1 });
  });
  it("counts cumulative days and toggles", () => {
    let r: Readings = {};
    r = toggleReading(r, "2026-11-20", "a");
    r = toggleReading(r, "2026-11-21", "a");
    r = toggleReading(r, "2026-11-21", "a"); // untoggled: a mistake can be corrected
    expect(cumulativeDays(r, "a")).toBe(1);
  });

  describe("jangan dua kali", () => {
    const today = "2026-11-22";
    const yest = "2026-11-21";
    it("reminds a parent who missed yesterday and has history", () => {
      expect(needsNotTwiceReminder(ayah, { "2026-11-20": { a: true } }, today, yest)).toBe(true);
    });
    it("no reminder once they read today, or if they read yesterday", () => {
      expect(needsNotTwiceReminder(ayah, { "2026-11-20": { a: true }, [today]: { a: true } }, today, yest)).toBe(false);
      expect(needsNotTwiceReminder(ayah, { [yest]: { a: true } }, today, yest)).toBe(false);
    });
    it("never nags a new member with no history", () => {
      expect(needsNotTwiceReminder(ayah, {}, today, yest)).toBe(false);
    });
    it("never reminds children (P5)", () => {
      expect(needsNotTwiceReminder(kecil, { "2026-11-20": { k: true } }, today, yest)).toBe(false);
    });
  });
});

describe("deriveWorld", () => {
  const today = "2026-11-22";

  it("empty data: one floor under construction at 0%, small trees, no flowers", () => {
    const w = deriveWorld(data(), today);
    expect(w.house).toEqual({ floorsDone: 1, buildingFloor: true, buildProgress: 0, roofLanterns: 0, windowsLit: false });
    expect(w.trees.map((t) => t.scale)).toEqual([0.6, 0.6]);
    expect(w.garden.flowers).toBe(0);
  });

  it.each([
    [0, 1, true, 0],
    [1, 2, true, 0],
    [2, 3, false, 0],
    [5, 3, false, 3],
    [20, 3, false, 8],
  ])("khatam %i → %i floors, building=%s, %i roof lanterns", (khatam, floors, building, lanterns) => {
    const w = deriveWorld(data({ quran: { page: 1, khatam, anchor: "", mode: "normal" } }), today);
    expect(w.house).toMatchObject({ floorsDone: floors, buildingFloor: building, roofLanterns: lanterns });
  });

  it("build progress follows the bookmark", () => {
    expect(deriveWorld(data({ quran: { page: 302.5, khatam: 0, anchor: "", mode: "normal" } }), today).house.buildProgress).toBeCloseTo(0.5, 2);
    expect(deriveWorld(data({ quran: { page: 604, khatam: 0, anchor: "", mode: "normal" } }), today).house.buildProgress).toBe(1);
  });

  it("trees grow with cumulative days and never shrink when a day is missed (P3)", () => {
    expect(treeScale(0)).toBe(0.6);
    expect(treeScale(300)).toBeCloseTo(2.1);
    expect(treeScale(1000)).toBeCloseTo(2.1);
    expect(treeFruits(59)).toBe(1);
    expect(treeFruits(1000)).toBe(12);
    const readings: Readings = { "2026-11-01": { a: true }, "2026-11-02": { a: true } };
    const w = deriveWorld(data({ readings }), today);
    expect(w.trees[0]).toMatchObject({ days: 2, goldRing: false });
    expect(w.house.windowsLit).toBe(false);
  });

  it("windows light up when any parent read today; garden counts children's sit-ins", () => {
    const readings: Readings = { [today]: { i: true, k: true }, "2026-11-21": { k: true } };
    const w = deriveWorld(data({ readings }), today);
    expect(w.house.windowsLit).toBe(true);
    expect(w.trees.find((t) => t.memberId === "i")?.goldRing).toBe(true);
    expect(w.garden).toEqual({ childDays: 2, flowers: 2, litToday: true });
  });

  it("supports a second child: flowers sum across children, capped visually at 36", () => {
    const adik: Member = { id: "d", name: "Adik", role: "child" };
    const readings: Readings = {};
    for (let i = 0; i < 30; i++) readings[`2026-10-${String(i + 1).padStart(2, "0")}`] = { k: true, d: true };
    const w = deriveWorld(data({ family: { id: "f", name: "U", timeZone: "Asia/Jakarta", members: [ayah, ibu, kecil, adik] }, readings }), today);
    expect(w.garden.childDays).toBe(60);
    expect(w.garden.flowers).toBe(36);
  });
});

describe("importV3", () => {
  it("maps ayah/ibu/kecil flags onto new member ids", () => {
    let n = 0;
    const d = importV3(
      {
        "quran/state": { page: 12, khatam: 1, mode: "bertahan", anchor: "setelah Isya" },
        "reading/2026-11-22": { date: "2026-11-22", ayah: true, ibu: false, kecil: true },
        "quests/haji": { title: "ignored for now" },
      },
      { familyName: "K", ayah: "Ayah", ibu: "Ibu", kecil: "Si Kecil" },
      (p) => `${p}${n++}`,
    );
    const [a, i, k] = d.family.members;
    expect(d.quran).toEqual({ page: 12, khatam: 1, mode: "bertahan", anchor: "setelah Isya" });
    expect(d.readings["2026-11-22"]).toEqual({ [a.id]: true, [k.id]: true });
    expect(d.readings["2026-11-22"][i.id]).toBeUndefined();
    expect(d.family.timeZone).toBe("Asia/Jakarta");
  });
  it("rejects non-objects", () => {
    expect(() => importV3("x", { familyName: "", ayah: "", ibu: "", kecil: "" }, () => "id")).toThrow();
  });
});
