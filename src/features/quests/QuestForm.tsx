import { useState } from "react";
import { useFamilyStore } from "../../stores/familyStore";
import { useQuestStore } from "../../stores/questStore";
import { useToastStore } from "../../components/ui/Toast";
import { useGameStore } from "../../stores/gameStore";
import { ACHIEVEMENTS } from "../achievements/definitions";
import { attachableAchievementIds } from "../achievements/availability";
import { rewardText } from "../achievements/rewardText";
import { ERROR_LABEL } from "./rules";
import { CATEGORY_LABEL, QUEST_CATEGORIES, QUEST_TYPES, QUEST_TYPE_LABEL, type QuestCategory, type QuestType } from "./types";

export function QuestForm({ onDone }: { onDone: () => void }) {
  const members = useFamilyStore((s) => s.family?.members ?? []);
  const create = useQuestStore((s) => s.create);
  const toast = useToastStore((s) => s.show);
  const quests = useQuestStore((s) => s.quests);
  const claims = useGameStore((s) => s.rewardClaims);
  const attachable = attachableAchievementIds(quests, new Set(claims.map((c) => c.achievementId)));
  const options = ACHIEVEMENTS.filter((a) => attachable.has(a.id));
  const [achievementId, setAchievementId] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<QuestCategory>("family");
  const [questType, setQuestType] = useState<QuestType>("project");
  const [assignedTo, setAssignedTo] = useState<string[]>([]);
  const [target, setTarget] = useState("");
  const [dueDate, setDueDate] = useState("");

  const toggle = (id: string) =>
    setAssignedTo((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = create({
      title, description, category, questType, assignedTo,
      targetValue: target ? Number(target) : undefined,
      dueDate: dueDate || undefined,
      achievementId: achievementId || undefined,
    });
    if (r.ok) {
      toast("Quest dibuat");
      onDone();
    } else toast(r.reason === "no_actor" ? "Pilih anggota dulu" : ERROR_LABEL[r.reason]);
  };

  return (
    <form className="quest-form" onSubmit={submit}>
      <label>
        Judul
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Membangun Kebun Keluarga" autoFocus />
      </label>
      <label>
        Deskripsi
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Apa yang dikerjakan dan bagaimana tahu sudah selesai?" />
      </label>
      <div className="row">
        <label>
          Kategori
          <select value={category} onChange={(e) => setCategory(e.target.value as QuestCategory)}>
            {QUEST_CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>)}
          </select>
        </label>
        <label>
          Jenis
          <select value={questType} onChange={(e) => setQuestType(e.target.value as QuestType)}>
            {QUEST_TYPES.map((t) => <option key={t} value={t}>{QUEST_TYPE_LABEL[t]}</option>)}
          </select>
        </label>
      </div>
      <fieldset>
        <legend>Ditugaskan kepada</legend>
        <div className="checks">
          {members.map((m) => (
            <label key={m.id} className={`check ${assignedTo.includes(m.id) ? "on" : ""}`}>
              <input type="checkbox" checked={assignedTo.includes(m.id)} onChange={() => toggle(m.id)} />
              {m.name}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="row">
        <label>
          Target (opsional)
          <input type="number" min={1} step={1} inputMode="numeric" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="mis. 30 hari" />
        </label>
        <label>
          Tenggat (opsional)
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </label>
      </div>
      <label>
        Achievement saat disetujui (opsional)
        <select value={achievementId} onChange={(e) => setAchievementId(e.target.value)}>
          <option value="">Tanpa achievement</option>
          {options.map((a) => (
            <option key={a.id} value={a.id}>🏆 {a.title} — {rewardText(a)}</option>
          ))}
        </select>
        {options.length === 0 && <small className="muted">Semua achievement sudah diraih atau sedang dipakai quest lain.</small>}
      </label>
      <div className="form-actions">
        <button type="button" className="ghost-btn" onClick={onDone}>Batal</button>
        <button type="submit" className="primary" disabled={!title.trim() || assignedTo.length === 0}>Buat quest</button>
      </div>
    </form>
  );
}
