import { z } from "zod";

export const PerjanjianSchema = z.object({
  unitId: z.string().min(1, "Unit hunian wajib dipilih"),
  penghuniId: z.string().min(1, "Penghuni wajib dipilih"),
  tanggalMulai: z.string().min(1, "Tanggal mulai sewa wajib diisi"),
  tanggalBerakhir: z.string().min(1, "Tanggal berakhir sewa wajib diisi"),
  tarifBulanan: z.number().int().positive("Tarif sewa harus lebih dari 0"),
});

export type PerjanjianInput = z.infer<typeof PerjanjianSchema>;
