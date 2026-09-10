# Implementation Plan — SIHUNI

**Sistem Informasi Penghuni dan Retribusi Rusunawa**
Prototipe aksi perubahan PKP — UPTD Rusunawa, Dinas Perumahan dan Kawasan Permukiman Kabupaten Purwakarta

> Dokumen ini ditulis untuk dieksekusi bertahap di Claude Code. Setiap task punya *definition of done* yang bisa diuji. Kerjakan berurutan; jangan lompat, karena task berikutnya bergantung pada skema data yang dibuat di T1.

---

## 1. Konteks dan keputusan yang sudah diambil

| Hal | Keputusan |
|---|---|
| Posisi sistem | **Prototipe untuk PKP** — bukan sistem produksi |
| Data | **Seluruhnya fiktif.** Dilarang mengisi data penghuni sungguhan sebelum ada dasar hukum dan pengamanan yang memadai |
| Stack | Web app custom: Next.js + TypeScript + Prisma + SQLite |
| Titik berangkat | Master data unit dan penghuni, bukan formulir pendaftaran |
| Target demo | Bisa memperagakan alur: data penghuni → tagihan retribusi → pembayaran → pengaduan → laporan |

### Masalah yang dijawab

1. Data penghuni tidak lengkap, sehingga tagihan retribusi tidak punya dasar yang bisa diaudit.
2. Tidak ada catatan tunggakan yang bisa direkonsiliasi dengan setoran ke kas daerah.
3. Pengaduan gangguan air dan sanitasi disampaikan lisan, tanpa nomor tiket dan tanpa batas waktu.

---

## 2. Ruang lingkup

### Dibangun

- Master data tower, lantai, dan unit hunian
- Master data penghuni beserta anggota keluarga
- Perjanjian sewa yang mengikat penghuni ke unit
- Tagihan retribusi bulanan, pencatatan pembayaran, dan tunggakan
- Pengaduan bernomor tiket dengan batas waktu penyelesaian
- Dasbor ringkasan dan laporan yang bisa diekspor
- Log audit atas setiap perubahan data

### Tidak dibangun (disengaja)

| Tidak dibangun | Alasan |
|---|---|
| Payment gateway | Setoran retribusi tetap lewat mekanisme kas daerah yang sudah ada. Sistem hanya **mencatat dan merekonsiliasi** |
| Portal pengaduan publik | SP4N-LAPOR sudah wajib dan sudah jalan. Modul pengaduan di sini untuk triase internal, bukan penggantinya |
| Pendaftaran calon penghuni daring | Masuk tahap berikutnya, setelah data unit rapi. Sudah disiapkan formulir kertasnya (RSN-02) |
| Notifikasi WhatsApp | Butuh biaya dan akun resmi. Cukup siapkan kolom nomor HP dan tombol salin pesan |
| Unggah foto KTP/KK | Prototipe tidak menyimpan dokumen identitas. Cukup penanda *sudah/belum* diserahkan |

---

## 3. Stack

```
Next.js 15 (App Router) + TypeScript
Prisma ORM + SQLite (file dev.db — tanpa server, cocok untuk demo)
Tailwind CSS + shadcn/ui
Auth.js (credentials provider) + bcrypt
Zod untuk validasi input
date-fns untuk tanggal
```

**Kenapa SQLite:** prototipe harus bisa jalan di laptop mana pun tanpa memasang server basis data. Skema Prisma-nya sudah siap dipindah ke PostgreSQL kalau nanti naik ke produksi — cukup ganti `provider` dan jalankan migrasi ulang.

**Bahasa antarmuka:** Indonesia. Istilahnya ikut istilah yang dipakai di UPTD: *unit hunian*, *penghuni*, *retribusi*, *tunggakan*, *pengaduan* — bukan terjemahan dari istilah Inggris.

---

## 4. Struktur proyek

```
sihuni/
├─ prisma/
│  ├─ schema.prisma
│  └─ seed.ts
├─ src/
│  ├─ app/
│  │  ├─ (auth)/login/page.tsx
│  │  ├─ (app)/
│  │  │  ├─ layout.tsx              # sidebar + guard peran
│  │  │  ├─ page.tsx                # dasbor
│  │  │  ├─ unit/
│  │  │  ├─ penghuni/
│  │  │  ├─ perjanjian/
│  │  │  ├─ tagihan/
│  │  │  ├─ pengaduan/
│  │  │  ├─ laporan/
│  │  │  └─ pengaturan/
│  │  └─ api/
│  ├─ components/                   # komponen UI bersama
│  ├─ lib/
│  │  ├─ db.ts                      # prisma client singleton
│  │  ├─ auth.ts
│  │  ├─ audit.ts                   # helper pencatatan log
│  │  ├─ tagihan.ts                 # logika pembuatan tagihan bulanan
│  │  └─ format.ts                  # rupiah, tanggal, nomor tiket
│  └─ types/
└─ README.md
```

---

## 5. Data model

```prisma
enum Peran        { ADMIN PETUGAS PIMPINAN }
enum StatusUnit   { KOSONG DIHUNI PERBAIKAN }
enum StatusSewa   { AKTIF BERAKHIR DIBATALKAN }
enum StatusTagihan{ BELUM_BAYAR LUNAS TERLAMBAT }
enum KategoriAduan{ AIR_BERSIH SANITASI LISTRIK KEBERSIHAN KEAMANAN BANGUNAN LAINNYA }
enum TingkatAduan { RINGAN SEDANG BERAT }
enum StatusAduan  { BARU DIPROSES SELESAI DITERUSKAN TIDAK_DAPAT_DITANGANI }

model User {
  id           String  @id @default(cuid())
  nama         String
  username     String  @unique
  passwordHash String
  peran        Peran   @default(PETUGAS)
  aktif        Boolean @default(true)
}

model Tower {
  id           String @id @default(cuid())
  nama         String @unique          // "Tower A"
  jumlahLantai Int
  unit         Unit[]
}

model Unit {
  id         String     @id @default(cuid())
  towerId    String
  tower      Tower      @relation(fields: [towerId], references: [id])
  lantai     Int
  nomor      String                     // "A-301"
  tipe       String                     // "Tipe 24"
  luas       Float                      // m2
  tarifSewa  Int                        // rupiah per bulan
  status     StatusUnit @default(KOSONG)
  perjanjian PerjanjianSewa[]
  pengaduan  Pengaduan[]
  @@unique([towerId, nomor])
}

model Penghuni {
  id             String   @id @default(cuid())
  nik            String   @unique       // 16 digit
  nomorKk        String?
  nama           String
  tempatLahir    String?
  tanggalLahir   DateTime?
  jenisKelamin   String?                // "L" | "P"
  statusKawin    String?
  pekerjaan      String?
  penghasilan    Int?
  noHp           String                 // wajib
  alamatKtp      String?
  berkasLengkap  Boolean  @default(false)
  anggota        AnggotaKeluarga[]
  perjanjian     PerjanjianSewa[]
}

model AnggotaKeluarga {
  id         String   @id @default(cuid())
  penghuniId String
  penghuni   Penghuni @relation(fields: [penghuniId], references: [id], onDelete: Cascade)
  nik        String?
  nama       String
  hubungan   String
  usia       Int?
}

model PerjanjianSewa {
  id              String     @id @default(cuid())
  nomor           String     @unique
  unitId          String
  unit            Unit       @relation(fields: [unitId], references: [id])
  penghuniId      String
  penghuni        Penghuni   @relation(fields: [penghuniId], references: [id])
  tanggalMulai    DateTime
  tanggalBerakhir DateTime
  tarifBulanan    Int
  status          StatusSewa @default(AKTIF)
  tagihan         Tagihan[]
}

model Tagihan {
  id           String         @id @default(cuid())
  perjanjianId String
  perjanjian   PerjanjianSewa @relation(fields: [perjanjianId], references: [id])
  periodeBulan Int            // 1-12
  periodeTahun Int
  jumlah       Int
  jatuhTempo   DateTime
  status       StatusTagihan  @default(BELUM_BAYAR)
  pembayaran   Pembayaran[]
  @@unique([perjanjianId, periodeBulan, periodeTahun])
}

model Pembayaran {
  id            String   @id @default(cuid())
  tagihanId     String
  tagihan       Tagihan  @relation(fields: [tagihanId], references: [id])
  tanggalBayar  DateTime
  jumlah        Int
  nomorBukti    String
  dicatatOleh   String            // User.id
  tanggalSetor  DateTime?         // penyetoran ke kas daerah
  nomorSetoran  String?
}

model Pengaduan {
  id             String        @id @default(cuid())
  nomorTiket     String        @unique      // ADU-2026-0001
  unitId         String
  unit           Unit          @relation(fields: [unitId], references: [id])
  namaPelapor    String
  noHp           String
  kategori       KategoriAduan
  tingkat        TingkatAduan
  uraian         String
  tanggalLapor   DateTime      @default(now())
  batasWaktu     DateTime                   // dihitung dari SLA per tingkat
  status         StatusAduan   @default(BARU)
  petugasId      String?
  tindakan       String?
  tanggalSelesai DateTime?
}

model LogAudit {
  id        String   @id @default(cuid())
  userId    String
  entitas   String                // "Penghuni", "Tagihan", ...
  entitasId String
  aksi      String                // "BUAT" | "UBAH" | "HAPUS"
  sebelum   String?               // JSON
  sesudah   String?               // JSON
  waktu     DateTime @default(now())
}
```

### Aturan bisnis yang harus ditegakkan di kode

1. Satu unit hanya boleh punya **satu** perjanjian sewa berstatus `AKTIF` pada satu waktu.
2. Saat perjanjian dibuat, status unit otomatis jadi `DIHUNI`. Saat berakhir, kembali `KOSONG`.
3. Tagihan dibuat massal per bulan, hanya untuk perjanjian berstatus `AKTIF`.
4. Tagihan yang lewat jatuh tempo dan belum lunas otomatis berstatus `TERLAMBAT`.
5. Pembayaran tidak boleh melebihi jumlah tagihan.
6. NIK wajib 16 digit dan unik. Nomor HP wajib diisi.
7. SLA pengaduan: `BERAT` 2 hari kerja, `SEDANG` 5 hari kerja, `RINGAN` 10 hari kerja.
8. Setiap operasi tulis pada Penghuni, PerjanjianSewa, Tagihan, dan Pembayaran **wajib** mencatat `LogAudit`.

---

## 6. Peran dan hak akses

| Peran | Hak |
|---|---|
| `ADMIN` | Semua, termasuk kelola pengguna dan hapus data |
| `PETUGAS` | Buat dan ubah penghuni, perjanjian, tagihan, pembayaran, pengaduan. Tidak bisa hapus |
| `PIMPINAN` | Hanya baca: dasbor, laporan, daftar tunggakan, rekap pengaduan |

---

## 7. Urutan eksekusi

### T0 — Scaffold

Buat proyek Next.js dengan TypeScript, Tailwind, App Router, ESLint. Pasang Prisma, Auth.js, bcrypt, zod, date-fns, shadcn/ui. Buat `src/lib/db.ts` (Prisma client singleton) dan `src/lib/format.ts` (formatRupiah, formatTanggal).

**Selesai bila:** `npm run dev` jalan tanpa error dan halaman kosong tampil di `localhost:3000`.

### T1 — Skema data dan seed

Tulis `prisma/schema.prisma` persis seperti bagian 5. Jalankan migrasi. Tulis `prisma/seed.ts` yang mengisi:

- 3 pengguna: `admin`, `petugas`, `pimpinan` (kata sandi sama: `sihuni123`)
- 2 tower, masing-masing 5 lantai, 20 unit per lantai → **200 unit**
- Tarif: lantai 1 Rp350.000, lantai 2 Rp325.000, lantai 3 Rp300.000, lantai 4 Rp275.000, lantai 5 Rp250.000
- 160 penghuni fiktif dengan perjanjian aktif; 40 unit dibiarkan kosong
- Tagihan 6 bulan terakhir; sekitar 20% sengaja belum lunas agar tunggakan terlihat
- 15 pengaduan dengan campuran status dan kategori

> **Nama, NIK, dan nomor HP harus jelas fiktif.** Gunakan NIK berpola `32140000000000xx` dan nomor HP berpola `08120000xxxx`.

**Selesai bila:** `npx prisma db seed` berhasil dan `npx prisma studio` menampilkan 200 unit serta 160 perjanjian aktif.

### T2 — Autentikasi dan kerangka aplikasi

Halaman `/login`. Auth.js credentials provider. Layout `(app)` dengan sidebar: Dasbor, Unit Hunian, Penghuni, Tagihan, Pengaduan, Laporan, Pengaturan. Middleware yang menolak akses tanpa sesi, dan menyembunyikan menu sesuai peran.

**Selesai bila:** login sebagai `pimpinan` hanya menampilkan Dasbor dan Laporan; login sebagai `petugas` menampilkan semua kecuali Pengaturan.

### T3 — Modul unit hunian

`/unit` — tabel dengan penyaring tower, lantai, dan status; pencarian nomor unit. `/unit/[id]` — detail unit, penghuni saat ini, riwayat perjanjian, riwayat pengaduan.

**Selesai bila:** menyaring "Tower A + lantai 3 + KOSONG" menghasilkan daftar yang benar, dan detail unit terhuni menampilkan nama penghuninya.

### T4 — Modul penghuni

`/penghuni` — daftar dengan pencarian nama dan NIK. `/penghuni/baru` dan `/penghuni/[id]/ubah` — formulir mengikuti **formulir RSN-01**, termasuk anggota keluarga (tambah/hapus baris). `/penghuni/[id]` — detail.

Validasi zod: NIK 16 digit dan unik, nama wajib, nomor HP wajib.

**Selesai bila:** menyimpan penghuni dengan NIK yang sudah ada memunculkan pesan galat yang jelas, dan anggota keluarga ikut tersimpan.

### T5 — Modul perjanjian sewa

Buat perjanjian dari halaman unit kosong: pilih penghuni (atau buat baru), tanggal mulai, jangka waktu, tarif terisi otomatis dari unit tapi bisa diubah. Nomor perjanjian dibuat otomatis: `SPS/{tahun}/{urut 4 digit}`.

Aksi "akhiri perjanjian" mengubah status perjanjian dan mengembalikan unit ke `KOSONG`.

**Selesai bila:** mencoba membuat perjanjian kedua pada unit yang sudah dihuni ditolak dengan pesan yang jelas.

### T6 — Modul tagihan dan pembayaran

`/tagihan` — penyaring periode dan status, ringkasan total tagihan dan total tunggakan.

Tombol **"Buat tagihan bulan ini"**: membuat tagihan untuk semua perjanjian aktif yang belum punya tagihan pada periode tersebut. Idempoten — dijalankan dua kali tidak menggandakan.

`/tagihan/[id]` — catat pembayaran: tanggal, jumlah, nomor bukti. Setelah lunas, status berubah `LUNAS`. Ada kolom opsional penyetoran ke kas daerah (tanggal + nomor setoran) untuk rekonsiliasi.

Job sederhana (dipanggil saat halaman dimuat) yang menandai tagihan lewat jatuh tempo sebagai `TERLAMBAT`.

**Selesai bila:** klik "Buat tagihan bulan ini" menghasilkan 160 tagihan; klik kedua kalinya menghasilkan 0 tagihan baru dan memberi tahu "sudah dibuat sebelumnya".

### T7 — Modul pengaduan

`/pengaduan` — daftar dengan penyaring status dan kategori, penanda merah untuk yang melewati batas waktu. Formulir pengaduan baru mengikuti **formulir RSN-03**. Nomor tiket otomatis `ADU-{tahun}-{urut 4 digit}`. Batas waktu dihitung dari SLA sesuai tingkat.

`/pengaduan/[id]` — tindak lanjut: tetapkan petugas, isi tindakan, ubah status, tanggal selesai.

**Selesai bila:** pengaduan `BERAT` yang dibuat hari ini menampilkan batas waktu 2 hari kerja ke depan, dan pengaduan yang lewat batas waktu tampil dengan penanda merah.

### T8 — Dasbor

Kartu ringkasan: unit terhuni / kosong / perbaikan; jumlah penghuni; penerimaan retribusi bulan berjalan; total tunggakan; pengaduan terbuka; pengaduan lewat batas waktu.

Dua daftar pendek: 5 tunggakan terbesar, 5 pengaduan terlama yang belum selesai.

**Selesai bila:** angka pada dasbor cocok dengan hasil hitung manual dari Prisma Studio.

### T9 — Laporan dan ekspor

`/laporan` dengan tiga laporan:

1. **Rekap penerimaan retribusi** per bulan — jumlah tagihan, jumlah terbayar, jumlah tertunggak
2. **Daftar tunggakan** per unit — nama penghuni, nomor HP, jumlah bulan menunggak, nilai
3. **Rekap pengaduan** per kategori — jumlah, rata-rata waktu penyelesaian, jumlah lewat batas waktu

Setiap laporan punya tombol **Ekspor CSV**.

**Selesai bila:** ketiga CSV terunduh dan bisa dibuka rapi di Excel (pemisah koma, angka tanpa format mata uang).

### T10 — Log audit

Helper `catatAudit()` di `src/lib/audit.ts`, dipanggil pada setiap operasi tulis Penghuni, PerjanjianSewa, Tagihan, Pembayaran. Halaman `/pengaturan/log` (khusus ADMIN) menampilkan log terbaru dengan penyaring entitas dan pengguna.

**Selesai bila:** mengubah nomor HP seorang penghuni menghasilkan satu baris log berisi nilai sebelum dan sesudah.

### T11 — Perapian

- Semua tabel punya keadaan kosong yang informatif, bukan tabel kosong tanpa penjelasan
- Formulir menampilkan galat validasi di bawah kolom yang bersangkutan
- Tampilan responsif — halaman penghuni dan pengaduan harus nyaman dibuka di layar ponsel, karena petugas mengisinya sambil keliling unit
- Konfirmasi sebelum aksi yang tidak bisa dibatalkan
- Format rupiah konsisten: `Rp350.000`

**Selesai bila:** halaman `/penghuni/baru` bisa diisi tuntas di layar selebar 390 px tanpa menggeser ke samping.

### T12 — Skenario demo

Tulis `README.md` berisi cara menjalankan dan **skenario demo 5 menit** untuk paparan PKP:

1. Masuk sebagai petugas → buka dasbor → tunjukkan 200 unit, 160 terhuni, tunggakan Rp sekian
2. Cari unit kosong di Tower B lantai 4 → buat penghuni baru → buat perjanjian sewa → unit berubah jadi terhuni
3. Buat tagihan bulan berjalan → catat satu pembayaran → tunggakan berkurang
4. Buat pengaduan air bersih tingkat berat → tunjukkan nomor tiket dan batas waktu 2 hari kerja
5. Buka laporan tunggakan → ekspor CSV
6. Masuk sebagai pimpinan → tunjukkan bahwa yang tampil hanya dasbor dan laporan

**Selesai bila:** skenario di atas bisa dijalankan berurutan tanpa error.

---

## 8. Catatan yang tidak boleh dilupakan

**Data pribadi.** Prototipe ini hanya boleh berisi data fiktif. Sebelum dipakai dengan data penghuni sungguhan, wajib ada: dasar pemrosesan yang jelas, pembatasan akses per peran (sudah disiapkan), masa retensi, dan persetujuan penghuni — kalimat persetujuannya sudah ada di formulir RSN-01 dan RSN-02.

**Dasar hukum.** Data di sistem baru sah sebagai dasar penagihan retribusi kalau penggunaannya ditetapkan lewat keputusan Kepala Dinas, menempel pada Perbup retribusi yang berlaku.

**Kepemilikan.** Sejak awal: akun administrator atas nama jabatan (bukan nama orang), kode dan dokumentasi diserahkan ke dinas, dan minimal dua pegawai bisa mengoperasikan.

**Kalau naik ke produksi.** Ganti SQLite ke PostgreSQL, pindahkan hosting ke server Diskominfo, tambahkan pencadangan otomatis, dan lakukan uji keamanan dasar sebelum diisi data sungguhan.

---

## 9. Perintah cepat

```bash
npx create-next-app@latest sihuni --typescript --tailwind --app --eslint
cd sihuni
npm i prisma @prisma/client next-auth bcryptjs zod date-fns
npm i -D @types/bcryptjs tsx
npx prisma init --datasource-provider sqlite
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```
