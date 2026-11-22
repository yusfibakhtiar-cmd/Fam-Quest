import { useState } from "react";
import { useActiveMember } from "../../stores/familyStore";
import { useQuestStore } from "../../stores/questStore";
import { isParent } from "../family/types";
import { QuestCard } from "./QuestCard";
import { QuestForm } from "./QuestForm";
import type { Quest } from "./types";

function Section({ title, quests, empty }: { title: string; quests: Quest[]; empty?: string }) {
  if (quests.length === 0 && !empty) return null;
  return (
    <section>
      <h3>{title} <span className="count-badge">{quests.length}</span></h3>
      {quests.length === 0 ? <p className="empty">{empty}</p> : quests.map((q) => <QuestCard key={q.id} quest={q} />)}
    </section>
  );
}

export function QuestCenter() {
  const me = useActiveMember();
  const quests = useQuestStore((s) => s.quests);
  const [creating, setCreating] = useState(false);
  const parent = isParent(me);

  const toReview = parent ? quests.filter((q) => q.status === "submitted") : [];
  const active = quests.filter((q) => ["available", "in_progress", "rejected"].includes(q.status) || (!parent && q.status === "submitted"));
  const mine = parent ? active : active.filter((q) => me && q.assignedTo.includes(me.id));
  const others = parent ? [] : active.filter((q) => !(me && q.assignedTo.includes(me.id)));
  const done = quests.filter((q) => q.status === "approved");

  return (
    <div className="panel">
      <header className="panel-head">
        <h2>Quest</h2>
        {parent && !creating && <button className="primary" onClick={() => setCreating(true)}>+ Buat quest</button>}
      </header>
      {creating && <QuestForm onDone={() => setCreating(false)} />}
      {parent && <Section title="Menunggu persetujuanmu" quests={toReview} />}
      <Section
        title={parent ? "Quest aktif" : "Quest-ku"}
        quests={mine}
        empty={parent ? "Belum ada quest. Buat quest pertama keluarga." : "Belum ada quest untukmu."}
      />
      <Section title="Quest anggota lain" quests={others} />
      <Section title="Selesai" quests={done} />
    </div>
  );
}
