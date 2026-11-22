import { useLayoutEffect, useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Mesh, type Group, type Material } from "three";
import { usePlacementStore } from "../../stores/placementStore";
import { usePlacementStatus } from "../../features/builder/usePlacementStatus";
import { rotatedFootprint, tilesOf } from "../../features/builder/grid";
import { BUILDING_MODELS } from "../buildings/models";
import { footprintCenter, rotationRadians, worldToTile } from "../buildings/placementMath";
import { TILE_SIZE, WORLD_SIZE, tileToWorld } from "../world/constants";

const TAP_MAX_PX = 6; // movement above this is a camera drag, not a tap

/** Translucent copy of a building model. Materials are cloned so the real buildings are untouched. */
function GhostModel({ children }: { children: React.ReactNode }) {
  const ref = useRef<Group>(null);
  useLayoutEffect(() => {
    ref.current?.traverse((o) => {
      if (!(o instanceof Mesh) || o.userData.ghost) return;
      o.userData.ghost = true;
      o.raycast = () => {}; // never block the ground catcher
      const m = (o.material as Material).clone();
      m.transparent = true;
      m.opacity = 0.6;
      m.depthWrite = false;
      o.material = m;
      o.castShadow = false;
    });
  });
  return <group ref={ref}>{children}</group>;
}

export function PlacementLayer() {
  const aimAt = usePlacementStore((s) => s.aimAt);
  const status = usePlacementStatus();
  const bob = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (bob.current) bob.current.position.y = 0.25 + Math.sin(clock.elapsedTime * 4) * 0.08;
  });

  if (!status) return null;

  const aim = (e: ThreeEvent<PointerEvent | MouseEvent>) => {
    const [tx, tz] = worldToTile(e.point.x, e.point.z);
    aimAt(tx, tz);
  };
  // Desktop: the ghost follows the hovering mouse. Touch/click: a tap moves it; drags pan the camera.
  const onMove = (e: ThreeEvent<PointerEvent>) => {
    if (e.pointerType === "mouse" && e.buttons === 0) aim(e);
  };
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    if (e.delta <= TAP_MAX_PX) aim(e);
  };

  const { type, gx, gz, rotation, placement } = status;
  const Model = BUILDING_MODELS[type];
  const [cx, cz] = footprintCenter(type, gx, gz, rotation);
  const ok = placement.ok;
  const tiles = tilesOf(gx, gz, rotatedFootprint(type, rotation));

  return (
    <group>
      {/* Invisible ground catcher for pointer events while placing */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]} onPointerMove={onMove} onClick={onClick}>
        <planeGeometry args={[WORLD_SIZE, WORLD_SIZE]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {tiles.map(([x, z]) => {
        const [wx, wz] = tileToWorld(x, z);
        return (
          <mesh key={`${x},${z}`} renderOrder={10} position={[wx, 0.07, wz]} rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
            <planeGeometry args={[TILE_SIZE * 0.92, TILE_SIZE * 0.92]} />
            <meshBasicMaterial color={ok ? "#4caf50" : "#e53935"} transparent opacity={0.55} depthWrite={false} depthTest={ok} />
          </mesh>
        );
      })}

      <group ref={bob} position={[cx, 0.25, cz]} rotation={[0, rotationRadians(rotation), 0]}>
        {/* key forces fresh materials when the blueprint changes */}
        <GhostModel key={type}>
          <Model />
        </GhostModel>
      </group>
    </group>
  );
}
