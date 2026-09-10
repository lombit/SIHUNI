/**
 * Konversi angka rupiah ke teks terbilang Bahasa Indonesia
 * Contoh: 275000 -> "Dua Ratus Tujuh Puluh Lima Ribu Rupiah"
 */
export function terbilang(angka: number): string {
  const bilangan = [
    "",
    "Satu",
    "Dua",
    "Tiga",
    "Empat",
    "Lima",
    "Enam",
    "Tujuh",
    "Delapan",
    "Sembilan",
    "Sepuluh",
    "Sebelas",
  ];

  let hasil = "";
  const n = Math.floor(Math.abs(angka));

  if (n < 12) {
    hasil = bilangan[n];
  } else if (n < 20) {
    hasil = terbilang(n - 10) + " Belas";
  } else if (n < 100) {
    hasil = terbilang(Math.floor(n / 10)) + " Puluh " + terbilang(n % 10);
  } else if (n < 200) {
    hasil = "Seratus " + terbilang(n - 100);
  } else if (n < 1000) {
    hasil = terbilang(Math.floor(n / 100)) + " Ratus " + terbilang(n % 100);
  } else if (n < 2000) {
    hasil = "Seribu " + terbilang(n - 1000);
  } else if (n < 1000000) {
    hasil = terbilang(Math.floor(n / 1000)) + " Ribu " + terbilang(n % 1000);
  } else if (n < 1000000000) {
    hasil = terbilang(Math.floor(n / 1000000)) + " Juta " + terbilang(n % 1000000);
  } else if (n < 1000000000000) {
    hasil = terbilang(Math.floor(n / 1000000000)) + " Miliar " + terbilang(n % 1000000000);
  }

  return hasil.replace(/\s+/g, " ").trim();
}

export function terbilangRupiah(angka: number): string {
  if (angka === 0) return "Nol Rupiah";
  return `${terbilang(angka)} Rupiah`;
}
