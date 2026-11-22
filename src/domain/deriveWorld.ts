import { cumulativeDays, didRead, TOTAL_PAGES, clampPage } from "./quran";
import type { FamilyData } from "./types";

/**
 * P1 "cermin, bukan toko": the world is a pure function of what actually happened.
 * Nothing here can be bought, placed or lost; worship elements only grow (P3).
 * Mapping rules from FEATURES.md §3. Visual caps are display choices — data is never capped.
 *
 * F1 only for now: house, parent trees, children's garden. Well, field, haji path,
 * fence and memory lanterns arrive with F2–F5.
 */
export type TreeState = { memberId: string; name: string; days: number; scale: number; fruits: number; goldRing: boolean };

export type WorldState = {
  house: { floorsDone: number; buildingFloor: boolean; buildProgress: number; roofLanterns: number; windowsLit: boolean };
  trees: TreeState[];
  garden: { childDays: number; flowers: number; litToday: boolean };
  quran: { page: number; khatam: number };
};

export const treeScale = (d: number) => 0.6 + (Math.min(d, 300) / 300) * 1.5;
export const treeFruits = (d: number) => Math.min(12, Math.floor(d / 30));

export function deriveWorld(data: FamilyData, today: string): WorldState {
  const page = clampPage(data.quran.page);
  const kh = Math.max(0, Math.floor(data.quran.khatam));
  const floorsDone = Math.min(3, 1 + kh);
  const parents = data.family.members.filter((m) => m.role === "parent");
  const children = data.family.members.filter((m) => m.role === "child");
  const childDays = children.reduce((sum, c) => sum + cumulativeDays(data.readings, c.id), 0);

  return {
    house: {
      floorsDone,
      buildingFloor: floorsDone < 3,
      buildProgress: page >= TOTAL_PAGES ? 1 : (page - 1) / (TOTAL_PAGES - 1),
      roofLanterns: Math.min(8, Math.max(0, kh - 2)),
      windowsLit: parents.some((p) => didRead(data.readings, today, p.id)),
    },
    trees: parents.map((p) => {
      const days = cumulativeDays(data.readings, p.id);
      return { memberId: p.id, name: p.name, days, scale: treeScale(days), fruits: treeFruits(days), goldRing: didRead(data.readings, today, p.id) };
    }),
    garden: {
      childDays,
      flowers: Math.min(36, childDays),
      litToday: children.some((c) => didRead(data.readings, today, c.id)),
    },
    quran: { page, khatam: kh },
  };
}
