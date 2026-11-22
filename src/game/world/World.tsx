import { Canvas } from "@react-three/fiber";
import { CameraRig } from "../camera/CameraRig";
import { Lighting } from "../lighting/Lighting";
import { Terrain } from "../terrain/Terrain";
import { GridOverlay } from "../terrain/GridOverlay";
import { Nature } from "../objects/Nature";
import { Buildings } from "../buildings/Buildings";
import { PlacementLayer } from "../placement/PlacementLayer";
import { useCameraStore } from "../../stores/cameraStore";
import { usePlacementStore } from "../../stores/placementStore";

export function World() {
  const showGrid = useCameraStore((s) => s.showGrid);
  const placing = usePlacementStore((s) => s.activeType !== null);
  return (
    <Canvas
      orthographic
      shadows
      dpr={[1, 2]}
      camera={{ position: [40, 40, 40], near: 0.1, far: 500 }}
      gl={{ antialias: true }}
    >
      <color attach="background" args={["#a8d8ea"]} />
      <Lighting />
      <Terrain />
      {(showGrid || placing) && <GridOverlay />}
      <Nature />
      <Buildings />
      <PlacementLayer />
      <CameraRig />
    </Canvas>
  );
}
