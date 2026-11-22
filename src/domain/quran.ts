import type { Member, QuranState, Readings } from "./types";

export const TOTAL_PAGES = 604; // Mushaf Madinah

export const clampPage = (p: number) => Math.min(TOTAL_PAGES, Math.max(1, Math.round(p)));

/** Approximation from FEATURES.md §3. Backlog: replace with the exact juz start-page table. */
export function juzOfPage(page: number): number {
  const p = clampPage(page);
  return p <= 21 ? 1 : Math.min(30, Math.floor((p - 2) / 20) + 1);
}

export function movePage(q: QuranState, delta: number): QuranState {
  return { ...q, page: clampPage(q.page + delta) };
}

export function jumpToPage(q: QuranState, page: number): QuranState {
  return { ...q, page: clampPage(page) };
}

export const isKhatamReady = (q: QuranState) => q.page >= TOTAL_PAGES;

export function startNextKhatam(q: QuranState): QuranState {
  if (!isKhatamReady(q)) return q;
  return { ...q, khatam: q.khatam + 1, page: 1 };
}

export const didRead = (readings: Readings, date: string, memberId: string) => readings[date]?.[memberId] === true;

/**
 * "Boleh terlewat sekali, jangan dua kali" (P4, no streaks). Shown only for parents (P5: no
 * targets for children) when they missed yesterday, have not read today, and have read at
 * least once before today — so a brand-new member is never nagged.
 */
export function needsNotTwiceReminder(member: Member, readings: Readings, today: string, yesterday: string): boolean {
  if (member.role !== "parent") return false;
  if (didRead(readings, today, member.id) || didRead(readings, yesterday, member.id)) return false;
  return Object.keys(readings).some((d) => d < today && readings[d][member.id] === true);
}

/** Cumulative days — never decreases (P3). */
export function cumulativeDays(readings: Readings, memberId: string): number {
  let n = 0;
  for (const d in readings) if (readings[d][memberId] === true) n++;
  return n;
}

export function toggleReading(readings: Readings, date: string, memberId: string): Readings {
  const day = { ...(readings[date] ?? {}) };
  day[memberId] = !day[memberId];
  return { ...readings, [date]: day };
}
