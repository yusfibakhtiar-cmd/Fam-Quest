import { useActiveMember } from "../../stores/familyStore";
import { useQuestStore } from "../../stores/questStore";
import { useUiStore, type Screen } from "../../stores/uiStore";
import { isParent } from "../../features/family/types";

const TABS: Array<{ id: Screen; label: string; icon: string }> = [
  { id: "world", label: "Dunia", icon: "🏡" },
  { id: "quests", label: "Quest", icon: "📜" },
  { id: "family", label: "Keluarga", icon: "👨‍👩‍👧" },
];

export function BottomNav() {
  const { screen, go } = useUiStore();
  const me = useActiveMember();
  // Badge = things waiting on *this* member: reviews for parents, rework for children.
  const badge = useQuestStore((s) =>
    isParent(me)
      ? s.quests.filter((q) => q.status === "submitted").length
      : s.quests.filter((q) => q.status === "rejected" && me && q.assignedTo.includes(me.id)).length,
  );
  return (
    <nav className="bottom-nav" aria-label="Navigasi utama">
      {TABS.map((t) => (
        <button key={t.id} className={screen === t.id ? "on" : ""} aria-current={screen === t.id ? "page" : undefined} onClick={() => go(t.id)}>
          <span aria-hidden className="nav-icon">{t.icon}</span>
          {t.label}
          {t.id === "quests" && badge > 0 && <span className="badge" aria-label={`${badge} perlu tindakan`}>{badge}</span>}
        </button>
      ))}
    </nav>
  );
}
