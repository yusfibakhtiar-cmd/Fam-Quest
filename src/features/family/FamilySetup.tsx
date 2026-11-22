import { useState } from "react";
import { useFamilyStore } from "../../stores/familyStore";

/** DoD: "Pengguna bisa membuat profil keluarga". The creator becomes the first parent. */
export function FamilySetup() {
  const createFamily = useFamilyStore((s) => s.createFamily);
  const [familyName, setFamilyName] = useState("");
  const [parentName, setParentName] = useState("");
  const valid = familyName.trim() && parentName.trim();

  return (
    <div className="setup-backdrop">
      <form
        className="setup-card"
        onSubmit={(e) => {
          e.preventDefault();
          if (valid) createFamily(familyName, parentName);
        }}
      >
        <h2>Selamat datang di Family Quest</h2>
        <p>Mulai dari sebidang tanah kosong. Buat profil keluarga dulu.</p>
        <label>
          Nama keluarga
          <input value={familyName} onChange={(e) => setFamilyName(e.target.value)} placeholder="mis. Keluarga Ahmad" autoFocus />
        </label>
        <label>
          Namamu (orang tua)
          <input value={parentName} onChange={(e) => setParentName(e.target.value)} placeholder="Ayah / Ibu / nama" />
        </label>
        <button className="primary" type="submit" disabled={!valid}>Mulai</button>
      </form>
    </div>
  );
}
