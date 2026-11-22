import { useState } from "react";
import { useFamilyStore } from "../../stores/familyStore";

/** First run: create the family, or migrate data from prototype v3. */
export function FamilySetup() {
  const { createFamily, importFromV3 } = useFamilyStore();
  const [mode, setMode] = useState<"new" | "import">("new");
  const [familyName, setFamilyName] = useState("");
  const [p1, setP1] = useState("Ayah");
  const [p2, setP2] = useState("Ibu");
  const [kid, setKid] = useState("Si Kecil");
  const [json, setJson] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!familyName.trim() || !p1.trim()) return;
    if (mode === "new") {
      createFamily({ familyName, parents: [p1, p2], children: [kid] });
      return;
    }
    try {
      importFromV3(JSON.parse(json), { familyName, ayah: p1, ibu: p2 || "Ibu", kecil: kid || "Si Kecil" });
    } catch (err) {
      setError(err instanceof SyntaxError ? "JSON tidak valid. Tempel ulang data dari prototipe v3." : (err as Error).message);
    }
  };

  return (
    <div className="setup-backdrop">
      <form className="setup-card" onSubmit={submit}>
        <h2>Rumah Kita</h2>
        <p>Dunia ini hanya mencerminkan apa yang benar-benar terjadi. Tidak ada poin, toko, atau streak.</p>
        <div className="segmented">
          <button type="button" className={mode === "new" ? "on" : ""} onClick={() => setMode("new")}>Mulai baru</button>
          <button type="button" className={mode === "import" ? "on" : ""} onClick={() => setMode("import")}>Pindahkan dari v3</button>
        </div>
        <label>Nama keluarga<input id="family-name" value={familyName} onChange={(e) => setFamilyName(e.target.value)} placeholder="mis. Keluarga Ahmad" autoFocus /></label>
        <div className="row">
          <label>Orang tua 1<input id="p1" value={p1} onChange={(e) => setP1(e.target.value)} /></label>
          <label>Orang tua 2<input id="p2" value={p2} onChange={(e) => setP2(e.target.value)} /></label>
        </div>
        <label>Anak (opsional)<input id="kid" value={kid} onChange={(e) => setKid(e.target.value)} /></label>
        {mode === "import" && (
          <label>
            Data prototipe v3 (JSON)
            <textarea id="v3-json" rows={5} value={json} onChange={(e) => { setJson(e.target.value); setError(""); }} placeholder='{"quran/state": {...}, "reading/2026-11-22": {...}}' />
            <small className="muted">Baru data Al-Qur'an dan centang harian yang dipindahkan. Misi dan data ekonomi menyusul.</small>
          </label>
        )}
        {error && <p className="error">{error}</p>}
        <button className="primary" type="submit" disabled={!familyName.trim() || !p1.trim() || (mode === "import" && !json.trim())}>
          {mode === "new" ? "Mulai" : "Pindahkan data"}
        </button>
      </form>
    </div>
  );
}
