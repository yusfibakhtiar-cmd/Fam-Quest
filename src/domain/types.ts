/**
 * Persisted family data. Follows FEATURES.md §4 with its listed fixes:
 * members are dynamic (not hard-coded ayah/ibu/kecil), readings are keyed by member id,
 * and dates use one family time zone instead of each phone's clock.
 */
export type Role = "parent" | "child";
export type Member = { id: string; name: string; role: Role };

export type QuranMode = "normal" | "bertahan";
export type QuranState = { page: number; khatam: number; anchor: string; mode: QuranMode };

/** readings[YYYY-MM-DD][memberId] = true when that member read (parent) or sat in (child) that day. */
export type Readings = Record<string, Record<string, boolean>>;

export type FamilyData = {
  version: 1;
  family: { id: string; name: string; timeZone: string; members: Member[] };
  quran: QuranState;
  readings: Readings;
};

export const DEFAULT_TIME_ZONE = "Asia/Jakarta";
export const ANCHOR_MAX = 140;
