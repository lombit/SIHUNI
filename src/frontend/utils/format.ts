import { format, addDays, isWeekend } from "date-fns";
import { id } from "date-fns/locale";

/**
 * Format mata uang Rupiah Indonesia konsisten (misal: Rp350.000)
 */
export function formatRupiah(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return "Rp0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace(/\s+/g, "");
}

/**
 * Format tanggal Indonesia (misal: 10 September 2026)
 */
export function formatTanggal(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "-";
  return format(d, "d MMMM yyyy", { locale: id });
}

/**
 * Format tanggal pendek (misal: 10/09/2026)
 */
export function formatTanggalPendek(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "-";
  return format(d, "dd/MM/yyyy");
}

/**
 * Format tanggal dan waktu lengkap
 */
export function formatTanggalWaktu(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "-";
  return format(d, "d MMMM yyyy, HH:mm", { locale: id }) + " WIB";
}

/**
 * Hitung batas waktu SLA pengaduan berdasarkan hari kerja (Senin - Jumat)
 * - BERAT: 2 hari kerja
 * - SEDANG: 5 hari kerja
 * - RINGAN: 10 hari kerja
 */
export function hitungBatasWaktuSLA(tanggalMulai: Date, tingkat: "BERAT" | "SEDANG" | "RINGAN"): Date {
  const targetHariKerja = tingkat === "BERAT" ? 2 : tingkat === "SEDANG" ? 5 : 10;
  let sisaHari = targetHariKerja;
  let current = new Date(tanggalMulai);

  while (sisaHari > 0) {
    current = addDays(current, 1);
    if (!isWeekend(current)) {
      sisaHari--;
    }
  }

  current.setHours(16, 0, 0, 0);
  return current;
}

/**
 * Cek apakah tanggal sudah melewati deadline
 */
export function isLewatBatasWaktu(batasWaktu: Date | string, statusSelesai = false): boolean {
  if (statusSelesai) return false;
  const d = typeof batasWaktu === "string" ? new Date(batasWaktu) : batasWaktu;
  return new Date() > d;
}

/**
 * Nama bulan dalam Bahasa Indonesia
 */
export const NAMA_BULAN = [
  "",
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];
