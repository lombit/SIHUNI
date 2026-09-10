import Link from "next/link";
import db from "@/backend/db";
import { formatRupiah, formatTanggal, NAMA_BULAN } from "@/frontend/utils/format";
import { perbaruiStatusTerlambat } from "@/backend/services/tagihan.service";
import { STATUS_TAGIHAN_LABEL, StatusTagihan } from "@/types";
import {
  Receipt,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  CreditCard,
  Building,
  Printer,
  FileWarning,
} from "lucide-react";
import { GenerateTagihanButton } from "@/frontend/components/tagihan/GenerateTagihanButton";
import { BayarModal } from "@/frontend/components/tagihan/BayarModal";
import { WhatsAppButton } from "@/frontend/components/tagihan/WhatsAppButton";
import { Pagination } from "@/frontend/components/ui/Pagination";

export const dynamic = "force-dynamic";

interface TagihanPageProps {
  searchParams: Promise<{
    bulan?: string;
    tahun?: string;
    status?: string;
    q?: string;
    page?: string;
  }>;
}

const PAGE_SIZE = 25;

export default async function TagihanPage({ searchParams }: TagihanPageProps) {
  // Jalankan auto-update status tagihan yang terlambat
  await perbaruiStatusTerlambat();

  const params = await searchParams;
  const sekarang = new Date();
  const tahunIni = sekarang.getFullYear();
  const bulanIni = sekarang.getMonth() + 1;

  // Default: Tampilkan bulan berjalan jika tidak ada filter bulan
  const bulanParam = params.bulan;
  const bulanFilter =
    bulanParam === "all"
      ? undefined
      : bulanParam !== undefined && bulanParam !== ""
      ? parseInt(bulanParam, 10)
      : bulanIni;

  const tahunFilter = params.tahun ? parseInt(params.tahun, 10) : tahunIni;
  const statusFilter = params.status || "";
  const queryFilter = params.q || "";
  const currentPage = Math.max(1, parseInt(params.page || "1", 10) || 1);

  const where: any = {};
  if (bulanFilter !== undefined && !isNaN(bulanFilter)) {
    where.periodeBulan = bulanFilter;
  }
  if (tahunFilter && !isNaN(tahunFilter)) {
    where.periodeTahun = tahunFilter;
  }
  if (statusFilter) {
    where.status = statusFilter;
  }
  if (queryFilter) {
    where.OR = [
      { perjanjian: { unit: { nomor: { contains: queryFilter } } } },
      { perjanjian: { penghuni: { nama: { contains: queryFilter } } } },
      { pembayaran: { some: { nomorBukti: { contains: queryFilter } } } },
    ];
  }

  // Hitung total, agregat keuangan SQL, dan ambil data paginated dalam 1 round-trip paralel
  const [
    totalFiltered,
    agregatTagihan,
    agregatPembayaran,
    totalLunasCount,
    totalTerlambatCount,
    tagihanList,
  ] = await Promise.all([
    db.tagihan.count({ where }),
    db.tagihan.aggregate({
      where,
      _sum: { jumlah: true },
    }),
    db.pembayaran.aggregate({
      where: {
        tagihan: where,
      },
      _sum: { jumlah: true },
    }),
    db.tagihan.count({
      where: { ...where, status: "LUNAS" },
    }),
    db.tagihan.count({
      where: { ...where, status: "TERLAMBAT" },
    }),
    db.tagihan.findMany({
      where,
      include: {
        perjanjian: {
          include: {
            unit: { include: { tower: true } },
            penghuni: true,
          },
        },
        pembayaran: true,
      },
      orderBy: [
        { periodeTahun: "desc" },
        { periodeBulan: "desc" },
        { perjanjian: { unit: { nomor: "asc" } } },
      ],
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  const totalPages = Math.ceil(totalFiltered / PAGE_SIZE);
  const totalNominalTagihan = agregatTagihan._sum.jumlah || 0;
  const totalNominalTerbayar = agregatPembayaran._sum.jumlah || 0;
  const totalNominalTunggakan = Math.max(0, totalNominalTagihan - totalNominalTerbayar);
  const persentaseRealisasi =
    totalNominalTagihan > 0
      ? Math.round((totalNominalTerbayar / totalNominalTagihan) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Header & Generator Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Receipt className="w-7 h-7 text-sky-700" />
            <span>Tagihan & Rekonsiliasi Retribusi</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Pengelolaan tagihan bulanan sewa hunian dan pencatatan setoran ke kas daerah (STS)
          </p>
        </div>

        <GenerateTagihanButton />
      </div>

      {/* Ringkasan Keuangan Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Ketetapan (Target)
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">
            {formatRupiah(totalNominalTagihan)}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            {totalFiltered} lembar tagihan
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Realisasi Kasda (Terbayar)</span>
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-1 font-mono">
            {formatRupiah(totalNominalTerbayar)}
          </div>
          <div className="text-xs text-emerald-600/80 mt-0.5">
            {totalLunasCount} tagihan lunas
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="text-xs font-semibold text-rose-600 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Piutang / Tunggakan</span>
          </div>
          <div className="text-2xl font-bold text-rose-700 mt-1 font-mono">
            {formatRupiah(totalNominalTunggakan)}
          </div>
          <div className="text-xs text-rose-600/80 mt-0.5">
            {totalTerlambatCount} tagihan terlambat
          </div>
        </div>

        <div className="bg-gradient-to-br from-sky-700 to-indigo-800 p-4 rounded-xl text-white shadow-sm flex flex-col justify-between">
          <div className="text-xs font-medium text-sky-200 uppercase tracking-wider flex items-center gap-1.5">
            <ArrowUpRight className="w-4 h-4" />
            <span>Tingkat Kepatuhan Bayar</span>
          </div>
          <div className="text-2xl font-bold mt-1 font-mono">{persentaseRealisasi}%</div>
          <div className="w-full bg-white/20 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-emerald-400 h-full rounded-full transition-all"
              style={{ width: `${persentaseRealisasi}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
        <form method="GET" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              name="q"
              defaultValue={queryFilter}
              placeholder="Cari unit atau nama..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50 focus:bg-white"
            />
          </div>

          <div>
            <select
              name="bulan"
              defaultValue={bulanFilter !== undefined ? String(bulanFilter) : "all"}
              className="w-full py-2 px-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50 focus:bg-white"
            >
              <option value="all">Semua Bulan</option>
              {NAMA_BULAN.slice(1).map((namaBulan, idx) => (
                <option key={idx + 1} value={String(idx + 1)}>
                  {namaBulan}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              name="tahun"
              defaultValue={String(tahunFilter)}
              className="w-full py-2 px-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50 focus:bg-white"
            >
              <option value={String(tahunIni)}>{tahunIni}</option>
              <option value={String(tahunIni - 1)}>{tahunIni - 1}</option>
            </select>
          </div>

          <div>
            <select
              name="status"
              defaultValue={statusFilter}
              className="w-full py-2 px-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50 focus:bg-white"
            >
              <option value="">Semua Status</option>
              <option value="BELUM_BAYAR">Belum Bayar</option>
              <option value="TERLAMBAT">Terlambat / Menunggak</option>
              <option value="LUNAS">Lunas</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 py-2 px-3 bg-sky-700 hover:bg-sky-800 text-white rounded-lg text-sm font-medium transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Saring</span>
            </button>
            <Link
              href="/tagihan"
              className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition flex items-center justify-center"
            >
              Reset
            </Link>
          </div>
        </form>
      </div>

      {/* Tabel Tagihan */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50/80 text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4">Unit & Penghuni</th>
                <th className="py-3.5 px-4">Periode Tagihan</th>
                <th className="py-3.5 px-4">Jumlah Tagihan</th>
                <th className="py-3.5 px-4">Jatuh Tempo</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Pencatatan Pembayaran</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tagihanList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Receipt className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-medium">Tidak ada data tagihan yang sesuai filter.</p>
                  </td>
                </tr>
              ) : (
                tagihanList.map((t) => {
                  const sInfo = STATUS_TAGIHAN_LABEL[t.status as StatusTagihan] || {
                    label: t.status,
                    color: "text-slate-700",
                    badgeBg: "bg-slate-100 border-slate-200",
                  };

                  const unit = t.perjanjian.unit;
                  const penghuni = t.perjanjian.penghuni;
                  const totalBayar = t.pembayaran.reduce((sum, p) => sum + p.jumlah, 0);
                  const sisa = t.jumlah - totalBayar;
                  const pembayaranTerakhir = t.pembayaran[t.pembayaran.length - 1];

                  return (
                    <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/unit/${unit.id}`}
                          className="font-mono font-bold text-sky-700 hover:text-sky-900 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 inline-block text-xs"
                        >
                          {unit.nomor}
                        </Link>
                        <Link
                          href={`/penghuni/${penghuni.id}`}
                          className="font-semibold text-slate-800 hover:text-sky-700 block text-xs mt-1"
                        >
                          {penghuni.nama}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-slate-800">
                        {NAMA_BULAN[t.periodeBulan]} {t.periodeTahun}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-xs text-slate-900">
                        {formatRupiah(t.jumlah)}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {formatTanggal(t.jatuhTempo)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${sInfo.badgeBg} ${sInfo.color}`}
                        >
                          {sInfo.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        {pembayaranTerakhir ? (
                          <div>
                            <div className="font-mono font-medium text-slate-800">
                              {pembayaranTerakhir.nomorBukti}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {formatTanggal(pembayaranTerakhir.tanggalBayar)}
                              {pembayaranTerakhir.nomorSetoran && (
                                <span className="block text-emerald-700 font-mono font-semibold">
                                  STS: {pembayaranTerakhir.nomorSetoran}
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Belum ada bayar</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {sisa > 0 ? (
                            <>
                              <WhatsAppButton
                                nama={penghuni.nama}
                                noHp={penghuni.noHp}
                                unitNomor={unit.nomor}
                                periodeBulan={t.periodeBulan}
                                periodeTahun={t.periodeTahun}
                                jumlah={sisa}
                                compact={true}
                              />

                              <Link
                                href={`/tagihan/${t.id}/peringatan`}
                                title="Cetak Surat Peringatan (SP) Resmi"
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 px-2 py-1 rounded-lg border border-rose-200 transition shadow-xs"
                              >
                                <FileWarning className="w-3.5 h-3.5 text-rose-600" />
                                <span>Cetak SP</span>
                              </Link>

                              <BayarModal
                                tagihanId={t.id}
                                unitNomor={unit.nomor}
                                penghuniNama={penghuni.nama}
                                periodeBulan={t.periodeBulan}
                                periodeTahun={t.periodeTahun}
                                jumlahTagihan={t.jumlah}
                                sisaTagihan={sisa}
                              />
                            </>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Lunas</span>
                              </span>

                              <Link
                                href={`/tagihan/${t.id}/kuitansi`}
                                title="Cetak Kuitansi Tanda Terima Resmi"
                                className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 px-2.5 py-1 rounded-lg border border-sky-200 transition shadow-xs"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                <span>Kuitansi</span>
                              </Link>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalFiltered}
          pageSize={PAGE_SIZE}
          baseUrl="/tagihan"
          searchParams={{
            bulan: bulanFilter !== undefined ? String(bulanFilter) : "all",
            tahun: tahunFilter,
            status: statusFilter,
            q: queryFilter,
          }}
        />
      </div>
    </div>
  );
}
