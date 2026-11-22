import { World } from "../game/world/World";
import { CameraHud } from "../components/ui/CameraHud";
import { Toast } from "../components/ui/Toast";
import { BottomNav } from "../components/navigation/BottomNav";
import { FamilySetup } from "../features/family/FamilySetup";
import { FamilyScreen } from "../features/family/FamilyScreen";
import { QuranScreen } from "../features/quran/QuranScreen";
import { ObjectCard } from "../features/world/ObjectCard";
import { useFamilyStore } from "../stores/familyStore";
import { useUiStore } from "../stores/uiStore";
import { useToday } from "../hooks/useToday";
import { useQuranView } from "../features/quran/useQuranView";

function HomeHint() {
  const { data, readToday } = useQuranView();
  if (!data) return null;
  const parents = data.family.members.filter((m) => m.role === "parent");
  const done = parents.filter(readToday).length;
  return <p className="home-hint">{done === parents.length && parents.length > 0 ? "Semua orang tua sudah membaca hari ini." : "Ketuk pohon atau rumah untuk mencatat."}</p>;
}

export function App() {
  const hasFamily = useFamilyStore((s) => s.data !== null);
  const name = useFamilyStore((s) => s.data?.family.name);
  const screen = useUiStore((s) => s.screen);
  const hasSelection = useUiStore((s) => s.selected !== null);
  const { today } = useToday();
  const dateLabel = new Date(`${today}T12:00:00Z`).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });

  return (
    <div className="app">
      {/* The world stays mounted so the camera keeps its place between tabs. */}
      <World paused={screen !== "home"} />
      <header className="hud-title">
        <h1>{name ?? "Rumah Kita"}</h1>
        <p className="date">{dateLabel}</p>
        {screen === "home" && <HomeHint />}
      </header>
      {screen === "home" && (
        <>
          {!hasSelection && <CameraHud />}
          <ObjectCard />
        </>
      )}
      {screen === "quran" && <QuranScreen />}
      {screen === "family" && <FamilyScreen />}
      <BottomNav />
      {!hasFamily && <FamilySetup />}
      <Toast />
    </div>
  );
}
