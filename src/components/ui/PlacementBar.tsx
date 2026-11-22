import { useEffect } from "react";
import { CATALOG } from "../../features/builder/catalog";
import { usePlacementStatus } from "../../features/builder/usePlacementStatus";
import { MATERIAL_KEYS, MATERIAL_LABEL } from "../../features/inventory/materials";
import { useGameStore } from "../../stores/gameStore";
import { usePlacementStore } from "../../stores/placementStore";
import { useToastStore } from "./Toast";

export function PlacementBar() {
  const status = usePlacementStatus();
  const { rotate, cancel } = usePlacementStore();
  const placeBuilding = useGameStore((s) => s.placeBuilding);
  const toast = useToastStore((s) => s.show);

  const confirm = () => {
    if (!status?.canConfirm) return;
    const r = placeBuilding(status.type, status.gx, status.gz, status.rotation);
    if (r.ok) {
      toast(`${CATALOG[status.type].name} selesai dibangun`);
      cancel();
    }
  };

  useEffect(() => {
    if (!status) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "r" || e.key === "R") rotate();
      else if (e.key === "Escape") cancel();
      else if (e.key === "Enter") confirm();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!status) return null;

  let message = "Ketuk tanah untuk memindahkan";
  if (!status.placement.ok) message = status.placement.reason === "overlap" ? "Bertumpuk dengan objek lain" : "Di luar area tanah";
  else if (!status.affordable)
    message =
      "Material kurang: " +
      MATERIAL_KEYS.filter((k) => status.missing[k]).map((k) => `${status.missing[k]} ${MATERIAL_LABEL[k].name}`).join(", ");

  return (
    <div className="placement-bar" role="toolbar" aria-label="Penempatan bangunan">
      <div className="placement-text">
        <strong>{CATALOG[status.type].name}</strong>
        <small className={status.canConfirm ? "" : "warn"}>{message}</small>
      </div>
      <div className="placement-actions">
        <button className="icon-btn" onClick={cancel} aria-label="Batal">✕</button>
        <button className="icon-btn" onClick={rotate} aria-label="Putar bangunan">↻</button>
        <button className="primary" onClick={confirm} disabled={!status.canConfirm}>Bangun</button>
      </div>
    </div>
  );
}
