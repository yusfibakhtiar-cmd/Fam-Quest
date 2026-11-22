import { useState } from "react";
import { useActiveMember, useFamilyStore } from "../../stores/familyStore";
import { pendingSubmission, useQuestStore } from "../../stores/questStore";
import { useToastStore } from "../../components/ui/Toast";
import { isParent } from "../family/types";
import { ERROR_LABEL } from "./rules";
import { ACHIEVEMENTS } from "../achievements/definitions";
import { rewardText } from "../achievements/rewardText";
import { CATEGORY_LABEL, QUEST_TYPE_LABEL, STATUS_LABEL, type Quest } from "./types";

export function QuestCard({ quest }: { quest: Quest }) {
  const me = useActiveMember();
  const members = useFamilyStore((s) => s.family?.members ?? []);
  const submissions = useQuestStore((s) => s.submissions);
  const { progress, submit, review, cancel } = useQuestStore();
  const toast = useToastStore((s) => s.show);
  const [note, setNote] = useState("");
  const [mode, setMode] = useState<null | "submit" | "reject">(null);

  const nameOf = (id?: string) => members.find((m) => m.id === id)?.name ?? "?";
  const run = (r: ReturnType<typeof submit>, success: string) => {
    if (r.ok) {
      toast(r.granted ? `🏆 ${r.granted.title}! ${rewardText(r.granted)}` : success);
      setNote("");
      setMode(null);
    } else toast(r.reason === "no_actor" ? "Pilih anggota dulu" : ERROR_LABEL[r.reason]);
  };

  const achievement = ACHIEVEMENTS.find((a) => a.id === quest.achievementId);
  const pending = pendingSubmission(submissions, quest.id);
  const lastReview = [...submissions].reverse().find((s) => s.questId === quest.id && s.decision);
  const assignedToMe = !!me && quest.assignedTo.includes(me.id);
  const parent = isParent(me);
  const workable = ["available", "in_progress", "rejected"].includes(quest.status);
  const canProgress = workable && (assignedToMe || parent) && quest.targetValue !== undefined;
  const targetMet = quest.targetValue === undefined || quest.currentValue >= quest.targetValue;
  const pct = quest.targetValue ? Math.round((quest.currentValue / quest.targetValue) * 100) : 0;

  return (
    <article className={`quest-card status-${quest.status}`}>
      <header>
        <div>
          <h4>{quest.title}</h4>
          <small>
            {CATEGORY_LABEL[quest.category]} · {QUEST_TYPE_LABEL[quest.questType]} · {quest.assignedTo.map(nameOf).join(", ")}
            {quest.dueDate && <> · tenggat {new Date(quest.dueDate).toLocaleDateString("id-ID")}</>}
          </small>
        </div>
        <span className={`pill pill-${quest.status}`}>{STATUS_LABEL[quest.status]}</span>
      </header>

      {quest.description && <p className="desc">{quest.description}</p>}
      {achievement && (
        <p className="achievement-chip">
          🏆 {quest.status === "approved" ? "Membuka" : "Akan membuka"} <strong>{achievement.title}</strong> · {rewardText(achievement)}
        </p>
      )}

      {quest.targetValue !== undefined && (
        <div className="progress">
          <div className="bar" role="progressbar" aria-valuemin={0} aria-valuemax={quest.targetValue} aria-valuenow={quest.currentValue}>
            <span style={{ width: `${pct}%` }} />
          </div>
          <span className="count">{quest.currentValue}/{quest.targetValue}</span>
          {canProgress && (
            <>
              <button className="icon-btn small" aria-label="Kurangi progres" onClick={() => run(progress(quest.id, quest.currentValue - 1), "Progres diperbarui")}>−</button>
              <button className="icon-btn small" aria-label="Tambah progres" onClick={() => run(progress(quest.id, quest.currentValue + 1), "Progres diperbarui")}>+</button>
            </>
          )}
        </div>
      )}

      {quest.status === "rejected" && lastReview?.reviewNote && (
        <p className="review-note">💬 {nameOf(lastReview.reviewedBy)}: {lastReview.reviewNote}</p>
      )}
      {quest.status === "submitted" && pending && (
        <p className="review-note">
          Diajukan oleh {nameOf(pending.submittedBy)}{pending.note && <>: “{pending.note}”</>}
        </p>
      )}
      {quest.status === "approved" && lastReview && (
        <p className="review-note ok">✓ Disetujui {nameOf(lastReview.reviewedBy)}{lastReview.reviewNote && <>: “{lastReview.reviewNote}”</>}</p>
      )}

      {mode && (
        <textarea
          className="note-input"
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={mode === "submit" ? "Catatan atau dokumentasi (opsional)" : "Apa yang perlu diperbaiki?"}
          autoFocus
        />
      )}

      <footer>
        {workable && assignedToMe && (
          mode === "submit" ? (
            <>
              <button className="ghost-btn" onClick={() => setMode(null)}>Batal</button>
              <button className="primary" onClick={() => run(submit(quest.id, note), "Diajukan untuk disetujui")}>Kirim</button>
            </>
          ) : (
            <button className="primary" disabled={!targetMet} onClick={() => setMode("submit")} title={targetMet ? "" : "Target belum tercapai"}>
              Ajukan selesai
            </button>
          )
        )}
        {quest.status === "submitted" && parent && (
          mode === "reject" ? (
            <>
              <button className="ghost-btn" onClick={() => setMode(null)}>Batal</button>
              <button className="danger" onClick={() => run(review(quest.id, "rejected", note), "Dikembalikan untuk diperbaiki")}>Kembalikan</button>
            </>
          ) : (
            <>
              <button className="ghost-btn" onClick={() => setMode("reject")}>Minta perbaikan</button>
              <button className="primary" onClick={() => run(review(quest.id, "approved", note), "Quest disetujui")}>Setujui</button>
            </>
          )
        )}
        {parent && workable && !mode && (
          <button className="link-btn" onClick={() => run(cancel(quest.id), "Quest dibatalkan")}>Batalkan quest</button>
        )}
      </footer>
    </article>
  );
}
