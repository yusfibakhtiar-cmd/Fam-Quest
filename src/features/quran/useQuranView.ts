import { useFamilyStore } from "../../stores/familyStore";
import { useToday } from "../../hooks/useToday";
import { didRead, needsNotTwiceReminder } from "../../domain/quran";
import type { Member } from "../../domain/types";

export const UNIT = { normal: "halaman", bertahan: "ayat" } as const;
export const TARGET_TEXT = { normal: "Satu halaman setelah shalat", bertahan: "Satu ayat pun cukup" } as const;

/** Copy and state shared by the Qur'an screen and the world's tap cards. */
export function useQuranView() {
  const data = useFamilyStore((s) => s.data);
  const toggleToday = useFamilyStore((s) => s.toggleToday);
  const { today, yesterday } = useToday();
  const mode = data?.quran.mode ?? "normal";
  const readToday = (m: Member) => !!data && didRead(data.readings, today, m.id);
  const reminder = (m: Member) =>
    data && needsNotTwiceReminder(m, data.readings, today, yesterday)
      ? `${m.name} terlewat kemarin. Hari ini cukup satu ${UNIT[mode]} supaya tidak terlewat dua kali.`
      : null;
  return { data, today, mode, readToday, reminder, toggle: (m: Member) => toggleToday(today, m.id) };
}

export const checkLabel = (m: Member) => (m.role === "parent" ? "sudah baca hari ini" : "ikut duduk hari ini");
