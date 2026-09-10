import { NAMA_BULAN, formatRupiah } from "./format";

interface PengingatParams {
  nama: string;
  noHp: string;
  unitNomor: string;
  periodeBulan: number;
  periodeTahun: number;
  jumlah: number;
  bulanMenunggak?: number;
}

/**
 * Format nomor HP Indonesia ke format internasional (misal 0812 -> 62812)
 */
export function formatNomorWhatsApp(noHp: string): string {
  let cleaned = noHp.replace(/\D/g, ""); // Hapus karakter non-angka
  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.slice(1);
  } else if (!cleaned.startsWith("62")) {
    cleaned = "62" + cleaned;
  }
  return cleaned;
}

/**
 * Buat tautan wa.me dengan template pesan resmi UPTD Rusunawa Purwakarta
 */
export function buatTautanWhatsAppTagihan({
  nama,
  noHp,
  unitNomor,
  periodeBulan,
  periodeTahun,
  jumlah,
  bulanMenunggak = 1,
}: PengingatParams): string {
  const nomorWa = formatNomorWhatsApp(noHp);
  const bulanNama = NAMA_BULAN[periodeBulan] || `Bulan ${periodeBulan}`;
  const nominalStr = formatRupiah(jumlah);

  let statusPeringatan = "";
  if (bulanMenunggak === 1) {
    statusPeringatan = "⚠️ *PENGINGAT JATUH TEMPO (SP-1)*";
  } else if (bulanMenunggak === 2) {
    statusPeringatan = "🚨 *SURAT PERINGATAN KEDUA (SP-2)*";
  } else if (bulanMenunggak >= 3) {
    statusPeringatan = "⛔ *PERINGATAN TERAKHIR PENERTIBAN HUNIAN (SP-3)*";
  } else {
    statusPeringatan = "📌 *INFORMASI TAGIHAN RETRIBUSI RUSUNAWA*";
  }

  const pesan = `${statusPeringatan}
Pemerintah Kabupaten Purwakarta
Dinas Perumahan dan Kawasan Permukiman
UPTD Rusunawa Purwakarta

Yth. Bapak/Ibu *${nama}*
Penghuni Unit: *${unitNomor}*

Bersama ini kami informasikan rincian kewajiban retribusi sewa rusunawa Anda:
• Periode: *${bulanNama} ${periodeTahun}*
• Total Tagihan: *${nominalStr}*
• Status: *Menunggak (${bulanMenunggak} bulan)*
• Batas Jatuh Tempo: Tanggal 20 setiap bulan berjalan

Mohon untuk segera melakukan pembayaran dan konfirmasi penyetoran melalui Kantor Pengelola UPTD Rusunawa Purwakarta untuk menghindari tindakan penertiban unit sesuai ketentuan yang berlaku.

Abaikan pesan ini apabila Anda telah menyelesaikan pembayaran melalui kasir UPTD.

Terima kasih atas kerja sama dan kepatuhan Anda.

_Layanan Informasi & Pelayanan UPTD Rusunawa Kab. Purwakarta_`;

  return `https://wa.me/${nomorWa}?text=${encodeURIComponent(pesan)}`;
}
