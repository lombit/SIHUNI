import db from "../db";
import { catatAudit } from "../audit";
import { PengaduanInput, UpdateAduanInput } from "../validations/pengaduan.schema";
import { hitungBatasWaktuSLA } from "@/frontend/utils/format";

export async function getPengaduanList(filter?: {
  status?: string;
  kategori?: string;
  q?: string;
}) {
  const where: any = {};
  if (filter?.status) where.status = filter.status;
  if (filter?.kategori) where.kategori = filter.kategori;
  if (filter?.q) {
    where.OR = [
      { nomorTiket: { contains: filter.q } },
      { namaPelapor: { contains: filter.q } },
      { uraian: { contains: filter.q } },
      { unit: { nomor: { contains: filter.q } } },
    ];
  }

  return await db.pengaduan.findMany({
    where,
    include: {
      unit: { include: { tower: true } },
    },
    orderBy: { tanggalLapor: "desc" },
  });
}

export async function getPengaduanById(id: string) {
  return await db.pengaduan.findUnique({
    where: { id },
    include: {
      unit: {
        include: {
          tower: true,
          perjanjian: {
            where: { status: "AKTIF" },
            include: { penghuni: true },
          },
        },
      },
    },
  });
}

export async function createPengaduan(data: PengaduanInput, userId: string) {
  const sekarang = new Date();
  const tahunSekarang = sekarang.getFullYear();
  const prefix = `ADU-${tahunSekarang}-`;

  const tiketTerakhir = await db.pengaduan.findMany({
    where: { nomorTiket: { startsWith: prefix } },
    select: { nomorTiket: true },
    orderBy: { nomorTiket: "desc" },
    take: 1,
  });

  let urutan = 1;
  if (tiketTerakhir.length > 0) {
    const parts = tiketTerakhir[0].nomorTiket.split("-");
    const lastNum = parseInt(parts[2], 10);
    if (!isNaN(lastNum)) {
      urutan = lastNum + 1;
    }
  }

  const nomorTiket = `${prefix}${urutan.toString().padStart(4, "0")}`;
  const batasWaktu = hitungBatasWaktuSLA(sekarang, data.tingkat);

  const unit = await db.unit.findUnique({
    where: { id: data.unitId },
    include: { tower: true },
  });

  if (!unit) {
    throw new Error("Unit hunian tidak ditemukan");
  }

  const pengaduanBaru = await db.pengaduan.create({
    data: {
      nomorTiket,
      unitId: data.unitId,
      namaPelapor: data.namaPelapor,
      noHp: data.noHp,
      kategori: data.kategori,
      tingkat: data.tingkat,
      uraian: data.uraian,
      tanggalLapor: sekarang,
      batasWaktu,
      status: "BARU",
    },
  });

  await catatAudit({
    userId,
    entitas: "Pengaduan",
    entitasId: pengaduanBaru.id,
    aksi: "BUAT",
    sesudah: {
      nomorTiket,
      unit: unit.nomor,
      namaPelapor: data.namaPelapor,
      kategori: data.kategori,
      tingkat: data.tingkat,
      batasWaktu,
    },
  });

  return pengaduanBaru;
}

export async function updatePengaduan(id: string, data: UpdateAduanInput, userId: string) {
  const aduanLama = await db.pengaduan.findUnique({
    where: { id },
  });

  if (!aduanLama) {
    throw new Error("Pengaduan tidak ditemukan");
  }

  const tanggalSelesai =
    data.status === "SELESAI" ? aduanLama.tanggalSelesai || new Date() : null;

  const aduanBaru = await db.pengaduan.update({
    where: { id },
    data: {
      status: data.status,
      tindakan: data.tindakan || null,
      petugasId: data.petugasId || userId,
      tanggalSelesai,
    },
  });

  await catatAudit({
    userId,
    entitas: "Pengaduan",
    entitasId: id,
    aksi: "UBAH",
    sebelum: {
      status: aduanLama.status,
      tindakan: aduanLama.tindakan,
      petugasId: aduanLama.petugasId,
    },
    sesudah: {
      status: aduanBaru.status,
      tindakan: aduanBaru.tindakan,
      petugasId: aduanBaru.petugasId,
    },
  });

  return aduanBaru;
}
