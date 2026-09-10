import { z } from "zod";

export const PengaduanSchema = z.object({
  unitId: z.string().min(1, "Unit hunian wajib dipilih"),
  namaPelapor: z.string().min(2, "Nama pelapor wajib diisi"),
  noHp: z.string().min(8, "Nomor HP wajib diisi"),
  kategori: z.enum([
    "AIR_BERSIH",
    "SANITASI",
    "LISTRIK",
    "KEBERSIHAN",
    "KEAMANAN",
    "BANGUNAN",
    "LAINNYA",
  ]),
  tingkat: z.enum(["RINGAN", "SEDANG", "BERAT"]),
  uraian: z.string().min(5, "Uraian gangguan minimal 5 karakter"),
});

export const UpdateAduanSchema = z.object({
  status: z.enum([
    "BARU",
    "DIPROSES",
    "SELESAI",
    "DITERUSKAN",
    "TIDAK_DAPAT_DITANGANI",
  ]),
  tindakan: z.string().optional().nullable(),
  petugasId: z.string().optional().nullable(),
});

export type PengaduanInput = z.infer<typeof PengaduanSchema>;
export type UpdateAduanInput = z.infer<typeof UpdateAduanSchema>;
