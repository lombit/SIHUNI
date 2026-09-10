import db from "./db";

export interface AuditParams {
  userId: string;
  entitas: "Penghuni" | "PerjanjianSewa" | "Tagihan" | "Pembayaran" | "Pengaduan" | "Unit" | "User";
  entitasId: string;
  aksi: "BUAT" | "UBAH" | "HAPUS";
  sebelum?: unknown;
  sesudah?: unknown;
}

/**
 * Mencatat perubahan data ke dalam tabel LogAudit
 */
export async function catatAudit({
  userId,
  entitas,
  entitasId,
  aksi,
  sebelum,
  sesudah,
}: AuditParams) {
  try {
    return await db.logAudit.create({
      data: {
        userId,
        entitas,
        entitasId,
        aksi,
        sebelum: sebelum !== undefined ? JSON.stringify(sebelum) : null,
        sesudah: sesudah !== undefined ? JSON.stringify(sesudah) : null,
      },
    });
  } catch (error) {
    console.error("Gagal mencatat log audit:", error);
  }
}
