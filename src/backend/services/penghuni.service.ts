import db from "../db";
import { catatAudit } from "../audit";
import { PenghuniInput } from "../validations/penghuni.schema";

export async function getPenghuniList(q?: string) {
  return await db.penghuni.findMany({
    where: q
      ? {
          OR: [
            { nama: { contains: q } },
            { nik: { contains: q } },
            { noHp: { contains: q } },
          ],
        }
      : undefined,
    include: {
      anggota: true,
      perjanjian: {
        where: { status: "AKTIF" },
        include: {
          unit: { include: { tower: true } },
        },
      },
    },
    orderBy: { nama: "asc" },
  });
}

export async function getPenghuniById(id: string) {
  return await db.penghuni.findUnique({
    where: { id },
    include: {
      anggota: true,
      perjanjian: {
        include: {
          unit: { include: { tower: true } },
        },
        orderBy: { tanggalMulai: "desc" },
      },
    },
  });
}

export async function createPenghuni(data: PenghuniInput, userId: string) {
  const existing = await db.penghuni.findUnique({
    where: { nik: data.nik },
  });

  if (existing) {
    throw new Error(`NIK ${data.nik} sudah terdaftar atas nama ${existing.nama}`);
  }

  const penghuni = await db.penghuni.create({
    data: {
      nik: data.nik,
      nomorKk: data.nomorKk || null,
      nama: data.nama,
      tempatLahir: data.tempatLahir || null,
      tanggalLahir: data.tanggalLahir ? new Date(data.tanggalLahir) : null,
      jenisKelamin: data.jenisKelamin || null,
      statusKawin: data.statusKawin || null,
      pekerjaan: data.pekerjaan || null,
      penghasilan: data.penghasilan || null,
      noHp: data.noHp,
      alamatKtp: data.alamatKtp || null,
      berkasLengkap: data.berkasLengkap,
      anggota: {
        create: data.anggota.map((a) => ({
          nik: a.nik || null,
          nama: a.nama,
          hubungan: a.hubungan,
          usia: a.usia || null,
        })),
      },
    },
    include: { anggota: true },
  });

  await catatAudit({
    userId,
    entitas: "Penghuni",
    entitasId: penghuni.id,
    aksi: "BUAT",
    sesudah: {
      nik: penghuni.nik,
      nama: penghuni.nama,
      noHp: penghuni.noHp,
      jumlahAnggota: penghuni.anggota.length,
    },
  });

  return penghuni;
}

export async function updatePenghuni(id: string, data: PenghuniInput, userId: string) {
  const penghuniLama = await db.penghuni.findUnique({
    where: { id },
    include: { anggota: true },
  });

  if (!penghuniLama) {
    throw new Error("Penghuni tidak ditemukan");
  }

  if (data.nik !== penghuniLama.nik) {
    const existing = await db.penghuni.findUnique({
      where: { nik: data.nik },
    });
    if (existing && existing.id !== id) {
      throw new Error(`NIK ${data.nik} sudah digunakan oleh penghuni lain`);
    }
  }

  const penghuniBaru = await db.$transaction(async (tx) => {
    await tx.anggotaKeluarga.deleteMany({
      where: { penghuniId: id },
    });

    return await tx.penghuni.update({
      where: { id },
      data: {
        nik: data.nik,
        nomorKk: data.nomorKk || null,
        nama: data.nama,
        tempatLahir: data.tempatLahir || null,
        tanggalLahir: data.tanggalLahir ? new Date(data.tanggalLahir) : null,
        jenisKelamin: data.jenisKelamin || null,
        statusKawin: data.statusKawin || null,
        pekerjaan: data.pekerjaan || null,
        penghasilan: data.penghasilan || null,
        noHp: data.noHp,
        alamatKtp: data.alamatKtp || null,
        berkasLengkap: data.berkasLengkap,
        anggota: {
          create: data.anggota.map((a) => ({
            nik: a.nik || null,
            nama: a.nama,
            hubungan: a.hubungan,
            usia: a.usia || null,
          })),
        },
      },
      include: { anggota: true },
    });
  });

  await catatAudit({
    userId,
    entitas: "Penghuni",
    entitasId: id,
    aksi: "UBAH",
    sebelum: {
      nik: penghuniLama.nik,
      nama: penghuniLama.nama,
      noHp: penghuniLama.noHp,
      pekerjaan: penghuniLama.pekerjaan,
      penghasilan: penghuniLama.penghasilan,
      berkasLengkap: penghuniLama.berkasLengkap,
    },
    sesudah: {
      nik: penghuniBaru.nik,
      nama: penghuniBaru.nama,
      noHp: penghuniBaru.noHp,
      pekerjaan: penghuniBaru.pekerjaan,
      penghasilan: penghuniBaru.penghasilan,
      berkasLengkap: penghuniBaru.berkasLengkap,
    },
  });

  return penghuniBaru;
}

export async function deletePenghuni(id: string, userId: string) {
  const perjanjianAktif = await db.perjanjianSewa.findFirst({
    where: { penghuniId: id, status: "AKTIF" },
  });

  if (perjanjianAktif) {
    throw new Error("Penghuni ini memiliki perjanjian sewa aktif. Akhiri perjanjian sewa terlebih dahulu.");
  }

  const penghuni = await db.penghuni.findUnique({ where: { id } });
  if (!penghuni) {
    throw new Error("Penghuni tidak ditemukan");
  }

  await db.penghuni.delete({ where: { id } });

  await catatAudit({
    userId,
    entitas: "Penghuni",
    entitasId: id,
    aksi: "HAPUS",
    sebelum: {
      nik: penghuni.nik,
      nama: penghuni.nama,
      noHp: penghuni.noHp,
    },
  });

  return true;
}
