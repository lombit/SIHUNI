import Link from "next/link";
import db from "@/backend/db";
import { formatRupiah, formatTanggal, NAMA_BULAN, isLewatBatasWaktu } from "@/frontend/utils/format";
import { perbaruiStatusTerlambat } from "@/backend/services/tagihan.service";
import { WhatsAppButton } from "@/frontend/components/tagihan/WhatsAppButton";
import {
  STATUS_TAGIHAN_LABEL,
  STATUS_ADUAN_LABEL,
  TINGKAT_ADUAN_LABEL,
  KATEGORI_ADUAN_LABEL,
  StatusAduan,
  TingkatAduan,
  KategoriAduan,
} from "@/types";
import {
  Building2,
  Users,
  Home,
  Receipt,
  AlertCircle,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  ArrowUpRight,
  Wrench,
  FileText,
  ShieldCheck,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // 1. Sinkronisasi tagihan terlambat secara cepat (memanfaatkan indeks [status, jatuhTempo])
  await perbaruiStatusTerlambat();

  const sekarang = new Date();
  const bulanIni = sekarang.getMonth() + 1;
  const tahunIni = sekarang.getFullYear();

  // Eksekusi seluruh pembacaan data secara paralel dalam 1 network round-trip
  const [
    unitStatusCounts,
    totalPenghuni,
    totalAnggota,
    tagihanBulanIni,
    semuaTagihanBelumLunas,
    totalAduanTerbuka,
    totalAduanOverdue,
    top5AduanTerlama,
  ] = await Promise.all([
    // Hitung status unit dalam 1 query GROUP BY
    db.unit.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    db.penghuni.count(),
    db.anggotaKeluarga.count(),
    // Tagihan bulan ini hanya kolom yang diperlukan
    db.tagihan.findMany({
      where: {
        periodeBulan: bulanIni,
        periodeTahun: tahunIni,
      },
      select: {
        jumlah: true,
        pembayaran: {
          select: { jumlah: true },
        },
      },
    }),
    // Tagihan belum lunas dengan selective projection (tanpa overfetching)
    db.tagihan.findMany({
      where: {
        status: { in: ["BELUM_BAYAR", "TERLAMBAT"] },
      },
      select: {
        jumlah: true,
        pembayaran: {
          select: { jumlah: true },
        },
        perjanjian: {
          select: {
            unitId: true,
            penghuniId: true,
            unit: {
              select: { id: true, nomor: true },
            },
            penghuni: {
              select: { id: true, nama: true, noHp: true },
            },
          },
        },
      },
    }),
    db.pengaduan.count({
      where: { status: { in: ["BARU", "DIPROSES"] } },
    }),
    db.pengaduan.count({
      where: {
        status: { not: "SELESAI" },
        batasWaktu: { lt: sekarang },
      },
    }),
    db.pengaduan.findMany({
      where: {
        status: { in: ["BARU", "DIPROSES"] },
      },
      select: {
        id: true,
        nomorTiket: true,
        kategori: true,
        tingkat: true,
        status: true,
        uraian: true,
        batasWaktu: true,
        tanggalLapor: true,
        unit: {
          select: {
            nomor: true,
          },
        },
      },
      orderBy: { tanggalLapor: "asc" },
      take: 5,
    }),
  ]);

  // Ekstraksi hasil GROUP BY Unit
  let totalUnit = 0;
  let totalDihuni = 0;
  let totalKosong = 0;
  let totalPerbaikan = 0;

  for (const group of unitStatusCounts) {
    totalUnit += group._count._all;
    if (group.status === "DIHUNI") totalDihuni = group._count._all;
    else if (group.status === "KOSONG") totalKosong = group._count._all;
    else if (group.status === "PERBAIKAN") totalPerbaikan = group._count._all;
  }
  const persentaseOkupansi = Math.round((totalDihuni / (totalUnit || 1)) * 100);

  // Perhitungan Keuangan Bulan Berjalan
  let targetBulanIni = 0;
  let realisasiBulanIni = 0;
  for (const t of tagihanBulanIni) {
    targetBulanIni += t.jumlah;
    const paid = t.pembayaran.reduce((sum, p) => sum + p.jumlah, 0);
    realisasiBulanIni += paid;
  }
  const persentaseBulanIni =
    targetBulanIni > 0 ? Math.round((realisasiBulanIni / targetBulanIni) * 100) : 0;

  // Perhitungan Tunggakan Keseluruhan
  let totalTunggakanSemua = 0;
  const tunggakanPerPenghuni: Record<
    string,
    {
      unitNomor: string;
      penghuniNama: string;
      penghuniHp: string;
      bulanMenunggak: number;
      totalTunggakan: number;
      unitId: string;
      penghuniId: string;
    }
  > = {};

  for (const t of semuaTagihanBelumLunas) {
    const dibayar = t.pembayaran.reduce((sum, p) => sum + p.jumlah, 0);
    const sisa = t.jumlah - dibayar;
    totalTunggakanSemua += sisa;

    const unitKey = t.perjanjian.unitId;
    if (!tunggakanPerPenghuni[unitKey]) {
      tunggakanPerPenghuni[unitKey] = {
        unitNomor: t.perjanjian.unit.nomor,
        penghuniNama: t.perjanjian.penghuni.nama,
        penghuniHp: t.perjanjian.penghuni.noHp,
        bulanMenunggak: 0,
        totalTunggakan: 0,
        unitId: t.perjanjian.unit.id,
        penghuniId: t.perjanjian.penghuni.id,
      };
    }
    tunggakanPerPenghuni[unitKey].bulanMenunggak += 1;
    tunggakanPerPenghuni[unitKey].totalTunggakan += sisa;
  }

  const top5Tunggakan = Object.values(tunggakanPerPenghuni)
    .sort((a, b) => b.totalTunggakan - a.totalTunggakan)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Dasbor Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Dasbor Ringkasan Rusunawa</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Status operasional, okupansi, penerimaan retribusi, dan tiket layanan UPTD Rusunawa Purwakarta
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-sm self-start sm:self-auto">
          <Clock className="w-3.5 h-3.5 text-sky-600" />
          <span>
            Periode: <strong>{NAMA_BULAN[bulanIni]} {tahunIni}</strong>
          </span>
        </div>
      </div>

      {/* Grid Metrik Utama */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Okupansi Unit
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="text-3xl font-extrabold text-slate-900 font-mono">
              {totalDihuni} <span className="text-sm font-sans font-normal text-slate-400">/ {totalUnit} unit</span>
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
              <span className="text-emerald-700 font-bold">{totalKosong} Kosong</span> •{" "}
              <span className="text-amber-700">{totalPerbaikan} Perbaikan</span>
            </div>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-sky-600 h-full rounded-full transition-all"
              style={{ width: `${persentaseOkupansi}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-400 text-right font-medium">
            Tingkat Keterisian: {persentaseOkupansi}%
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Warga Penghuni
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="text-3xl font-extrabold text-slate-900 font-mono">
              {totalPenghuni + totalAnggota}{" "}
              <span className="text-sm font-sans font-normal text-slate-400">Jiwa</span>
            </div>
            <div className="text-xs text-slate-500 mt-1 font-medium">
              {totalPenghuni} Kepala Keluarga terdaftar
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">Anggota Keluarga:</span>
            <span className="font-semibold text-indigo-700">{totalAnggota} orang</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Retribusi {NAMA_BULAN[bulanIni]}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="text-2xl font-extrabold text-emerald-700 font-mono">
              {formatRupiah(realisasiBulanIni)}
            </div>
            <div className="text-xs text-slate-400 mt-1 font-medium">
              Target: {formatRupiah(targetBulanIni)}
            </div>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all"
              style={{ width: `${persentaseBulanIni}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-400 text-right font-medium">
            Tercapai: {persentaseBulanIni}%
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Piutang & SLA Aduan
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="text-2xl font-extrabold text-rose-700 font-mono">
              {formatRupiah(totalTunggakanSemua)}
            </div>
            <div className="text-xs text-rose-600/80 mt-1 font-medium">
              Total Tunggakan Tertagih
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Tiket Terbuka:</span>
            <span className="font-semibold text-slate-800">
              {totalAduanTerbuka} ({totalAduanOverdue} lewat SLA)
            </span>
          </div>
        </div>
      </div>

      {/* Grid 2 Kolom */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kolom 1 */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-rose-600" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                5 Penunggak Retribusi Terbesar
              </h2>
            </div>
            <Link
              href="/laporan"
              className="text-xs font-semibold text-sky-700 hover:text-sky-900 flex items-center gap-1"
            >
              <span>Lihat Rekap</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-2 flex-1">
            {top5Tunggakan.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Tidak ada catatan tunggakan retribusi saat ini.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {top5Tunggakan.map((t, idx) => {
                  const spBadge =
                    t.bulanMenunggak >= 3
                      ? { label: "SP-3", color: "bg-rose-100 text-rose-800 border-rose-300" }
                      : t.bulanMenunggak === 2
                      ? { label: "SP-2", color: "bg-orange-100 text-orange-800 border-orange-300" }
                      : { label: "SP-1", color: "bg-amber-100 text-amber-800 border-amber-300" };

                  return (
                    <div
                      key={idx}
                      className="p-3 hover:bg-slate-50 rounded-xl transition flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-6 h-6 rounded-full bg-slate-100 font-mono font-bold text-slate-600 text-xs flex items-center justify-center flex-shrink-0">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/unit/${t.unitId}`}
                              className="font-mono font-bold text-sky-800 text-xs bg-sky-50 px-2 py-0.5 rounded border border-sky-200"
                            >
                              Unit {t.unitNomor}
                            </Link>
                            <Link
                              href={`/penghuni/${t.penghuniId}`}
                              className="font-semibold text-slate-900 text-xs truncate hover:underline"
                            >
                              {t.penghuniNama}
                            </Link>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.2 rounded border font-mono ${spBadge.color}`}
                            >
                              {spBadge.label}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                            {t.penghuniHp} • Menunggak {t.bulanMenunggak} bulan
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0 flex items-center gap-2">
                        <div>
                          <div className="font-mono font-bold text-rose-700 text-sm">
                            {formatRupiah(t.totalTunggakan)}
                          </div>
                          <Link
                            href={`/tagihan?q=${t.unitNomor}`}
                            className="text-[11px] text-sky-700 hover:underline font-medium"
                          >
                            Buka Tagihan
                          </Link>
                        </div>

                        <WhatsAppButton
                          nama={t.penghuniNama}
                          noHp={t.penghuniHp}
                          unitNomor={t.unitNomor}
                          periodeBulan={bulanIni}
                          periodeTahun={tahunIni}
                          jumlah={t.totalTunggakan}
                          bulanMenunggak={t.bulanMenunggak}
                          compact={true}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Kolom 2 */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                5 Pengaduan Terlama Belum Selesai
              </h2>
            </div>
            <Link
              href="/pengaduan"
              className="text-xs font-semibold text-sky-700 hover:text-sky-900 flex items-center gap-1"
            >
              <span>Semua Aduan</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-2 flex-1">
            {top5AduanTerlama.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Seluruh pengaduan telah selesai tertangani.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {top5AduanTerlama.map((aduan) => {
                  const overdue = isLewatBatasWaktu(aduan.batasWaktu, aduan.status === "SELESAI");
                  const tInfo = TINGKAT_ADUAN_LABEL[aduan.tingkat as TingkatAduan] || {
                    label: aduan.tingkat,
                    badgeBg: "bg-slate-100 border-slate-200",
                    color: "text-slate-700",
                  };
                  const katLabel = KATEGORI_ADUAN_LABEL[aduan.kategori as KategoriAduan] || aduan.kategori;

                  return (
                    <div
                      key={aduan.id}
                      className={`p-3 rounded-xl transition flex items-center justify-between gap-3 ${
                        overdue ? "bg-rose-50/50 hover:bg-rose-50" : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/pengaduan/${aduan.id}`}
                            className="font-mono font-bold text-sky-800 text-xs hover:underline"
                          >
                            {aduan.nomorTiket}
                          </Link>
                          <span className="font-mono text-xs font-semibold text-slate-700">
                            Unit {aduan.unit.nomor}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${tInfo.badgeBg} ${tInfo.color}`}
                          >
                            {aduan.tingkat}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 truncate mt-1">
                          {katLabel}: {aduan.uraian}
                        </p>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Lapor: {formatTanggal(aduan.tanggalLapor)} • Batas SLA: {formatTanggal(aduan.batasWaktu)}
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        {overdue ? (
                          <span className="inline-block text-[10px] font-bold text-rose-700 bg-rose-100 border border-rose-300 px-2 py-0.5 rounded-full mb-1">
                            LEWAT SLA
                          </span>
                        ) : (
                          <span className="inline-block text-[10px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full mb-1">
                            {aduan.status}
                          </span>
                        )}
                        <div>
                          <Link
                            href={`/pengaduan/${aduan.id}`}
                            className="text-[11px] text-sky-700 hover:underline font-semibold"
                          >
                            Tindak Lanjut →
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
