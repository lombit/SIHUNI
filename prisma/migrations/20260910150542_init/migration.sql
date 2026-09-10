-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nama" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "peran" TEXT NOT NULL DEFAULT 'PETUGAS',
    "aktif" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "Tower" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nama" TEXT NOT NULL,
    "jumlahLantai" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Unit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "towerId" TEXT NOT NULL,
    "lantai" INTEGER NOT NULL,
    "nomor" TEXT NOT NULL,
    "tipe" TEXT NOT NULL,
    "luas" REAL NOT NULL,
    "tarifSewa" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'KOSONG',
    CONSTRAINT "Unit_towerId_fkey" FOREIGN KEY ("towerId") REFERENCES "Tower" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Penghuni" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nik" TEXT NOT NULL,
    "nomorKk" TEXT,
    "nama" TEXT NOT NULL,
    "tempatLahir" TEXT,
    "tanggalLahir" DATETIME,
    "jenisKelamin" TEXT,
    "statusKawin" TEXT,
    "pekerjaan" TEXT,
    "penghasilan" INTEGER,
    "noHp" TEXT NOT NULL,
    "alamatKtp" TEXT,
    "berkasLengkap" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "AnggotaKeluarga" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "penghuniId" TEXT NOT NULL,
    "nik" TEXT,
    "nama" TEXT NOT NULL,
    "hubungan" TEXT NOT NULL,
    "usia" INTEGER,
    CONSTRAINT "AnggotaKeluarga_penghuniId_fkey" FOREIGN KEY ("penghuniId") REFERENCES "Penghuni" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PerjanjianSewa" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nomor" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "penghuniId" TEXT NOT NULL,
    "tanggalMulai" DATETIME NOT NULL,
    "tanggalBerakhir" DATETIME NOT NULL,
    "tarifBulanan" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AKTIF',
    CONSTRAINT "PerjanjianSewa_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PerjanjianSewa_penghuniId_fkey" FOREIGN KEY ("penghuniId") REFERENCES "Penghuni" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tagihan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "perjanjianId" TEXT NOT NULL,
    "periodeBulan" INTEGER NOT NULL,
    "periodeTahun" INTEGER NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "jatuhTempo" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'BELUM_BAYAR',
    CONSTRAINT "Tagihan_perjanjianId_fkey" FOREIGN KEY ("perjanjianId") REFERENCES "PerjanjianSewa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Pembayaran" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tagihanId" TEXT NOT NULL,
    "tanggalBayar" DATETIME NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "nomorBukti" TEXT NOT NULL,
    "dicatatOleh" TEXT NOT NULL,
    "tanggalSetor" DATETIME,
    "nomorSetoran" TEXT,
    CONSTRAINT "Pembayaran_tagihanId_fkey" FOREIGN KEY ("tagihanId") REFERENCES "Tagihan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Pengaduan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nomorTiket" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "namaPelapor" TEXT NOT NULL,
    "noHp" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "tingkat" TEXT NOT NULL,
    "uraian" TEXT NOT NULL,
    "tanggalLapor" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "batasWaktu" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'BARU',
    "petugasId" TEXT,
    "tindakan" TEXT,
    "tanggalSelesai" DATETIME,
    CONSTRAINT "Pengaduan_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LogAudit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "entitas" TEXT NOT NULL,
    "entitasId" TEXT NOT NULL,
    "aksi" TEXT NOT NULL,
    "sebelum" TEXT,
    "sesudah" TEXT,
    "waktu" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Tower_nama_key" ON "Tower"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "Unit_towerId_nomor_key" ON "Unit"("towerId", "nomor");

-- CreateIndex
CREATE UNIQUE INDEX "Penghuni_nik_key" ON "Penghuni"("nik");

-- CreateIndex
CREATE UNIQUE INDEX "PerjanjianSewa_nomor_key" ON "PerjanjianSewa"("nomor");

-- CreateIndex
CREATE UNIQUE INDEX "Tagihan_perjanjianId_periodeBulan_periodeTahun_key" ON "Tagihan"("perjanjianId", "periodeBulan", "periodeTahun");

-- CreateIndex
CREATE UNIQUE INDEX "Pengaduan_nomorTiket_key" ON "Pengaduan"("nomorTiket");
