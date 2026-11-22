import { useState } from "react";
import { useActiveMember, useFamilyStore } from "../../stores/familyStore";
import { isParent, ROLE_LABEL, type Role } from "./types";

export function FamilyHub() {
  const family = useFamilyStore((s) => s.family);
  const setActiveMember = useFamilyStore((s) => s.setActiveMember);
  const addMember = useFamilyStore((s) => s.addMember);
  const active = useActiveMember();
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("child");
  if (!family) return null;

  return (
    <div className="panel">
      <header className="panel-head">
        <h2>{family.name}</h2>
      </header>

      <section>
        <h3>Anggota</h3>
        <ul className="member-list">
          {family.members.map((m) => (
            <li key={m.id} className={m.id === active?.id ? "active" : ""}>
              <span className="avatar" aria-hidden>{m.name.charAt(0).toUpperCase()}</span>
              <span className="member-info">
                <strong>{m.name}</strong>
                <small>{ROLE_LABEL[m.role]}</small>
              </span>
              {m.id === active?.id ? (
                <span className="pill">Sedang dipakai</span>
              ) : (
                <button className="ghost-btn" onClick={() => setActiveMember(m.id)}>Gunakan</button>
              )}
            </li>
          ))}
        </ul>
        <p className="note">
          Pergantian anggota di perangkat ini belum dilindungi kata sandi. Login per anggota hadir bersama Supabase (Milestone 5).
        </p>
      </section>

      {isParent(active) && (
        <section>
          <h3>Tambah anggota</h3>
          <form
            className="inline-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (addMember(name, role)) setName("");
            }}
          >
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama" aria-label="Nama anggota" />
            <select value={role} onChange={(e) => setRole(e.target.value as Role)} aria-label="Peran">
              <option value="child">Anak</option>
              <option value="parent">Orang tua</option>
            </select>
            <button className="primary" type="submit" disabled={!name.trim()}>Tambah</button>
          </form>
        </section>
      )}
    </div>
  );
}
