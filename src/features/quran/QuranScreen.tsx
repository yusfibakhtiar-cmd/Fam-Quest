import { useState } from "react";
import { useFamilyStore } from "../../stores/familyStore";
import { juzOfPage, isKhatamReady, TOTAL_PAGES, didRead } from "../../domain/quran";
import { lastDays } from "../../domain/dates";
import { ANCHOR_MAX } from "../../domain/types";
import { checkLabel, TARGET_TEXT, useQuranView } from "./useQuranView";

export function QuranScreen() {
  const { data, today, mode, readToday, reminder, toggle } = useQuranView();
  const { movePage, jumpToPage, startNextKhatam, setMode, setAnchor } = useFamilyStore();
  const [jump, setJump] = useState("");
  if (!data) return null;
  const { page, khatam, anchor } = data.quran;
  const juz = juzOfPage(page);
  const days = lastDays(today, 28);
  const members = data.family.members;
  const reminders = members.map(reminder).filter(Boolean) as string[];

  return (
    <div className="panel">
      <header className="panel-head">
        <h2>Al-Qur'an</h2>
      </header>

      <section>
        <h3>Hari ini · {TARGET_TEXT[mode].toLowerCase()}</h3>
        {reminders.map((r) => <p key={r} className="gentle">{r}</p>)}
        <ul className="checks-today">
          {members.map((m) => (
            <li key={m.id}>
              <button className={`check-btn ${readToday(m) ? "on" : ""}`} aria-pressed={readToday(m)} onClick={() => toggle(m)}>
                <span className="tick" aria-hidden>{readToday(m) ? "✓" : ""}</span>
                <span><strong>{m.name}</strong><small>{checkLabel(m)}</small></span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3>28 hari terakhir</h3>
        <div className="calendars">
          {members.map((m) => (
            <div key={m.id} className="cal">
              <span className="cal-name">{m.name}</span>
              <div className="cal-grid" role="img" aria-label={`${m.name}: ${days.filter((d) => didRead(data.readings, d, m.id)).length} dari 28 hari`}>
                {days.map((d) => (
                  <span key={d} className={`cell ${didRead(data.readings, d, m.id) ? "on" : ""} ${d === today ? "today" : ""}`} title={d} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h3 className="flush">Pembatas mushaf keluarga</h3>
        <div className="bookmark">
          <div className="page-big">
            <span className="num">{page}</span>
            <span className="of">/ {TOTAL_PAGES}</span>
          </div>
          <div className="page-meta">Juz {juz}{khatam > 0 && <> · khatam ke-{khatam} selesai</>}</div>
        </div>
        <div className="page-actions">
          <button className="icon-btn" onClick={() => movePage(-1)} aria-label="Mundur satu halaman">−1</button>
          <button className="primary" onClick={() => movePage(1)}>+1 halaman</button>
          <button className="icon-btn" onClick={() => movePage(2)} aria-label="Maju dua halaman">+2</button>
          <form className="jump" onSubmit={(e) => { e.preventDefault(); if (jump) { jumpToPage(Number(jump)); setJump(""); } }}>
            <input id="jump" type="number" min={1} max={TOTAL_PAGES} inputMode="numeric" value={jump} onChange={(e) => setJump(e.target.value)} placeholder="Ke hal." aria-label="Lompat ke halaman" />
            <button className="ghost-btn" type="submit" disabled={!jump}>Lompat</button>
          </form>
        </div>
        <div className="juz-map" aria-label={`Juz ${juz} dari 30`}>
          {Array.from({ length: 30 }, (_, i) => i + 1).map((j) => (
            <span key={j} className={`juz ${j < juz ? "done" : ""} ${j === juz ? "current" : ""}`}>{j}</span>
          ))}
        </div>
        {isKhatamReady(data.quran) && (
          <div className="khatam">
            <strong>Alhamdulillah, khatam.</strong>
            <p>Satu lantai rumah keluarga selesai berdiri.</p>
            <button className="primary" onClick={startNextKhatam}>Mulai khatam berikutnya</button>
          </div>
        )}
      </section>
      <section className="card">
        <h3 className="flush">Target dan jangkar</h3>
        <div className="segmented" role="radiogroup" aria-label="Target harian">
          {(["normal", "bertahan"] as const).map((m) => (
            <button key={m} role="radio" aria-checked={mode === m} className={mode === m ? "on" : ""} onClick={() => setMode(m)}>
              {m === "normal" ? "Normal" : "Mode bertahan"}
            </button>
          ))}
        </div>
        <p className="target">{TARGET_TEXT[mode]}</p>
        {mode === "bertahan" && <p className="note">Untuk masa lelah, sakit, hamil, atau ada bayi. Ini bukan kegagalan.</p>}
        <label htmlFor="anchor">Jangkar kebiasaan</label>
        <textarea
          id="anchor"
          rows={2}
          maxLength={ANCHOR_MAX}
          value={anchor}
          onChange={(e) => setAnchor(e.target.value)}
          placeholder="Ayah: setelah shalat di masjid. Bersama: setelah Isya, di rumah."
        />
        <small className="muted counter">{anchor.length}/{ANCHOR_MAX}</small>
      </section>

    </div>
  );
}
