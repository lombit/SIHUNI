import Link from "next/link";
import db from "@/backend/db";
import { formatRupiah, NAMA_BULAN } from "@/frontend/utils/format";
import { KategoriAduan, KATEGORI_ADUAN_LABEL } from "@/types";
import {
  BarChart3,
  Download,
  Receipt,
  AlertTriangle,
  Wrench,
  FileSpreadsheet,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LaporanPage() {
  const sekarang = new Date();

  // 1. Ambil data untuk Rekap Retribusi per Bulan
  const semuaTagihan = await db.tagihan.findMany({
    include: { pembayaran: true },
    orderBy: [{ periodeTahun: "desc" }, { periodeBulan: "desc" }],
  });

  const rekapRetribusiMap: Record<
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
    if (!rekapRetribusiMap[key]) {
      rekapRetribusiMap[key] = {
        tahun: t.periodeTahun,
        bulan: t.periodeBulan,
        jumlahLembar: 0,
        target: 0,
        terbayar: 0,
        tunggakan: 0,
      };
    }

    rekapRetribusiMap[key].jumlahLembar += 1;
    rekapRetribusiMap[key].target += t.jumlah;

    const dibayar = t.pembayaran.reduce((sum, p) => sum + p.jumlah, 0);
    rekapRetribusiMap[key].terbayar += dibayar;
    rekapRetribusiMap[key].tunggakan += t.jumlah - dibayar;
  }

  const rekapRetribusiList = Object.values(rekapRetribusiMap);

  // 2. Ambil data untuk Daftar Tunggakan per Unit
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

  const daftarTunggakanMap: Record<
    string,
    {
      unitId: string;
      nomorUnit: string;
      tower: string;
      lantai: number;
      penghuniId: string;
      namaPenghuni: string;
      noHp: string;
      bulanMenunggak: number;
      totalTunggakan: number;
    }
  > = {};

  for (const t of tagihanMenunggak) {
    const u = t.perjanjian.unit;
    const p = t.perjanjian.penghuni;
    const dibayar = t.pembayaran.reduce((sum, b) => sum + b.jumlah, 0);
    const sisa = t.jumlah - dibayar;

    if (!daftarTunggakanMap[u.id]) {
      daftarTunggakanMap[u.id] = {
        unitId: u.id,
        nomorUnit: u.nomor,
        tower: u.tower.nama,
        lantai: u.lantai,
        penghuniId: p.id,
        namaPenghuni: p.nama,
        noHp: p.noHp,
        bulanMenunggak: 0,
        totalTunggakan: 0,
      };
    }

    daftarTunggakanMap[u.id].bulanMenunggak += 1;
    daftarTunggakanMap[u.id].totalTunggakan += sisa;
  }

  const daftarTunggakanList = Object.values(daftarTunggakanMap).sort(
    (a, b) => b.totalTunggakan - a.totalTunggakan
  );

  // 3. Ambil data untuk Rekap Pengaduan per Kategori
  const semuaAduan = await db.pengaduan.findMany();
  const kategoriKeys: KategoriAduan[] = [
    "AIR_BERSIH",
    "SANITASI",
    "LISTRIK",
    "KEBERSIHAN",
    "KEAMANAN",
    "BANGUNAN",
    "LAINNYA",
  ];

  const rekapAduanList = kategoriKeys.map((kat) => {
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
        totalHari += Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
      }
    }
    const rataRataHari = selesai.length > 0 ? (totalHari / selesai.length).toFixed(1) : "—";

    return {
      kategori: kat,
      label: KATEGORI_ADUAN_LABEL[kat],
      total: aduanKat.length,
      selesai: selesai.length,
      diproses: diproses.length,
      baru: baru.length,
      overdue: overdue.length,
      rataRataHari,
    };
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
          <BarChart3 className="w-7 h-7 text-sky-700" />
          <span>Laporan & Rekapitulasi Operasional</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Laporan rekapitulasi penerimaan retribusi daerah, daftar piutang tunggakan, dan monitoring layanan pengaduan
        </p>
      </div>

      {/* Laporan 1: Rekap Penerimaan Retribusi per Bulan */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-900">
                1. Rekapitulasi Penerimaan Retribusi per Bulan
              </h2>
              <p className="text-xs text-slate-400">
                Monitoring target ketetapan retribusi versus realisasi penerimaan kas daerah
              </p>
            </div>
          </div>

          <a
            href="/api/laporan/ekspor?jenis=retribusi"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200 transition shadow-sm self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV (Excel)</span>
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50/80 text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Periode Bulan</th>
                <th className="py-3 px-4">Jml. Tagihan</th>
                <th className="py-3 px-4">Target Ketetapan</th>
                <th className="py-3 px-4">Realisasi Penerimaan</th>
                <th className="py-3 px-4">Sisa Tunggakan</th>
                <th className="py-3 px-4 text-right">% Realisasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rekapRetribusiList.map((r, idx) => {
                const persen = r.target > 0 ? Math.round((r.terbayar / r.target) * 100) : 0;
                return (
                  <tr key={idx} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 text-xs">
                      {NAMA_BULAN[r.bulan]} {r.tahun}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono text-slate-600">
                      {r.jumlahLembar} unit
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono font-medium text-slate-800">
                      {formatRupiah(r.target)}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono font-bold text-emerald-700">
                      {formatRupiah(r.terbayar)}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono font-semibold text-rose-700">
                      {formatRupiah(r.tunggakan)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-bold font-mono ${
                          persen >= 90
                            ? "bg-emerald-100 text-emerald-800"
                            : persen >= 70
                            ? "bg-sky-100 text-sky-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {persen}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Laporan 2: Daftar Tunggakan per Unit */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-900">
                2. Daftar Rincian Tunggakan per Unit
              </h2>
              <p className="text-xs text-slate-400">
                Rincian penghuni dengan piutang retribusi belum terlunasi untuk keperluan surat peringatan (SP)
              </p>
            </div>
          </div>

          <a
            href="/api/laporan/ekspor?jenis=tunggakan"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-semibold rounded-xl border border-rose-200 transition shadow-sm self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV (Excel)</span>
          </a>
        </div>

        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50/80 text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-100 sticky top-0 bg-slate-50">
              <tr>
                <th className="py-3 px-4">Unit Hunian</th>
                <th className="py-3 px-4">Gedung Tower</th>
                <th className="py-3 px-4">Nama Penghuni</th>
                <th className="py-3 px-4">Nomor HP / WA</th>
                <th className="py-3 px-4">Bulan Menunggak</th>
                <th className="py-3 px-4 text-right">Total Tunggakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {daftarTunggakanList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-slate-400">
                    Tidak ada catatan tunggakan retribusi saat ini.
                  </td>
                </tr>
              ) : (
                daftarTunggakanList.map((t, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-mono font-bold text-sky-800 text-xs">
                      <Link href={`/unit/${t.unitId}`} className="hover:underline">
                        {t.nomorUnit}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600">
                      {t.tower} • Lt. {t.lantai}
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        href={`/penghuni/${t.penghuniId}`}
                        className="font-semibold text-slate-800 text-xs hover:text-sky-700"
                      >
                        {t.namaPenghuni}
                      </Link>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-600">
                      {t.noHp}
                    </td>
                    <td className="py-3 px-4 text-xs">
                      <span className="font-bold text-rose-700 font-mono">
                        {t.bulanMenunggak}
                      </span>{" "}
                      bulan
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-rose-700 text-right text-xs">
                      {formatRupiah(t.totalTunggakan)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Laporan 3: Rekap Pengaduan per Kategori */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-900">
                3. Rekapitulasi Penanganan Pengaduan Gangguan
              </h2>
              <p className="text-xs text-slate-400">
                Statistik jenis keluhan gangguan dan efektivitas waktu penanganan oleh petugas
              </p>
            </div>
          </div>

          <a
            href="/api/laporan/ekspor?jenis=pengaduan"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-semibold rounded-xl border border-sky-200 transition shadow-sm self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV (Excel)</span>
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50/80 text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Kategori Gangguan</th>
                <th className="py-3 px-4">Total Tiket</th>
                <th className="py-3 px-4">Selesai</th>
                <th className="py-3 px-4">Diproses</th>
                <th className="py-3 px-4">Baru</th>
                <th className="py-3 px-4">Lewat Batas SLA</th>
                <th className="py-3 px-4 text-right">Rata-rata Waktu Tuntas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rekapAduanList.map((a, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-semibold text-slate-900 text-xs">
                    {a.label}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-800 text-xs">
                    {a.total}
                  </td>
                  <td className="py-3 px-4 text-xs font-semibold text-emerald-700">
                    {a.selesai}
                  </td>
                  <td className="py-3 px-4 text-xs text-amber-700">
                    {a.diproses}
                  </td>
                  <td className="py-3 px-4 text-xs text-sky-700">
                    {a.baru}
                  </td>
                  <td className="py-3 px-4 text-xs">
                    {a.overdue > 0 ? (
                      <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        {a.overdue} tiket
                      </span>
                    ) : (
                      <span className="text-slate-400">0</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right text-xs font-mono font-medium text-slate-700">
                    {a.rataRataHari !== "—" ? `${a.rataRataHari} hari` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
