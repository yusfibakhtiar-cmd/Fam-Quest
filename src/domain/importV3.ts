import { ANCHOR_MAX, DEFAULT_TIME_ZONE, type FamilyData, type Member, type Readings } from "./types";
import { clampPage } from "./quran";

/**
 * Migrates prototype v3 data (FEATURES.md §4 "Data saat ini": keys like "quran/state" and
 * "reading/YYYY-MM-DD" with ayah/ibu/kecil flags) into the member-keyed model.
 * Only F1 data (Qur'an + readings) is imported for now; quests/finance come with F2/F5.
 */
export type V3Names = { familyName: string; ayah: string; ibu: string; kecil: string };

export function importV3(raw: unknown, names: V3Names, makeId: (p: string) => string): FamilyData {
  if (!raw || typeof raw !== "object") throw new Error("Data bukan objek JSON.");
  const src = raw as Record<string, any>;

  const members: Member[] = [
    { id: makeId("m"), name: names.ayah, role: "parent" },
    { id: makeId("m"), name: names.ibu, role: "parent" },
    { id: makeId("m"), name: names.kecil, role: "child" },
  ];
  const [ayah, ibu, kecil] = members;

  const q = src["quran/state"] ?? {};
  const readings: Readings = {};
  for (const [key, value] of Object.entries(src)) {
    const m = /^reading\/(\d{4}-\d{2}-\d{2})$/.exec(key);
    if (!m || !value || typeof value !== "object") continue;
    const v = value as Record<string, unknown>;
    const day: Record<string, boolean> = {};
    if (v.ayah === true) day[ayah.id] = true;
    if (v.ibu === true) day[ibu.id] = true;
    if (v.kecil === true) day[kecil.id] = true;
    readings[m[1]] = day;
  }

  return {
    version: 1,
    family: { id: makeId("f"), name: names.familyName, timeZone: DEFAULT_TIME_ZONE, members },
    quran: {
      page: clampPage(Number(q.page) || 1),
      khatam: Math.max(0, Math.floor(Number(q.khatam) || 0)),
      anchor: String(q.anchor ?? "").slice(0, ANCHOR_MAX),
      mode: q.mode === "bertahan" ? "bertahan" : "normal",
    },
    readings,
  };
}
