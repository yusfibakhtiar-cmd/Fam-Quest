/** TDD §5 family_members. Only parents may create, review and cancel quests (decision 2026-11-22). */
export type Role = "parent" | "child";

export type Member = {
  id: string;
  name: string;
  role: Role;
};

export type Family = {
  id: string;
  name: string;
  members: Member[];
};

export const ROLE_LABEL: Record<Role, string> = { parent: "Orang tua", child: "Anak" };

export const isParent = (m: Member | undefined): boolean => m?.role === "parent";
