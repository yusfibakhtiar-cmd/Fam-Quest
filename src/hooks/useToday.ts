import { useEffect, useState } from "react";
import { addDays, dateKeyIn } from "../domain/dates";
import { useFamilyStore } from "../stores/familyStore";
import { DEFAULT_TIME_ZONE } from "../domain/types";

/** Today's date key in the family time zone; re-evaluated every 30 s so midnight rolls over. */
export function useToday() {
  const tz = useFamilyStore((s) => s.data?.family.timeZone ?? DEFAULT_TIME_ZONE);
  const [today, setToday] = useState(() => dateKeyIn(tz));
  useEffect(() => {
    setToday(dateKeyIn(tz));
    const t = setInterval(() => setToday(dateKeyIn(tz)), 30_000);
    return () => clearInterval(t);
  }, [tz]);
  return { today, yesterday: addDays(today, -1) };
}
