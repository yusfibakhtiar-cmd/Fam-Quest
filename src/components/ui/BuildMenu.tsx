import { CATALOG, CATALOG_ORDER } from "../../features/builder/catalog";
import { ACHIEVEMENT_BY_BLUEPRINT } from "../../features/achievements/definitions";
import { canAfford } from "../../features/inventory/materials";
import { useGameStore } from "../../stores/gameStore";
import { usePlacementStore } from "../../stores/placementStore";
import { CostList } from "./CostList";

export function BuildMenu() {
  const { menuOpen, closeMenu, start } = usePlacementStore();
  const materials = useGameStore((s) => s.materials);
  const unlocked = useGameStore((s) => s.unlockedBlueprints);
  const grantAchievement = useGameStore((s) => s.grantAchievement);
  if (!menuOpen) return null;

  return (
    <div className="sheet-backdrop" onClick={closeMenu}>
      <section className="sheet" role="dialog" aria-label="Menu bangun" onClick={(e) => e.stopPropagation()}>
        <header className="sheet-head">
          <h2>Bangun</h2>
          <button className="icon-btn" onClick={closeMenu} aria-label="Tutup">✕</button>
        </header>
        <ul className="catalog">
          {CATALOG_ORDER.map((id) => {
            const def = CATALOG[id];
            const isUnlocked = unlocked.includes(id);
            const affordable = canAfford(materials, def.constructionCost);
            const source = ACHIEVEMENT_BY_BLUEPRINT.get(id);
            return (
              <li key={id} className={isUnlocked ? "" : "locked"}>
                <div className="catalog-info">
                  <strong>{def.name}</strong>
                  <small>
                    {def.footprint.width}×{def.footprint.depth} tile · <CostList cost={def.constructionCost} have={materials} />
                  </small>
                  {!isUnlocked && source && <small className="hint">🔒 Achievement: {source.title}</small>}
                </div>
                {isUnlocked ? (
                  <button className="primary" disabled={!affordable} onClick={() => start(id)}>
                    {affordable ? "Pilih" : "Kurang"}
                  </button>
                ) : (
                  import.meta.env.DEV && source && (
                    // Dev-only stand-in for Milestone 4: grants the achievement through the real reward path.
                    <button className="ghost-btn" onClick={() => grantAchievement(source.id)} title="Hanya di mode dev">
                      Klaim (dev)
                    </button>
                  )
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
