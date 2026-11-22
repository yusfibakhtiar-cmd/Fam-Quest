# Keputusan Desain

Catatan keputusan yang menyimpang dari atau melengkapi TDD v0.1.

| Tanggal | Keputusan | Alasan / konsekuensi |
|---|---|---|
| 2026-11-22 | Achievement memberi **blueprint + material dalam jumlah tetap**. | Mengisi celah TDD §4.3 vs §4.2. Konsekuensi: ukuran dunia dibatasi jumlah achievement; quest berulang butuh achievement bertingkat (diputuskan di M4). |
| 2026-11-22 | Invariant: material reward ≥ biaya setiap blueprint yang dibuka. | Mencegah blueprint terbuka tapi tak bisa dibangun. Dijaga oleh `definitions.test.ts`. |
| 2026-11-22 | Achievement awal "Langkah Pertama" diberikan sekali saat pertama dibuka. | Modal untuk rumah pertama sebelum ada quest. |
| 2026-11-22 | Anchor objek = tile pojok (x, z terkecil) **setelah** rotasi; rotasi = 0–3 putaran 90°. | TDD tidak menetapkan; footprint non-persegi bertukar lebar/dalam saat diputar. |
| 2026-11-22 | Scenery (pohon, batu, jalan) disimpan sebagai data grid dan memblokir tile. | Membersihkan lahan = fitur berikutnya. |

## Terbuka
- **Siapa yang boleh menyetujui quest?** (penghambat Milestone 3)
- Pindah/bongkar bangunan dengan refund — penting karena material langka.
- Penyimpanan sementara (localStorage) sebelum Milestone 5.
