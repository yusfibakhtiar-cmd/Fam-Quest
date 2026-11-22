# Keputusan Desain

## 2026-11-22 — Arah produk: dunia sebagai cermin (pivot)

Spesifikasi fitur prototipe v3 menjadi acuan utama, menggantikan TDD v0.1 di titik yang bertentangan.
Prinsip yang wajib dijaga:

| # | Prinsip | Dijaga oleh |
|---|---|---|
| P1 | Cermin, bukan toko: tanpa mata uang, poin, XP, pembelian | `deriveWorld()` murni; sistem material & menu bangun dihapus |
| P2 | Ibadah tidak jadi transaksi/kompetisi | tidak ada reward, leaderboard, atau notifikasi "kalah" |
| P3 | Tidak ada yang layu karena terlewat | elemen ibadah dihitung kumulatif (test) |
| P4 | Tanpa streak; "boleh terlewat sekali, jangan dua kali" | `needsNotTwiceReminder()` (test) |
| P5 | Anak tanpa target dan tanpa hadiah | anak hanya "ikut duduk" → bunga; tanpa pengingat (test) |
| P6 | Mode bertahan | target "satu ayat pun cukup", bukan kegagalan |
| P7 | Privat | tidak ada fitur berbagi |
| P8 | Setiap aksi di game adalah aksi nyata | ketuk benda hanya mencatat aktivitas nyata; tidak ada penempatan bebas |

**Dihapus dari Milestone 2–4:** material, menu bangun & penempatan bebas, quest dengan pengajuan/persetujuan
orang tua, achievement dengan reward. Riwayatnya tetap ada di branch `milestone-4-achievements`.

**Dipertahankan:** mesin 3D (kamera, terrain, lighting, model low-poly), anggota keluarga dinamis dengan peran.

## Keputusan pendukung

| Keputusan | Alasan |
|---|---|
| Dunia memakai homestead isometrik yang ada dengan tata letak tetap, bukan pulau melayang | Mesin dan kamera sudah teruji; yang penting aturan pemetaannya |
| Anggota dinamis (`members` + `readings[date][memberId]`) | Anak kedua direncanakan; tidak lagi hard-code ayah/ibu/kecil |
| Tanggal dihitung di zona waktu keluarga (`Asia/Jakarta`), bukan jam perangkat | Mencegah tanggal bergeser antar ponsel |
| Siapa pun di perangkat bisa mencentang untuk siapa saja | Sama seperti v3; login per orang tua datang bersama backend |
| Penyimpanan sekarang: localStorage di balik `FamilyRepository` | Memenuhi "tersimpan setelah dibuka ulang" untuk satu perangkat; adapter backend menyusul |
| Pohon keluarga diberi ukuran dasar lebih besar; pohon buah dekorasi dihapus | Di hari pertama pohon keluarga kalah besar dari dekorasi dan sulit diketuk |
| Pemetaan juz memakai perkiraan dari spesifikasi | Tabel juz akurat ada di backlog |

## Terbuka
- **Backend untuk sinkron Ayah & Ibu** (Supabase atau Firebase) + login dua akun + offline-first.
- F2 Papan Misi (dengan `contributions` per transaksi, bukan `saved` yang ditimpa), F3 Kenangan, F4 Evaluasi, F5 Data Ekonomi (`finance/{YYYY-MM}`).
- Elemen dunia: sumur, ladang, jalan haji & gerbang, pagar, lentera kenangan, siklus waktu nyata, fallback 2D.
- Pohon Ayah dan Ibu berdampingan dengan ukuran berbeda bisa terbaca sebagai perbandingan (P2). Perlu dipantau saat dipakai.
