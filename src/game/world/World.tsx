import { Canvas } from "@react-three/fiber";
import { CameraRig } from "../camera/CameraRig";
import { Lighting } from "../lighting/Lighting";
import { Terrain } from "../terrain/Terrain";
import { Nature } from "../objects/Nature";
import { MirrorWorld } from "../mirror/MirrorWorld";
import { useUiStore } from "../../stores/uiStore";

/** `paused` stops the render loop while another tab covers the world (battery, FEATURES.md F6). */
export function World({ paused }: { paused: boolean }) {
  const select = useUiStore((s) => s.select);
  return (
    <Canvas
      orthographic
      shadows
      dpr={[1, 2]}
      frameloop={paused ? "never" : "always"}
      camera={{ position: [40, 40, 40], near: 0.1, far: 500 }}
      gl={{ antialias: true }}
      onPointerMissed={() => select(null)}
    >
      <color attach="background" args={["#a8d8ea"]} />
      <Lighting />
      <Terrain />
      <Nature />
      <MirrorWorld />
      <CameraRig />
    </Canvas>
  );
}
