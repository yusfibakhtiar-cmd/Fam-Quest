# Family Quest — Prototype v0.1

Milestone 1 (Empty World): sebidang tanah 3D isometrik 20×20 tile, kamera orthographic yang bisa digeser, di-zoom, diputar 90°, dan di-reset.

## Menjalankan

```bash
npm install
npm run dev        # buka URL yang muncul; --host agar bisa dibuka dari HP di Wi-Fi yang sama
```

## Kontrol
- Drag (mouse/1 jari): geser kamera — dibatasi agar tidak keluar dari tanah
- Scroll / cubit 2 jari: zoom
- Tombol ⟲ ⟳: putar 90° · + −: zoom · #: tampilkan grid · ⌂: reset

## Struktur
- `src/game/world/constants.ts` — ukuran grid, konversi tile → koordinat dunia, parameter kamera
- `src/game/world/scenery.ts` — pohon/batu/semak sebagai **data grid** (seeded, selalu sama). Milestone 2 harus menganggap tile ini terisi.
- `src/game/camera/CameraRig.tsx` — kamera isometrik (MapControls, rotasi bebas dimatikan)
- `src/game/terrain/` — tanah, jalan setapak, overlay grid
- `src/game/objects/Nature.tsx` — model low-poly placeholder dari primitif (bisa diganti glTF)
- `src/stores/cameraStore.ts` — state kamera (Zustand)

## Milestone 2 — Build System

- `src/features/builder/catalog.ts` — katalog bangunan (TDD §4.4)
- `src/features/builder/grid.ts` — aturan grid murni: footprint berputar (4×3 → 3×4), cek batas & tumpang-tindih
- `src/features/achievements/definitions.ts` — reward achievement = blueprint + material tetap
- `src/stores/gameStore.ts` — material, blueprint terbuka, klaim achievement (sekali saja), objek terpasang
- `src/game/placement/PlacementLayer.tsx` — ghost bangunan + tile hijau/merah

**Konvensi anchor:** `(gx, gz)` objek = tile pojok dengan x dan z terkecil *setelah* rotasi. Rotasi = jumlah putaran 90° (0–3).

**Kontrol penempatan:** ketuk/klik tanah untuk memindahkan (di desktop ghost mengikuti mouse) · `R` putar · `Enter` bangun · `Esc` batal.

**Tombol "Klaim (dev)"** hanya muncul di `npm run dev`: mensimulasikan achievement lewat jalur reward yang sama yang nanti dipakai Milestone 4.

```bash
npm test   # aturan grid, invariant ekonomi reward, dan transaksi bangun
```
