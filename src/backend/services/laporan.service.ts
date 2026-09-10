import db from "../db";
import { NAMA_BULAN } from "@/frontend/utils/format";
import { KategoriAduan, KATEGORI_ADUAN_LABEL } from "@/types";

export async function generateCsvLaporan(jenis: "retribusi" | "tunggakan" | "pengaduan") {
  if (jenis === "retribusi") {
    const semuaTagihan = await db.tagihan.findMany({
      include: { pembayaran: true },
      orderBy: [{ periodeTahun: "desc" }, { periodeBulan: "desc" }],
    });

    const rekap: Record<
      string,
      {
        tahun: number;
        bulan: number;
        jumlahLembar: number;
        target: number;
        terbayar: number;
        tunggakan: number;
      }
    > = {};

    for (const t of semuaTagihan) {
      const key = `${t.periodeTahun}-${t.periodeBulan}`;
      if (!rekap[key]) {
        rekap[key] = {
          tahun: t.periodeTahun,
          bulan: t.periodeBulan,
          jumlahLembar: 0,
          target: 0,
          terbayar: 0,
          tunggakan: 0,
        };
      }

      rekap[key].jumlahLembar += 1;
      rekap[key].target += t.jumlah;

      const dibayar = t.pembayaran.reduce((sum, p) => sum + p.jumlah, 0);
      rekap[key].terbayar += dibayar;
      rekap[key].tunggakan += t.jumlah - dibayar;
    }

    const rows = Object.values(rekap);
    let csv = "Periode Tahun,Periode Bulan,Nama Bulan,Jumlah Tagihan Diterbitkan,Target Retribusi (IDR),Realisasi Terbayar (IDR),Sisa Tunggakan (IDR),Persentase Realisasi (%)\n";

    for (const r of rows) {
      const persen = r.target > 0 ? ((r.terbayar / r.target) * 100).toFixed(2) : "0.00";
      csv += `${r.tahun},${r.bulan},"${NAMA_BULAN[r.bulan]}",${r.jumlahLembar},${r.target},${r.terbayar},${r.tunggakan},${persen}\n`;
    }

    return {
      csv,
      filename: `rekap-penerimaan-retribusi-${Date.now()}.csv`,
    };
  }

  if (jenis === "tunggakan") {
    const tagihanMenunggak = await db.tagihan.findMany({
      where: { status: { in: ["BELUM_BAYAR", "TERLAMBAT"] } },
      include: {
        pembayaran: true,
        perjanjian: {
          include: {
            unit: { include: { tower: true } },
            penghuni: true,
          },
        },
      },
    });

    const tunggakanMap: Record<
      string,
      {
        nomorUnit: string;
        tower: string;
        lantai: number;
        namaPenghuni: string;
        noHp: string;
        bulanMenunggak: number;
        totalNilaiTunggakan: number;
      }
    > = {};

    for (const t of tagihanMenunggak) {
      const u = t.perjanjian.unit;
      const p = t.perjanjian.penghuni;
      const dibayar = t.pembayaran.reduce((sum, b) => sum + b.jumlah, 0);
      const sisa = t.jumlah - dibayar;

      if (!tunggakanMap[u.id]) {
        tunggakanMap[u.id] = {
          nomorUnit: u.nomor,
          tower: u.tower.nama,
          lantai: u.lantai,
          namaPenghuni: p.nama,
          noHp: p.noHp,
          bulanMenunggak: 0,
          totalNilaiTunggakan: 0,
        };
      }

      tunggakanMap[u.id].bulanMenunggak += 1;
      tunggakanMap[u.id].totalNilaiTunggakan += sisa;
    }

    const rows = Object.values(tunggakanMap).sort(
      (a, b) => b.totalNilaiTunggakan - a.totalNilaiTunggakan
    );

    let csv = "Nomor Unit,Gedung Tower,Lantai,Nama Penghuni,Nomor HP,Jumlah Bulan Menunggak,Total Nilai Tunggakan (IDR)\n";

    for (const r of rows) {
      csv += `"${r.nomorUnit}","${r.tower}",${r.lantai},"${r.namaPenghuni}","${r.noHp}",${r.bulanMenunggak},${r.totalNilaiTunggakan}\n`;
    }

    return {
      csv,
      filename: `daftar-tunggakan-rusunawa-${Date.now()}.csv`,
    };
  }

  if (jenis === "pengaduan") {
    const semuaAduan = await db.pengaduan.findMany();
    const sekarang = new Date();

    const kategoriList: KategoriAduan[] = [
      "AIR_BERSIH",
      "SANITASI",
      "LISTRIK",
      "KEBERSIHAN",
      "KEAMANAN",
      "BANGUNAN",
      "LAINNYA",
    ];

    let csv = "Kategori Gangguan,Nama Kategori,Total Tiket,Status Selesai,Status Diproses,Status Baru,Lewat Batas Waktu SLA,Rata-rata Durasi Penanganan (Hari)\n";

    for (const kat of kategoriList) {
      const aduanKat = semuaAduan.filter((a) => a.kategori === kat);
      const selesai = aduanKat.filter((a) => a.status === "SELESAI");
      const diproses = aduanKat.filter((a) => a.status === "DIPROSES");
      const baru = aduanKat.filter((a) => a.status === "BARU");
      const overdue = aduanKat.filter(
        (a) => a.status !== "SELESAI" && sekarang > a.batasWaktu
      );

      let totalHari = 0;
      for (const s of selesai) {
        if (s.tanggalSelesai) {
          const diffMs = s.tanggalSelesai.getTime() - s.tanggalLapor.getTime();
          const diffHari = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
          totalHari += diffHari;
        }
      }
      const rataRata = selesai.length > 0 ? (totalHari / selesai.length).toFixed(1) : "0.0";

      csv += `"${kat}","${KATEGORI_ADUAN_LABEL[kat]}",${aduanKat.length},${selesai.length},${diproses.length},${baru.length},${overdue.length},${rataRata}\n`;
    }

    return {
      csv,
      filename: `rekap-pengaduan-rusunawa-${Date.now()}.csv`,
    };
  }

  throw new Error("Jenis laporan tidak valid");
}
