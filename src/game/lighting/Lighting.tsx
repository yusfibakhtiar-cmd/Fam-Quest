import { HALF_WORLD } from "../world/constants";

/** Warm tropical daylight: sky/ground fill + one shadow-casting sun. */
export function Lighting() {
  const s = HALF_WORLD + 8;
  return (
    <>
      <hemisphereLight args={["#fff8e1", "#7cb342", 0.9]} />
      <directionalLight
        position={[25, 40, 15]}
        intensity={2.2}
        color="#fff3d6"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-s}
        shadow-camera-right={s}
        shadow-camera-top={s}
        shadow-camera-bottom={-s}
        shadow-camera-near={1}
        shadow-camera-far={120}
        shadow-bias={-0.0004}
        shadow-normalBias={0.04}
      />
    </>
  );
}
