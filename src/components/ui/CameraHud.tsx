import { useCameraStore } from "../../stores/cameraStore";

export function CameraHud() {
  const { rotate, zoomBy, reset } = useCameraStore();
  return (
    <div className="hud-controls" role="toolbar" aria-label="Kontrol kamera">
      <button onClick={() => rotate(-1)} aria-label="Putar kiri" title="Putar kiri">⟲</button>
      <button onClick={() => rotate(1)} aria-label="Putar kanan" title="Putar kanan">⟳</button>
      <button onClick={() => zoomBy(1.4)} aria-label="Perbesar" title="Perbesar">+</button>
      <button onClick={() => zoomBy(1 / 1.4)} aria-label="Perkecil" title="Perkecil">−</button>
      <button onClick={reset} aria-label="Reset kamera" title="Reset">⌂</button>
    </div>
  );
}
