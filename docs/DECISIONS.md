# Keputusan Desain

Catatan keputusan yang menyimpang dari atau melengkapi TDD v0.1.

| Tanggal | Keputusan | Alasan / konsekuensi |
|---|---|---|
| 2026-11-22 | Achievement memberi **blueprint + material dalam jumlah tetap**. | Mengisi celah TDD §4.3 vs §4.2. Konsekuensi: ukuran dunia dibatasi jumlah achievement; quest berulang butuh achievement bertingkat (diputuskan di M4). |
| 2026-11-22 | Invariant: material reward ≥ biaya setiap blueprint yang dibuka. | Mencegah blueprint terbuka tapi tak bisa dibangun. Dijaga oleh `definitions.test.ts`. |
| 2026-11-22 | Achievement awal "Langkah Pertama" diberikan sekali saat pertama dibuka. | Modal untuk rumah pertama sebelum ada quest. |
| 2026-11-22 | Anchor objek = tile pojok (x, z terkecil) **setelah** rotasi; rotasi = 0–3 putaran 90°. | TDD tidak menetapkan; footprint non-persegi bertukar lebar/dalam saat diputar. |
| 2026-11-22 | Scenery (pohon, batu, jalan) disimpan sebagai data grid dan memblokir tile. | Membersihkan lahan = fitur berikutnya. |
| 2026-11-22 | **Hanya orang tua** yang menyetujui/menolak quest. | Keputusan pemilik produk. |
| 2026-11-22 | Turunan: hanya orang tua yang membuat, membatalkan quest, dan menambah anggota. Anggota yang ditugaskan mencatat progres & mengajukan; orang tua boleh membantu mencatat progres. | Konsisten dengan peran orang tua sebagai pengelola. *Perlu dikonfirmasi.* |
| 2026-11-22 | Orang tua tidak boleh menyetujui pengajuannya sendiri bila ada orang tua lain; keluarga dengan satu orang tua boleh. | Tanpa pengecualian, quest milik orang tua tunggal tak pernah bisa selesai. *Perlu dikonfirmasi.* |
| 2026-11-22 | Penolakan wajib disertai catatan; quest yang ditolak bisa dikerjakan lagi & diajukan ulang. | Penolakan tanpa alasan tidak membantu anak memperbaiki. |
| 2026-11-22 | Status `completed` dihapus (`approved` = final); `locked` ditunda. | Menghilangkan dua status yang tumpang-tindih di TDD §4.1. |
| 2026-11-22 | Pergantian anggota aktif di perangkat **belum** dilindungi. | Bukan keamanan — login per anggota datang dengan Supabase Auth (M5). Sampai itu, anak secara teknis bisa "menjadi" orang tua. |

## Terbuka
- Pindah/bongkar bangunan dengan refund — penting karena material langka.
- Penyimpanan sementara (localStorage) sebelum Milestone 5.
