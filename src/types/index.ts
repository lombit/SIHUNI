export type Peran = "ADMIN" | "PETUGAS" | "PIMPINAN";
export type StatusUnit = "KOSONG" | "DIHUNI" | "PERBAIKAN";
export type StatusSewa = "AKTIF" | "BERAKHIR" | "DIBATALKAN";
export type StatusTagihan = "BELUM_BAYAR" | "LUNAS" | "TERLAMBAT";
export type KategoriAduan =
  | "AIR_BERSIH"
  | "SANITASI"
  | "LISTRIK"
  | "KEBERSIHAN"
  | "KEAMANAN"
  | "BANGUNAN"
  | "LAINNYA";
export type TingkatAduan = "RINGAN" | "SEDANG" | "BERAT";
export type StatusAduan =
  | "BARU"
  | "DIPROSES"
  | "SELESAI"
  | "DITERUSKAN"
  | "TIDAK_DAPAT_DITANGANI";

export const PERAN_LABEL: Record<Peran, string> = {
  ADMIN: "Administrator",
  PETUGAS: "Petugas Pelayanan",
  PIMPINAN: "Pimpinan / Kepala UPTD",
};

export const STATUS_UNIT_LABEL: Record<StatusUnit, { label: string; color: string; badgeBg: string }> = {
  KOSONG: { label: "Kosong", color: "text-emerald-700", badgeBg: "bg-emerald-50 border-emerald-200" },
  DIHUNI: { label: "Dihuni", color: "text-blue-700", badgeBg: "bg-blue-50 border-blue-200" },
  PERBAIKAN: { label: "Perbaikan", color: "text-amber-700", badgeBg: "bg-amber-50 border-amber-200" },
};

export const STATUS_SEWA_LABEL: Record<StatusSewa, { label: string; color: string; badgeBg: string }> = {
  AKTIF: { label: "Aktif", color: "text-blue-700", badgeBg: "bg-blue-50 border-blue-200" },
  BERAKHIR: { label: "Berakhir", color: "text-slate-600", badgeBg: "bg-slate-100 border-slate-200" },
  DIBATALKAN: { label: "Dibatalkan", color: "text-red-700", badgeBg: "bg-red-50 border-red-200" },
};

export const STATUS_TAGIHAN_LABEL: Record<StatusTagihan, { label: string; color: string; badgeBg: string }> = {
  LUNAS: { label: "Lunas", color: "text-emerald-700", badgeBg: "bg-emerald-50 border-emerald-200" },
  BELUM_BAYAR: { label: "Belum Bayar", color: "text-amber-700", badgeBg: "bg-amber-50 border-amber-200" },
  TERLAMBAT: { label: "Terlambat / Menunggak", color: "text-rose-700", badgeBg: "bg-rose-50 border-rose-200" },
};

export const KATEGORI_ADUAN_LABEL: Record<KategoriAduan, string> = {
  AIR_BERSIH: "Air Bersih",
  SANITASI: "Sanitasi & Limbah",
  LISTRIK: "Kelistrikan",
  KEBERSIHAN: "Kebersihan Lorong",
  KEAMANAN: "Keamanan Lingkungan",
  BANGUNAN: "Fisik Bangunan",
  LAINNYA: "Lainnya",
};

export const TINGKAT_ADUAN_LABEL: Record<TingkatAduan, { label: string; color: string; badgeBg: string; hariSLA: number }> = {
  RINGAN: { label: "Ringan (10 Hari Kerja)", color: "text-slate-700", badgeBg: "bg-slate-100 border-slate-200", hariSLA: 10 },
  SEDANG: { label: "Sedang (5 Hari Kerja)", color: "text-amber-800", badgeBg: "bg-amber-50 border-amber-200", hariSLA: 5 },
  BERAT: { label: "Berat (2 Hari Kerja)", color: "text-rose-700", badgeBg: "bg-rose-50 border-rose-200", hariSLA: 2 },
};

export const STATUS_ADUAN_LABEL: Record<StatusAduan, { label: string; color: string; badgeBg: string }> = {
  BARU: { label: "Tiket Baru", color: "text-sky-700", badgeBg: "bg-sky-50 border-sky-200" },
  DIPROSES: { label: "Sedang Ditangani", color: "text-amber-700", badgeBg: "bg-amber-50 border-amber-200" },
  SELESAI: { label: "Selesai", color: "text-emerald-700", badgeBg: "bg-emerald-50 border-emerald-200" },
  DITERUSKAN: { label: "Diteruskan ke Dinas", color: "text-purple-700", badgeBg: "bg-purple-50 border-purple-200" },
  TIDAK_DAPAT_DITANGANI: { label: "Tidak Dapat Ditangani", color: "text-slate-600", badgeBg: "bg-slate-100 border-slate-200" },
};
