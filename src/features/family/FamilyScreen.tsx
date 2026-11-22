import { useState } from "react";
import { useFamilyStore } from "../../stores/familyStore";
import type { Role } from "../../domain/types";

const ROLE_LABEL: Record<Role, string> = { parent: "Orang tua", child: "Anak" };

export function FamilyScreen() {
  const data = useFamilyStore((s) => s.data);
  const addMember = useFamilyStore((s) => s.addMember);
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("child");
  if (!data) return null;

  return (
    <div className="panel">
      <header className="panel-head"><h2>{data.family.name}</h2></header>
      <section>
        <h3>Anggota</h3>
        <ul className="member-list">
          {data.family.members.map((m) => (
            <li key={m.id}>
              <span className="avatar" aria-hidden>{m.name.charAt(0).toUpperCase()}</span>
              <span className="member-info"><strong>{m.name}</strong><small>{ROLE_LABEL[m.role]}</small></span>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h3>Tambah anggota</h3>
        <form className="inline-form" onSubmit={(e) => { e.preventDefault(); addMember(name, role); setName(""); }}>
          <input id="member-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama" aria-label="Nama anggota" />
          <select id="member-role" value={role} onChange={(e) => setRole(e.target.value as Role)} aria-label="Peran">
            <option value="child">Anak</option>
            <option value="parent">Orang tua</option>
          </select>
          <button className="primary" type="submit" disabled={!name.trim()}>Tambah</button>
        </form>
      </section>
      <section>
        <h3>Penyimpanan</h3>
        <p className="note">
          Data tersimpan di perangkat ini saja (zona waktu keluarga: {data.family.timeZone}). Ponsel Ayah dan Ibu belum tersinkron.
          Sinkronisasi dan login per orang tua datang bersama backend.
        </p>
      </section>
    </div>
  );
}
