import { useEffect } from "react";
import { World } from "../game/world/World";
import { CameraHud } from "../components/ui/CameraHud";
import { InventoryBar } from "../components/ui/InventoryBar";
import { BuildMenu } from "../components/ui/BuildMenu";
import { PlacementBar } from "../components/ui/PlacementBar";
import { Toast } from "../components/ui/Toast";
import { useGameStore } from "../stores/gameStore";
import { usePlacementStore } from "../stores/placementStore";

export function App() {
  const grantStarterRewards = useGameStore((s) => s.grantStarterRewards);
  const placing = usePlacementStore((s) => s.activeType !== null);
  const openMenu = usePlacementStore((s) => s.openMenu);

  // Idempotent: the store refuses to grant a claimed achievement twice.
  useEffect(() => grantStarterRewards(), [grantStarterRewards]);

  return (
    <div className="app">
      <World />
      <header className="hud-title">
        <h1>Family Quest</h1>
        <p>Geser untuk berpindah · cubit/scroll untuk zoom</p>
      </header>
      <InventoryBar />
      {!placing && (
        <button className="build-btn primary" onClick={openMenu}>🔨 Bangun</button>
      )}
      <CameraHud />
      <PlacementBar />
      <BuildMenu />
      <Toast />
    </div>
  );
}
