import db from "../db";
import { catatAudit } from "../audit";
import { PerjanjianInput } from "../validations/perjanjian.schema";

export async function getPerjanjianList(status?: string, q?: string) {
  const where: any = {};
  if (status) where.status = status;
  if (q) {
    where.OR = [
      { nomor: { contains: q } },
      { penghuni: { nama: { contains: q } } },
      { unit: { nomor: { contains: q } } },
    ];
  }

  return await db.perjanjianSewa.findMany({
    where,
    include: {
      unit: { include: { tower: true } },
      penghuni: true,
    },
    orderBy: [{ status: "asc" }, { id: "desc" }],
  });
}

export async function createPerjanjian(data: PerjanjianInput, userId: string) {
  const tglMulai = new Date(data.tanggalMulai);
  const tglBerakhir = new Date(data.tanggalBerakhir);

  if (tglBerakhir <= tglMulai) {
    throw new Error("Tanggal berakhir sewa harus setelah tanggal mulai sewa");
  }

  const unit = await db.unit.findUnique({
    where: { id: data.unitId },
    include: {
      tower: true,
      perjanjian: {
        where: { status: "AKTIF" },
        include: { penghuni: true },
      },
    },
  });

  if (!unit) {
    throw new Error("Unit hunian tidak ditemukan");
  }

  if (unit.perjanjian.length > 0 || unit.status === "DIHUNI") {
    const penghuniLama = unit.perjanjian[0]?.penghuni?.nama || "Penghuni Lain";
    throw new Error(
      `Penolakan: Unit ${unit.nomor} sedang dihuni oleh ${penghuniLama}. Satu unit hanya boleh memiliki satu perjanjian sewa aktif pada satu waktu.`
    );
  }

  const penghuni = await db.penghuni.findUnique({
    where: { id: data.penghuniId },
  });

  if (!penghuni) {
    throw new Error("Penghuni tidak ditemukan");
  }

  const sekarang = new Date();
  const tahunSekarang = sekarang.getFullYear();
  const prefix = `SPS/${tahunSekarang}/`;

  const perjanjianTahunIni = await db.perjanjianSewa.findMany({
    where: { nomor: { startsWith: prefix } },
    select: { nomor: true },
    orderBy: { nomor: "desc" },
    take: 1,
  });

  let urutan = 1;
  if (perjanjianTahunIni.length > 0) {
    const parts = perjanjianTahunIni[0].nomor.split("/");
    const lastNumber = parseInt(parts[2], 10);
    if (!isNaN(lastNumber)) {
      urutan = lastNumber + 1;
    }
  }

  const nomorPerjanjian = `${prefix}${urutan.toString().padStart(4, "0")}`;

  const hasil = await db.$transaction(async (tx) => {
    const perjanjianBaru = await tx.perjanjianSewa.create({
      data: {
        nomor: nomorPerjanjian,
        unitId: data.unitId,
        penghuniId: data.penghuniId,
        tanggalMulai: tglMulai,
        tanggalBerakhir: tglBerakhir,
        tarifBulanan: data.tarifBulanan,
        status: "AKTIF",
      },
      include: {
        unit: true,
        penghuni: true,
      },
    });

    await tx.unit.update({
      where: { id: data.unitId },
      data: { status: "DIHUNI" },
    });

    // Otomatis terbitkan tagihan pertama periode mulai sewa
    const pBulan = tglMulai.getMonth() + 1;
    const pTahun = tglMulai.getFullYear();
    let jatuhTempo = new Date(pTahun, pBulan - 1, 20, 23, 59, 59);
    if (tglMulai > jatuhTempo) {
      jatuhTempo = new Date(tglMulai.getTime() + 7 * 24 * 60 * 60 * 1000);
      jatuhTempo.setHours(23, 59, 59, 999);
    }

    await tx.tagihan.create({
      data: {
        perjanjianId: perjanjianBaru.id,
        periodeBulan: pBulan,
        periodeTahun: pTahun,
        jumlah: data.tarifBulanan,
        jatuhTempo,
        status: "BELUM_BAYAR",
      },
    });

    // Jika bulan berjalan saat ini berbeda dan masih dalam rentang masa sewa, terbitkan juga tagihan bulan berjalan
    const curBulan = sekarang.getMonth() + 1;
    const curTahun = sekarang.getFullYear();
    if (
      (curBulan !== pBulan || curTahun !== pTahun) &&
      sekarang <= tglBerakhir &&
      sekarang >= tglMulai
    ) {
      const curJatuhTempo = new Date(curTahun, curBulan - 1, 20, 23, 59, 59);
      await tx.tagihan.create({
        data: {
          perjanjianId: perjanjianBaru.id,
          periodeBulan: curBulan,
          periodeTahun: curTahun,
          jumlah: data.tarifBulanan,
          jatuhTempo: curJatuhTempo,
          status: sekarang > curJatuhTempo ? "TERLAMBAT" : "BELUM_BAYAR",
        },
      });
    }

    return perjanjianBaru;
  });

  await catatAudit({
    userId,
    entitas: "PerjanjianSewa",
    entitasId: hasil.id,
    aksi: "BUAT",
    sesudah: {
      nomor: hasil.nomor,
      unit: unit.nomor,
      penghuni: penghuni.nama,
      tanggalMulai: tglMulai,
      tanggalBerakhir: tglBerakhir,
      tarifBulanan: data.tarifBulanan,
    },
  });

  return hasil;
}

export async function akhiriPerjanjian(id: string, userId: string) {
  const perjanjian = await db.perjanjianSewa.findUnique({
    where: { id },
    include: { unit: true, penghuni: true },
  });

  if (!perjanjian) {
    throw new Error("Perjanjian sewa tidak ditemukan");
  }

  if (perjanjian.status !== "AKTIF") {
    throw new Error(`Perjanjian sewa ini sudah berstatus ${perjanjian.status.toLowerCase()}`);
  }

  const hasil = await db.$transaction(async (tx) => {
    const pUpdate = await tx.perjanjianSewa.update({
      where: { id },
      data: { status: "BERAKHIR" },
    });

    await tx.unit.update({
      where: { id: perjanjian.unitId },
      data: { status: "KOSONG" },
    });

    return pUpdate;
  });

  await catatAudit({
    userId,
    entitas: "PerjanjianSewa",
    entitasId: id,
    aksi: "UBAH",
    sebelum: { status: "AKTIF", unitStatus: "DIHUNI" },
    sesudah: { status: "BERAKHIR", unitStatus: "KOSONG" },
  });

  return hasil;
}
