import { z } from "zod";

export const BayarSchema = z.object({
  tanggalBayar: z.string().min(1, "Tanggal bayar wajib diisi"),
  jumlah: z.number().int().positive("Nominal pembayaran harus lebih dari 0"),
  nomorBukti: z.string().min(1, "Nomor kuitansi / bukti pembayaran wajib diisi"),
  tanggalSetor: z.string().optional().nullable(),
  nomorSetoran: z.string().optional().nullable(),
});

export type BayarInput = z.infer<typeof BayarSchema>;
