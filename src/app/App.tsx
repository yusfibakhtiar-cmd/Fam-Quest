import { useEffect } from "react";
import { World } from "../game/world/World";
import { CameraHud } from "../components/ui/CameraHud";
import { InventoryBar } from "../components/ui/InventoryBar";
import { BuildMenu } from "../components/ui/BuildMenu";
import { PlacementBar } from "../components/ui/PlacementBar";
import { Toast } from "../components/ui/Toast";
import { BottomNav } from "../components/navigation/BottomNav";
import { FamilySetup } from "../features/family/FamilySetup";
import { FamilyHub } from "../features/family/FamilyHub";
import { QuestCenter } from "../features/quests/QuestCenter";
import { ROLE_LABEL } from "../features/family/types";
import { useGameStore } from "../stores/gameStore";
import { usePlacementStore } from "../stores/placementStore";
import { useActiveMember, useFamilyStore } from "../stores/familyStore";
import { useUiStore } from "../stores/uiStore";

export function App() {
  const grantStarterRewards = useGameStore((s) => s.grantStarterRewards);
  const placing = usePlacementStore((s) => s.activeType !== null);
  const openMenu = usePlacementStore((s) => s.openMenu);
  const hasFamily = useFamilyStore((s) => s.family !== null);
  const me = useActiveMember();
  const { screen, go } = useUiStore();

  // Idempotent: the store refuses to grant a claimed achievement twice.
  useEffect(() => grantStarterRewards(), [grantStarterRewards]);

  return (
    <div className="app">
      {/* The world stays mounted under the other screens so camera and placement state survive. */}
      <World />
      <header className="hud-title">
        <h1>Family Quest</h1>
        {me && (
          <button className="member-chip" onClick={() => go("family")} title="Ganti anggota">
            {me.name} · {ROLE_LABEL[me.role]}
          </button>
        )}
        {screen === "world" && <InventoryBar />}
      </header>

      {screen === "world" && (
        <>
          {!placing && <button className="build-btn primary" onClick={openMenu}>🔨 Bangun</button>}
          <CameraHud />
          <PlacementBar />
          <BuildMenu />
        </>
      )}
      {screen === "quests" && <QuestCenter />}
      {screen === "family" && <FamilyHub />}

      <BottomNav />
      {!hasFamily && <FamilySetup />}
      <Toast />
    </div>
  );
}
