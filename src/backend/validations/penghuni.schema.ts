import { z } from "zod";

export const AnggotaKeluargaSchema = z.object({
  id: z.string().optional(),
  nik: z.string().optional().nullable(),
  nama: z.string().min(1, "Nama anggota keluarga wajib diisi"),
  hubungan: z.string().min(1, "Hubungan keluarga wajib diisi"),
  usia: z.number().int().positive().optional().nullable(),
});

export const PenghuniSchema = z.object({
  nik: z.string().length(16, "NIK wajib 16 digit angka").regex(/^\d+$/, "NIK harus berupa angka"),
  nomorKk: z.string().optional().nullable(),
  nama: z.string().min(3, "Nama lengkap minimal 3 karakter"),
  tempatLahir: z.string().optional().nullable(),
  tanggalLahir: z.string().optional().nullable(),
  jenisKelamin: z.enum(["L", "P"]).optional().nullable(),
  statusKawin: z.string().optional().nullable(),
  pekerjaan: z.string().optional().nullable(),
  penghasilan: z.number().int().nonnegative().optional().nullable(),
  noHp: z.string().min(8, "Nomor HP wajib diisi"),
  alamatKtp: z.string().optional().nullable(),
  berkasLengkap: z.boolean().default(false),
  anggota: z.array(AnggotaKeluargaSchema).optional().default([]),
});

export type PenghuniInput = z.infer<typeof PenghuniSchema>;
