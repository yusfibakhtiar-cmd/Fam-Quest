import { useMemo } from "react";
import { useUiStore } from "../../stores/uiStore";
import { useFamilyStore } from "../../stores/familyStore";
import { deriveWorld } from "../../domain/deriveWorld";
import { juzOfPage } from "../../domain/quran";
import { checkLabel, useQuranView } from "../quran/useQuranView";

/** Tap card (FEATURES.md F6): title, current value, the rule behind it, and only real-world actions (P8). */
export function ObjectCard() {
  const selected = useUiStore((s) => s.selected);
  const { select, go } = useUiStore();
  const movePage = useFamilyStore((s) => s.movePage);
  const { data, today, readToday, reminder, toggle } = useQuranView();
  const world = useMemo(() => (data ? deriveWorld(data, today) : null), [data, today]);
  if (!selected || !data || !world) return null;

  let title = "";
  let value = "";
  let rule = "";
  let actions: React.ReactNode = null;

  if (selected.kind === "house") {
    const { house, quran } = world;
    title = "Rumah";
    value = `${house.floorsDone} lantai berdiri · halaman ${quran.page} (juz ${juzOfPage(quran.page)})${house.buildingFloor ? ` · lantai berikutnya ${Math.round(house.buildProgress * 100)}%` : ""}`;
    rule = "Lantai baru tumbuh mengikuti pembatas mushaf; setiap khatam menyelesaikan satu lantai. Setelah tiga lantai, setiap khatam menambah satu lentera di atap. Jendela menyala bila orang tua sudah membaca hari ini.";
    actions = (
      <>
        <button className="ghost-btn" onClick={() => go("quran")}>Buka Al-Qur'an</button>
        <button className="icon-btn" onClick={() => movePage(2)}>+2</button>
        <button className="primary" onClick={() => movePage(1)}>+1 halaman</button>
      </>
    );
  } else if (selected.kind === "tree") {
    const m = data.family.members.find((x) => x.id === selected.memberId);
    const t = world.trees.find((x) => x.memberId === selected.memberId);
    if (!m || !t) return null;
    const r = reminder(m);
    title = `Pohon ${m.name}`;
    value = `${t.days} hari membaca · ${t.fruits} buah`;
    rule = "Pohon tumbuh dari jumlah hari membaca dan tidak pernah layu. Satu buah setiap 30 hari. Cincin emas berarti sudah membaca hari ini.";
    actions = (
      <>
        {r && <p className="gentle wide">{r}</p>}
        <button className={readToday(m) ? "ghost-btn" : "primary"} onClick={() => toggle(m)}>
          {readToday(m) ? "Batalkan centang hari ini" : `Centang: ${checkLabel(m)}`}
        </button>
      </>
    );
  } else {
    const kids = data.family.members.filter((m) => m.role === "child");
    title = "Taman";
    value = `${world.garden.childDays} hari ikut duduk`;
    rule = "Satu bunga untuk setiap hari anak ikut duduk saat membaca. Tidak ada target dan tidak ada hadiah.";
    actions = kids.length ? (
      kids.map((k) => (
        <button key={k.id} className={readToday(k) ? "ghost-btn" : "primary"} onClick={() => toggle(k)}>
          {readToday(k) ? `${k.name}: batalkan` : `${k.name} ikut hari ini`}
        </button>
      ))
    ) : (
      <p className="muted wide">Belum ada anak di daftar keluarga.</p>
    );
  }

  return (
    <div className="object-card" role="dialog" aria-label={title}>
      <header>
        <h3>{title}</h3>
        <button className="icon-btn" onClick={() => select(null)} aria-label="Tutup">✕</button>
      </header>
      <p className="value">{value}</p>
      <p className="rule">{rule}</p>
      <footer>{actions}</footer>
    </div>
  );
}
