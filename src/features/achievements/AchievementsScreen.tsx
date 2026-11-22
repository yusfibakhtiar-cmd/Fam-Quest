import { useMemo } from "react";
import { useGameStore } from "../../stores/gameStore";
import { useQuestStore } from "../../stores/questStore";
import { useFamilyStore } from "../../stores/familyStore";
import { useUiStore } from "../../stores/uiStore";
import { ACHIEVEMENTS } from "./definitions";
import { achievementState } from "./availability";
import { rewardText } from "./rewardText";

/** TDD §6 screen 04: achievements unlocked and not yet unlocked, with the story behind each. */
export function AchievementsScreen() {
  const claims = useGameStore((s) => s.rewardClaims);
  const quests = useQuestStore((s) => s.quests);
  const members = useFamilyStore((s) => s.family?.members ?? []);
  const go = useUiStore((s) => s.go);
  const claimedIds = useMemo(() => new Set(claims.map((c) => c.achievementId)), [claims]);
  const nameOf = (id?: string) => members.find((m) => m.id === id)?.name;

  return (
    <div className="panel">
      <header className="panel-head">
        <h2>Pencapaian</h2>
        <span className="count-badge">{claims.length}/{ACHIEVEMENTS.length}</span>
      </header>
      <ul className="achievement-list">
        {ACHIEVEMENTS.map((a) => {
          const state = achievementState(a, quests, claimedIds);
          const claim = claims.find((c) => c.achievementId === a.id);
          const quest = claim?.questId ? quests.find((q) => q.id === claim.questId) : undefined;
          return (
            <li key={a.id} className={state.kind === "claimed" ? "claimed" : ""}>
              <span className="trophy" aria-hidden>{state.kind === "claimed" ? "🏆" : "🔒"}</span>
              <div className="achievement-info">
                <strong>{a.title}</strong>
                <small>{a.description}</small>
                <small className="reward">🎁 {rewardText(a)}</small>
                {state.kind === "claimed" && claim && (
                  <small className="story">
                    Diraih {new Date(claim.claimedAt).toLocaleDateString("id-ID")}
                    {quest && <> lewat “{quest.title}”</>}
                    {nameOf(claim.approvedBy) && <>, disetujui {nameOf(claim.approvedBy)}</>}
                  </small>
                )}
                {state.kind === "linked" && (
                  <button className="link-inline" onClick={() => go("quests")}>Sedang diperjuangkan: “{state.quest.title}”</button>
                )}
                {state.kind === "available" && <small className="muted">Belum terhubung ke quest. Orang tua bisa memilihnya saat membuat quest.</small>}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
