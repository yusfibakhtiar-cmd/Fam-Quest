/** Date keys are plain YYYY-MM-DD strings in the family's time zone (FEATURES.md §4, fix 5). */

const fmtCache = new Map<string, Intl.DateTimeFormat>();

export function dateKeyIn(timeZone: string, at: Date = new Date()): string {
  let fmt = fmtCache.get(timeZone);
  if (!fmt) {
    // en-CA formats as YYYY-MM-DD.
    fmt = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" });
    fmtCache.set(timeZone, fmt);
  }
  return fmt.format(at);
}

/** Calendar arithmetic on date keys, done in UTC so DST and device zones never shift it. */
export function addDays(key: string, days: number): string {
  const [y, m, d] = key.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + days));
  return t.toISOString().slice(0, 10);
}

/** 0 = Monday … 6 = Sunday. */
export function weekdayMon0(key: string): number {
  const [y, m, d] = key.split("-").map(Number);
  return (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7;
}

export function mondayOf(key: string): string {
  return addDays(key, -weekdayMon0(key));
}

/** The last `n` days ending today, oldest first. */
export function lastDays(today: string, n: number): string[] {
  return Array.from({ length: n }, (_, i) => addDays(today, i - (n - 1)));
}
