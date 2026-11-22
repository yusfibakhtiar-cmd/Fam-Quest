import { useEffect, useLayoutEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { MapControls } from "@react-three/drei";
import { MOUSE, TOUCH, Vector3, type OrthographicCamera } from "three";
import type { MapControls as MapControlsImpl } from "three-stdlib";
import { CAMERA, HALF_WORLD } from "../world/constants";
import { useCameraStore } from "../../stores/cameraStore";

const BASE_AZIMUTH = Math.PI / 4; // looking at the land corner-on, classic isometric
const ELEVATION = (CAMERA.elevationDeg * Math.PI) / 180;
const PAN_LIMIT = HALF_WORLD + CAMERA.panMargin;
const ORIGIN = new Vector3(0, 0, 0);

/** Zoom that fits the whole land on screen; phones get a smaller value than desktops. */
export function fitZoom(width: number, height: number) {
  const landDiagonal = HALF_WORLD * 2 * Math.SQRT2;
  return Math.min(width / (landDiagonal * 1.05), height / (landDiagonal * 0.75));
}

/**
 * Isometric-style orthographic camera (TDD §3.3):
 * drag = pan, wheel/pinch = zoom, buttons = 90° rotation / reset.
 * Free orbit is disabled on purpose — it is what makes mobile controls confusing.
 */
export function CameraRig() {
  const controls = useRef<MapControlsImpl>(null);
  const camera = useThree((s) => s.camera) as OrthographicCamera;
  const size = useThree((s) => s.size);

  const rotationStep = useCameraStore((s) => s.rotationStep);
  const resetToken = useCameraStore((s) => s.resetToken);
  const zoomRequest = useCameraStore((s) => s.zoomRequest);

  const defaultZoom = Math.max(CAMERA.minZoom, fitZoom(size.width, size.height));

  const anim = useRef({
    azimuth: BASE_AZIMUTH,
    azimuthGoal: BASE_AZIMUTH,
    zoomGoal: null as number | null,
    targetGoal: null as Vector3 | null,
  });

  const placeCamera = () => {
    const c = controls.current;
    if (!c) return;
    const { azimuth } = anim.current;
    const horizontal = Math.cos(ELEVATION) * CAMERA.distance;
    camera.position.set(
      c.target.x + Math.sin(azimuth) * horizontal,
      c.target.y + Math.sin(ELEVATION) * CAMERA.distance,
      c.target.z + Math.cos(azimuth) * horizontal,
    );
    camera.lookAt(c.target);
    c.update();
  };

  // Initial framing.
  useLayoutEffect(() => {
    camera.zoom = defaultZoom;
    camera.updateProjectionMatrix();
    placeCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    anim.current.azimuthGoal = BASE_AZIMUTH + rotationStep * (Math.PI / 2);
  }, [rotationStep]);

  useEffect(() => {
    if (resetToken === 0) return;
    anim.current.zoomGoal = defaultZoom;
    anim.current.targetGoal = ORIGIN.clone();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetToken]);

  useEffect(() => {
    if (zoomRequest.token === 0) return;
    const from = anim.current.zoomGoal ?? camera.zoom;
    anim.current.zoomGoal = Math.min(CAMERA.maxZoom, Math.max(CAMERA.minZoom, from * zoomRequest.factor));
  }, [zoomRequest, camera]);

  useFrame((_, dt) => {
    const c = controls.current;
    if (!c) return;
    const a = anim.current;
    const k = 1 - Math.exp(-dt * 10); // frame-rate independent easing
    let moved = false;

    const dAz = a.azimuthGoal - a.azimuth;
    if (dAz !== 0) {
      a.azimuth = Math.abs(dAz) < 1e-3 ? a.azimuthGoal : a.azimuth + dAz * k;
      moved = true;
    }
    if (a.targetGoal) {
      c.target.lerp(a.targetGoal, k);
      if (c.target.distanceTo(a.targetGoal) < 0.01) {
        c.target.copy(a.targetGoal);
        a.targetGoal = null;
      }
      moved = true;
    }
    if (a.zoomGoal !== null) {
      const dz = a.zoomGoal - camera.zoom;
      camera.zoom = Math.abs(dz) < 0.01 ? a.zoomGoal : camera.zoom + dz * k;
      if (camera.zoom === a.zoomGoal) a.zoomGoal = null;
      camera.updateProjectionMatrix();
      moved = true;
    }
    if (moved) placeCamera();
  });

  /** Keep the view over the land: clamp the pan target and drag the camera along with it. */
  const clampTarget = () => {
    const c = controls.current;
    if (!c) return;
    const x = Math.min(PAN_LIMIT, Math.max(-PAN_LIMIT, c.target.x));
    const z = Math.min(PAN_LIMIT, Math.max(-PAN_LIMIT, c.target.z));
    const dx = x - c.target.x;
    const dz = z - c.target.z;
    if (dx !== 0 || dz !== 0 || c.target.y !== 0) {
      const dy = -c.target.y;
      c.target.set(x, 0, z);
      camera.position.x += dx;
      camera.position.y += dy;
      camera.position.z += dz;
    }
  };

  return (
    <MapControls
      ref={controls}
      makeDefault
      enableRotate={false}
      enableDamping
      dampingFactor={0.12}
      screenSpacePanning={false}
      minZoom={CAMERA.minZoom}
      maxZoom={CAMERA.maxZoom}
      zoomSpeed={1.2}
      mouseButtons={{ LEFT: MOUSE.PAN, MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.PAN }}
      touches={{ ONE: TOUCH.PAN, TWO: TOUCH.DOLLY_PAN }}
      onChange={clampTarget}
    />
  );
}
