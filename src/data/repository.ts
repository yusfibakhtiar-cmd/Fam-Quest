import type { FamilyData } from "../domain/types";

/**
 * Storage boundary. Today: this device's localStorage. Next: a shared backend
 * (Supabase or Firebase) so Ayah's and Ibu's phones see the same data — FEATURES.md §6.
 */
export interface FamilyRepository {
  load(): FamilyData | null;
  save(data: FamilyData): void;
  clear(): void;
}

const KEY = "family-quest:v1";

export const localRepository: FamilyRepository = {
  load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      const data = JSON.parse(raw) as FamilyData;
      return data?.version === 1 ? data : null;
    } catch {
      return null; // private mode, blocked storage, or corrupt JSON: start fresh rather than crash
    }
  },
  save(data) {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch {
      /* storage unavailable — the app keeps working for this session */
    }
  },
  clear() {
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  },
};

export function memoryRepository(initial: FamilyData | null = null): FamilyRepository {
  let stored = initial ? structuredClone(initial) : null;
  return {
    load: () => (stored ? structuredClone(stored) : null),
    save: (d) => void (stored = structuredClone(d)),
    clear: () => void (stored = null),
  };
}
