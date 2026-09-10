import db from "../db";
import { catatAudit } from "../audit";
import { BayarInput } from "../validations/tagihan.schema";

let terakhirSinkronisasi = 0;
const INTERVAL_SINKRONISASI_MS = 10 * 60 * 1000; // Cukup periksa setiap 10 menit

export async function perbaruiStatusTerlambat(paksa: boolean = false) {
  const sekarang = new Date();
  const nowMs = sekarang.getTime();

  // Mencegah query write berulang pada setiap page render
  if (!paksa && nowMs - terakhirSinkronisasi < INTERVAL_SINKRONISASI_MS) {
    return 0;
  }
  terakhirSinkronisasi = nowMs;

  try {
    const hasil = await db.tagihan.updateMany({
      where: {
        status: "BELUM_BAYAR",
        jatuhTempo: { lt: sekarang },
      },
      data: { status: "TERLAMBAT" },
    });
    return hasil.count;
  } catch (error) {
    console.error("Gagal sinkronisasi status tagihan terlambat:", error);
    return 0;
  }
}

export async function buatTagihanBulanan(
  periodeBulan: number,
  periodeTahun: number,
  userId: string = "system"
) {
  const perjanjianAktif = await db.perjanjianSewa.findMany({
    where: { status: "AKTIF" },
    include: { unit: true, penghuni: true },
  });

  const jatuhTempo = new Date(periodeTahun, periodeBulan - 1, 20, 23, 59, 59);

  let dibuat = 0;
  let dilewati = 0;

  for (const p of perjanjianAktif) {
    const sudahAda = await db.tagihan.findUnique({
      where: {
        perjanjianId_periodeBulan_periodeTahun: {
          perjanjianId: p.id,
          periodeBulan,
          periodeTahun,
        },
      },
    });

    if (sudahAda) {
      dilewati++;
      continue;
    }

    const tagihanBaru = await db.tagihan.create({
      data: {
        perjanjianId: p.id,
        periodeBulan,
        periodeTahun,
        jumlah: p.tarifBulanan,
        jatuhTempo,
        status: "BELUM_BAYAR",
      },
    });

    await catatAudit({
      userId,
      entitas: "Tagihan",
      entitasId: tagihanBaru.id,
      aksi: "BUAT",
      sesudah: {
        nomorPerjanjian: p.nomor,
        unit: p.unit.nomor,
        penghuni: p.penghuni.nama,
        periodeBulan,
        periodeTahun,
        jumlah: p.tarifBulanan,
      },
    });

    dibuat++;
  }

  await perbaruiStatusTerlambat();

  return { dibuat, dilewati, totalAktif: perjanjianAktif.length };
}

export async function bayarTagihan(id: string, data: BayarInput, userId: string) {
  const tagihan = await db.tagihan.findUnique({
    where: { id },
    include: {
      pembayaran: true,
      perjanjian: {
        include: { unit: true, penghuni: true },
      },
    },
  });

  if (!tagihan) {
    throw new Error("Tagihan tidak ditemukan");
  }

  const sudahDibayar = tagihan.pembayaran.reduce((sum, p) => sum + p.jumlah, 0);
  const sisaTagihan = tagihan.jumlah - sudahDibayar;

  if (data.jumlah > sisaTagihan) {
    throw new Error(
      `Jumlah pembayaran (Rp${data.jumlah.toLocaleString(
        "id-ID"
      )}) melebihi sisa tagihan (Rp${sisaTagihan.toLocaleString("id-ID")}).`
    );
  }

  const tglBayar = new Date(data.tanggalBayar);
  const tglSetor = data.tanggalSetor ? new Date(data.tanggalSetor) : null;

  const hasil = await db.$transaction(async (tx) => {
    const pembayaranBaru = await tx.pembayaran.create({
      data: {
        tagihanId: id,
        tanggalBayar: tglBayar,
        jumlah: data.jumlah,
        nomorBukti: data.nomorBukti,
        dicatatOleh: userId,
        tanggalSetor: tglSetor,
        nomorSetoran: data.nomorSetoran || null,
      },
    });

    const totalSetelahBayar = sudahDibayar + data.jumlah;
    const statusBaru = totalSetelahBayar >= tagihan.jumlah ? "LUNAS" : tagihan.status;

    const tagihanUpdated = await tx.tagihan.update({
      where: { id },
      data: { status: statusBaru },
    });

    return { pembayaran: pembayaranBaru, tagihan: tagihanUpdated };
  });

  await catatAudit({
    userId,
    entitas: "Pembayaran",
    entitasId: hasil.pembayaran.id,
    aksi: "BUAT",
    sesudah: {
      tagihanId: id,
      unit: tagihan.perjanjian.unit.nomor,
      penghuni: tagihan.perjanjian.penghuni.nama,
      nomorBukti: data.nomorBukti,
      jumlah: data.jumlah,
      tanggalBayar: tglBayar,
      nomorSetoran: data.nomorSetoran,
    },
  });

  if (hasil.tagihan.status === "LUNAS" && tagihan.status !== "LUNAS") {
    await catatAudit({
      userId,
      entitas: "Tagihan",
      entitasId: id,
      aksi: "UBAH",
      sebelum: { status: tagihan.status },
      sesudah: { status: "LUNAS" },
    });
  }

  return hasil;
}
