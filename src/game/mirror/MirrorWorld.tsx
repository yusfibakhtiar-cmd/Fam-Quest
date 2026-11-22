import { useMemo, type ReactNode } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import { deriveWorld } from "../../domain/deriveWorld";
import { useFamilyStore } from "../../stores/familyStore";
import { useUiStore, type Selection } from "../../stores/uiStore";
import { useToday } from "../../hooks/useToday";
import { House } from "./House";
import { Tree } from "./Tree";
import { Garden } from "./Garden";
import { COLORS, LAYOUT } from "./layout";

const TAP_MAX_PX = 6; // more movement than this is a camera drag

function Tappable({ at, select, children }: { at: readonly [number, number]; select: Selection; children: ReactNode }) {
  const setSelected = useUiStore((s) => s.select);
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (e.delta <= TAP_MAX_PX) setSelected(select);
  };
  return (
    <group
      position={[at[0], 0, at[1]]}
      onClick={onClick}
      onPointerOver={() => (document.body.style.cursor = "pointer")}
      onPointerOut={() => (document.body.style.cursor = "")}
    >
      {children}
    </group>
  );
}

/** Renders deriveWorld(data) — the world only mirrors what the family actually did (P1). */
export function MirrorWorld() {
  const data = useFamilyStore((s) => s.data);
  const { today } = useToday();
  const world = useMemo(() => (data ? deriveWorld(data, today) : null), [data, today]);
  if (!world) return null;

  return (
    <group>
      <Tappable at={LAYOUT.house} select={{ kind: "house" }}>
        <House house={world.house} />
      </Tappable>
      {world.trees.slice(0, LAYOUT.trees.length).map((t, i) => (
        <Tappable key={t.memberId} at={LAYOUT.trees[i]} select={{ kind: "tree", memberId: t.memberId }}>
          <Tree tree={t} leaf={COLORS.leaves[i % COLORS.leaves.length]} />
        </Tappable>
      ))}
      <Tappable at={LAYOUT.garden} select={{ kind: "garden" }}>
        <Garden garden={world.garden} />
      </Tappable>
    </group>
  );
}
