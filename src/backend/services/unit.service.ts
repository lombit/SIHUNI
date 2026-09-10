import db from "../db";
import { catatAudit } from "../audit";

export async function getUnits(filter?: {
  tower?: string;
  lantai?: number;
  status?: string;
  q?: string;
}) {
  const where: any = {};
  if (filter?.tower) where.tower = { nama: filter.tower };
  if (filter?.lantai) where.lantai = filter.lantai;
  if (filter?.status) where.status = filter.status;
  if (filter?.q) where.nomor = { contains: filter.q };

  return await db.unit.findMany({
    where,
    include: {
      tower: true,
      perjanjian: {
        where: { status: "AKTIF" },
        include: { penghuni: true },
      },
    },
    orderBy: [{ tower: { nama: "asc" } }, { lantai: "asc" }, { nomor: "asc" }],
  });
}

export async function getUnitById(id: string) {
  return await db.unit.findUnique({
    where: { id },
    include: {
      tower: true,
      perjanjian: {
        include: { penghuni: true },
        orderBy: { tanggalMulai: "desc" },
      },
      pengaduan: {
        orderBy: { tanggalLapor: "desc" },
      },
    },
  });
}

export async function updateUnitStatus(id: string, status: string, userId: string) {
  if (!["KOSONG", "PERBAIKAN"].includes(status)) {
    throw new Error("Status hanya dapat diubah ke KOSONG atau PERBAIKAN secara manual");
  }

  const unitLama = await db.unit.findUnique({
    where: { id },
    include: {
      perjanjian: { where: { status: "AKTIF" } },
    },
  });

  if (!unitLama) {
    throw new Error("Unit tidak ditemukan");
  }

  if (unitLama.perjanjian.length > 0) {
    throw new Error("Unit sedang aktif dihuni. Status tidak dapat diubah sebelum perjanjian sewa diakhiri.");
  }

  const unitBaru = await db.unit.update({
    where: { id },
    data: { status },
  });

  await catatAudit({
    userId,
    entitas: "Unit",
    entitasId: id,
    aksi: "UBAH",
    sebelum: { status: unitLama.status },
    sesudah: { status: unitBaru.status },
  });

  return unitBaru;
}
