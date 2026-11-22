import { create } from "zustand";
import { localRepository, type FamilyRepository } from "../data/repository";
import { DEFAULT_TIME_ZONE, ANCHOR_MAX, type FamilyData, type Member, type QuranMode, type Role } from "../domain/types";
import { jumpToPage, movePage, startNextKhatam, toggleReading } from "../domain/quran";
import { importV3, type V3Names } from "../domain/importV3";
import { newId } from "../utils/id";

type FamilyStore = {
  data: FamilyData | null;
  createFamily: (input: { familyName: string; parents: string[]; children: string[] }) => void;
  importFromV3: (raw: unknown, names: V3Names) => void;
  addMember: (name: string, role: Role) => void;
  toggleToday: (date: string, memberId: string) => void;
  movePage: (delta: number) => void;
  jumpToPage: (page: number) => void;
  startNextKhatam: () => void;
  setMode: (mode: QuranMode) => void;
  setAnchor: (anchor: string) => void;
};

/**
 * Every change is written through to the repository immediately: a check-in after Isya
 * must survive closing the app (FEATURES.md §6 offline-first).
 */
export function createFamilyStore(repo: FamilyRepository) {
  return create<FamilyStore>((set, get) => {
    const commit = (next: FamilyData) => {
      repo.save(next);
      set({ data: next });
    };
    const update = (fn: (d: FamilyData) => FamilyData) => {
      const d = get().data;
      if (d) commit(fn(d));
    };
    const member = (name: string, role: Role): Member => ({ id: newId("m"), name: name.trim(), role });

    return {
      data: repo.load(),

      createFamily: ({ familyName, parents, children }) =>
        commit({
          version: 1,
          family: {
            id: newId("f"),
            name: familyName.trim(),
            timeZone: DEFAULT_TIME_ZONE,
            members: [
              ...parents.filter((n) => n.trim()).map((n) => member(n, "parent")),
              ...children.filter((n) => n.trim()).map((n) => member(n, "child")),
            ],
          },
          quran: { page: 1, khatam: 0, anchor: "", mode: "normal" },
          readings: {},
        }),

      importFromV3: (raw, names) => commit(importV3(raw, names, newId)),

      addMember: (name, role) => {
        if (!name.trim()) return;
        update((d) => ({ ...d, family: { ...d.family, members: [...d.family.members, member(name, role)] } }));
      },

      toggleToday: (date, memberId) => update((d) => ({ ...d, readings: toggleReading(d.readings, date, memberId) })),
      movePage: (delta) => update((d) => ({ ...d, quran: movePage(d.quran, delta) })),
      jumpToPage: (page) => update((d) => ({ ...d, quran: jumpToPage(d.quran, page) })),
      startNextKhatam: () => update((d) => ({ ...d, quran: startNextKhatam(d.quran) })),
      setMode: (mode) => update((d) => ({ ...d, quran: { ...d.quran, mode } })),
      setAnchor: (anchor) => update((d) => ({ ...d, quran: { ...d.quran, anchor: anchor.slice(0, ANCHOR_MAX) } })),
    };
  });
}

export const useFamilyStore = createFamilyStore(localRepository);
