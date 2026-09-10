# SIHUNI — Sistem Informasi Penghuni dan Retribusi Rusunawa

**Prototipe Aksi Perubahan Pelatihan Kepemimpinan Pengawas (PKP)**  
UPTD Rusunawa, Dinas Perumahan dan Kawasan Permukiman Kabupaten Purwakarta.

---

## 1. Latar Belakang & Masalah yang Dijawab

Sistem ini dikembangkan sebagai prototipe digitalisasi tata kelola rumah susun sewa sederhana (Rusunawa) di bawah naungan UPTD Rusunawa Kabupaten Purwakarta, menjawab 3 tantangan utama:

1. **Master Data Penghuni & Unit Tidak Terintegrasi:** Menghilangkan pencatatan manual buku besar dengan sistem data tunggal berbasis nomor unit dan NIK terverifikasi (Formulir RSN-01).
2. **Ketiadaan Rekonsiliasi Retribusi & Tunggakan:** Menghadirkan buku piutang dan generator tagihan otomatis per bulan yang dapat direkonsiliasi dengan Surat Tanda Setor (STS) kas daerah.
3. **Pengaduan Gangguan Tanpa Standar Waktu:** Menerapkan nomor tiket resmi (`ADU-YYYY-XXXX`) dengan penegakan batas waktu penyelesaian berbasis hari kerja (SLA 2, 5, dan 10 hari) sesuai Formulir RSN-03.

> [!IMPORTANT]
> **Data Fiktif:** Seluruh data penghuni, unit, dan transaksi keuangan di dalam sistem prototipe ini adalah **fiktif** untuk keperluan simulasi dan pengujian sistem.

---

## 2. Stack Teknologi

- **Framework:** Next.js 15 (App Router) + React 19 + TypeScript
- **Database & ORM:** SQLite (`prisma/dev.db`) + Prisma ORM *(tanpa perlu install database server eksternal, langsung jalan di laptop demo)*
- **Styling & UI:** Tailwind CSS + Lucide React Icons
- **Autentikasi:** NextAuth.js (Credentials Provider + Session JWT) + bcryptjs
- **Validasi & Tanggal:** Zod + date-fns (dengan perhitungan hari kerja SLA)

---

## 3. Struktur Folder & Arsitektur Sistem

Aplikasi ini menggunakan arsitektur modular terpisah yang bersih antara lapisan backend dan frontend di dalam direktori `src/`:

```
src/
├── app/                      # Lapisan Routing (Next.js 15 App Router)
│   ├── (app)/                # Halaman aplikasi berautentikasi (Dasbor, Unit, Penghuni, dll.)
│   ├── (auth)/login/         # Halaman login otentikasi
│   ├── api/                  # API Route Handlers (Controller tipis memanggil backend service)
│   ├── layout.tsx            # Root Layout
│   └── globals.css           # Styling global Tailwind
│
├── backend/                  # LAPISAN BACKEND (Database, Domain & Business Logic)
│   ├── db.ts                 # PrismaClient singleton instance
│   ├── auth.ts               # Konfigurasi otentikasi NextAuth & Credential Provider
│   ├── session.ts            # Helper validasi session pengguna & RBAC
│   ├── audit.ts              # Utilitas pencatatan Audit Trail
│   ├── validations/          # Zod validation schemas
│   │   ├── penghuni.schema.ts
│   │   ├── perjanjian.schema.ts
│   │   ├── tagihan.schema.ts
│   │   └── pengaduan.schema.ts
│   └── services/             # Domain & Business Services
│       ├── unit.service.ts
│       ├── penghuni.service.ts
│       ├── perjanjian.service.ts
│       ├── tagihan.service.ts
│       ├── pengaduan.service.ts
│       └── laporan.service.ts
│
├── frontend/                 # LAPISAN FRONTEND (Client Components & UI Helpers)
│   ├── utils/
│   │   └── format.ts         # Formatting Rupiah, Tanggal, dan Penghitungan SLA
│   └── components/           # UI Components terisolasi
│       ├── layout/           # Sidebar navigasi, Providers
│       ├── unit/             # Tombol & modal status unit
│       ├── penghuni/         # Formulir RSN-01 & tombol aksi penghuni
│       ├── perjanjian/       # Formulir sewa baru & penghentian sewa
│       ├── tagihan/          # Tombol generator massal & modal bayar
│       ├── pengaduan/        # Formulir RSN-03 & lembar tindak lanjut
│       └── audit/            # Modal inspeksi JSON log audit
│
├── middleware.ts             # Middleware pelindung rute & penegakan hak akses peran
└── types/                    # Definisi tipe TypeScript & konstanta label
```

---

## 4. Akun Pengguna Demo

| Peran | Username | Kata Sandi | Akses Fitur |
|---|---|---|---|
| **Petugas Pelayanan** | `petugas` | `sihuni123` | Master Unit, Penghuni, Perjanjian Sewa, Tagihan, Pembayaran, Pengaduan, Laporan |
| **Pimpinan (Kepala UPTD)** | `pimpinan` | `sihuni123` | **Hanya Baca:** Dasbor Eksekutif dan Laporan Rekapitulasi |
| **Administrator** | `admin` | `sihuni123` | Akses penuh seluruh modul termasuk **Log Jejak Audit (Audit Trail)** |

---

## 5. Cara Menjalankan Sistem

### Prasyarat
- Node.js versi 18 ke atas (disarankan v20+)
- npm

### Langkah Instalasi
```bash
# 1. Masuk ke direktori proyek
cd e:/Sistem/SIHUNI

# 2. Pasang dependensi
npm install

# 3. Jalankan migrasi basis data SQLite & seeder data fiktif
npx prisma migrate dev --name init

# (Opsional) Jika ingin mereset dan mengisi ulang data awal:
npx prisma db seed

# 4. Jalankan server pengembangan
npm run dev
```
Buka peramban (browser) di: `http://localhost:3000`

---

## 6. Skenario Demo 5 Menit (Paparan PKP)

Alur peragaan langsung saat presentasi di hadapan penguji/mentor:

### Menit 1: Masuk Sebagai Petugas & Orientasi Dasbor
1. Buka halaman login di `http://localhost:3000/login`.
2. Klik tombol demo **Petugas** (otomatis terisi username `petugas` dan sandi `sihuni123`), lalu klik **Masuk**.
3. Tunjukkan kartu indikator kinerja di Dasbor:
   - Total 200 unit (160 Dihuni, 40 Kosong/Perbaikan).
   - Okupansi 80%, total penerimaan retribusi bulan berjalan, dan total tunggakan.
   - Tunjukkan tabel **5 Penunggak Retribusi Terbesar** dan **5 Pengaduan Terlama**.

### Menit 2: Master Unit, Penerbitan Sewa & Cetak Surat Perjanjian (RSN-02)
1. Buka menu **Unit Hunian**, filter: `Tower B` + `Lantai 4` + `Status: KOSONG`.
2. Pilih salah satu unit kosong (misal **Unit B-401**), klik tombol **Detail**.
3. Klik tombol **Buat Perjanjian Sewa**:
   - Pilih penghuni pemohon (atau buat baru lewat link pendaftaran RSN-01).
   - Tunjukkan bahwa tarif otomatis terisi Rp275.000 (tarif lantai 4).
   - Klik **Terbitkan Perjanjian Sewa**.
4. Kembali ke lembar unit: tunjukkan status unit otomatis berubah dari `KOSONG` menjadi `DIHUNI`.
5. Buka menu **Perjanjian Sewa** lalu klik tombol **Cetak SPS**:
   - Tunjukkan dokumen resmi **Surat Perjanjian Sewa (SPS / Formulir RSN-02)** lengkap dengan Kop Surat Pemkab Purwakarta, pasal-pasal hak & kewajiban sewa, dan kolom tanda tangan bermaterai.

### Menit 3: Tagihan Retribusi, WhatsApp Reminder, SP Otomatis & Kuitansi Kasda
1. Buka menu **Tagihan & Retribusi**.
2. Klik tombol **Buat Tagihan Bulan Ini**:
   - Tunjukkan sistem membuat tagihan secara massal secara **idempoten** (aman diklik berulang tanpa duplikasi).
3. Cari tagihan berstatus `TERLAMBAT` / `BELUM_BAYAR`:
   - Klik tombol **Kirim WA**: perlihatkan pesan penagihan resmi UPTD Rusunawa yang terformat otomatis siap kirim via WhatsApp Web.
   - Klik tombol **Cetak SP**: perlihatkan **Surat Peringatan Resmi (SP-1 / SP-2 / SP-3)** ber-Kop Surat Dinas, mencantumkan dasar hukum Perda Purwakarta, rincian akumulasi bulan tunggakan, dan batas waktu 7 hari kerja.
4. Klik tombol **Catat Bayar** pada salah satu tagihan:
   - Masukkan nominal pembayaran dan nomor kuitansi/bukti setor STS kas daerah.
   - Klik **Simpan Pembayaran**: status tagihan langsung berubah menjadi `LUNAS`.
   - Klik tombol **Kuitansi**: perlihatkan **Kuitansi Tanda Terima Retribusi Resmi** ber-Kop Surat, lengkap dengan nominal terbilang otomatis dalam bahasa Indonesia dan nomor STS Kasda.

### Menit 4: Penanganan Pengaduan Gangguan Berbasis SLA (RSN-03)
1. Buka menu **Pengaduan Gangguan**.
2. Tunjukkan tiket dengan penanda warna merah bertuliskan **LEWAT SLA** (melewati batas waktu kerja).
3. Klik **Buat Pengaduan Baru**:
   - Pilih unit, isi keluhan: Kategori `AIR_BERSIH`, Tingkat `BERAT`.
   - Tunjukkan bahwa sistem otomatis menghitung batas waktu penyelesaian **tepat 2 hari kerja ke depan** (melewati hari libur Sabtu-Minggu).
   - Simpan tiket dan buka lembar tindak lanjut untuk mengalokasikan teknisi.

### Menit 5: Ekspor Laporan & Pengujian Hak Akses Pimpinan
1. Buka menu **Laporan & Rekap**.
2. Tunjukkan 3 laporan konsolidasi:
   - Rekapitulasi Penerimaan Retribusi per Bulan.
   - Daftar Rincian Tunggakan per Unit.
   - Rekapitulasi Penanganan Pengaduan Gangguan.
3. Klik tombol **Ekspor CSV (Excel)**: file CSV langsung terunduh rapi dan siap dibuka di Microsoft Excel.
4. Klik **Logout**, lalu login sebagai akun **Pimpinan** (`pimpinan` / `sihuni123`).
5. Perlihatkan bahwa menu navigasi pimpinan dibatasi secara ketat: pimpinan **hanya dapat melihat Dasbor dan Laporan**, tanpa dapat mengubah atau menghapus data transaksi operasional.

---

## 7. Audit Trail (Log Jejak Rekam)

Setiap perubahan data penting (Biodata Penghuni, Perjanjian Sewa, Tagihan, Pembayaran, dan Pengaduan) secara otomatis dicatat ke dalam tabel `LogAudit` lengkap dengan data nilai sebelum dan sesudah mutasi. Riwayat audit dapat dipantau oleh `admin` melalui menu **Log Audit** (`/pengaturan/log`).

---

*Hak Cipta © 2026 UPTD Rusunawa — Dinas Perumahan dan Kawasan Permukiman Kabupaten Purwakarta.*
