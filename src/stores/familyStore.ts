import { create } from "zustand";
import { isParent, type Family, type Member, type Role } from "../features/family/types";
import { newId } from "../utils/id";

type FamilyState = {
  family: Family | null;
  /**
   * Who is using the device right now. NOT authentication: anyone can switch.
   * Real per-member login arrives with Supabase auth in Milestone 5.
   */
  activeMemberId: string | null;

  createFamily: (familyName: string, parentName: string) => void;
  /** Only parents add members. Returns false if refused or invalid. */
  addMember: (name: string, role: Role) => boolean;
  setActiveMember: (id: string) => void;
};

export const useFamilyStore = create<FamilyState>((set, get) => ({
  family: null,
  activeMemberId: null,

  createFamily: (familyName, parentName) => {
    const parent: Member = { id: newId("m"), name: parentName.trim(), role: "parent" };
    set({ family: { id: newId("f"), name: familyName.trim(), members: [parent] }, activeMemberId: parent.id });
  },

  addMember: (name, role) => {
    const { family } = get();
    const actor = useActiveMember.get();
    if (!family || !isParent(actor) || !name.trim()) return false;
    set({ family: { ...family, members: [...family.members, { id: newId("m"), name: name.trim(), role }] } });
    return true;
  },

  setActiveMember: (id) => {
    if (get().family?.members.some((m) => m.id === id)) set({ activeMemberId: id });
  },
}));

const selectActive = (s: FamilyState) => s.family?.members.find((m) => m.id === s.activeMemberId);

export function useActiveMember(): Member | undefined {
  return useFamilyStore(selectActive);
}
useActiveMember.get = (): Member | undefined => selectActive(useFamilyStore.getState());
