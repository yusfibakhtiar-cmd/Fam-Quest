# Family Quest — Rumah Kita

Dunia 3D keluarga yang **mencerminkan** apa yang benar-benar terjadi: tanpa poin, toko, atau streak.
Prinsip produk dan keputusan: [`docs/DECISIONS.md`](docs/DECISIONS.md).

## Menjalankan

```bash
npm install
npm run dev     # --host: bisa dibuka dari HP di Wi-Fi yang sama
npm test
```

## Yang sudah ada (F1 — Al-Qur'an)
- Centang harian per anggota (orang tua: "sudah baca", anak: "ikut duduk"), pengingat "jangan dua kali"
- Kalender 28 hari, pembatas mushaf keluarga (1–604), peta 30 juz, khatam
- Mode normal / bertahan, jangkar kebiasaan (140 karakter)
- Dunia: rumah bertingkat mengikuti khatam & pembatas, pohon per orang tua tumbuh dari hari membaca,
  taman bunga dari hari anak ikut duduk. Ketuk benda untuk mencatat.
- Data tersimpan di perangkat (localStorage); impor data prototipe v3

## Struktur
- `src/domain/` — logika murni + unit test: `deriveWorld`, `quran`, `dates`, `importV3`
- `src/data/repository.ts` — batas penyimpanan (localStorage sekarang, backend menyusul)
- `src/game/mirror/` — rumah, pohon, taman (dirender dari `deriveWorld`)
- `src/features/` — layar Al-Qur'an, keluarga, kartu ketuk
