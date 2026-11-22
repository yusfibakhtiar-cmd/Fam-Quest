import { useUiStore, type Screen } from "../../stores/uiStore";

const TABS: Array<{ id: Screen; label: string; icon: string }> = [
  { id: "home", label: "Rumah", icon: "🏡" },
  { id: "quran", label: "Al-Qur'an", icon: "📖" },
  { id: "family", label: "Keluarga", icon: "👨‍👩‍👧" },
];

export function BottomNav() {
  const { screen, go } = useUiStore();
  return (
    <nav className="bottom-nav" aria-label="Navigasi utama">
      {TABS.map((t) => (
        <button key={t.id} className={screen === t.id ? "on" : ""} aria-current={screen === t.id ? "page" : undefined} onClick={() => go(t.id)}>
          <span aria-hidden className="nav-icon">{t.icon}</span>
          {t.label}
        </button>
      ))}
    </nav>
  );
}
