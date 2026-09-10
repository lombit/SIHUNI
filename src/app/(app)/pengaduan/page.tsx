import Link from "next/link";
import db from "@/backend/db";
import { formatTanggal, formatTanggalWaktu, isLewatBatasWaktu } from "@/frontend/utils/format";
import {
  STATUS_ADUAN_LABEL,
  TINGKAT_ADUAN_LABEL,
  KATEGORI_ADUAN_LABEL,
  StatusAduan,
  TingkatAduan,
  KategoriAduan,
} from "@/types";
import {
  AlertCircle,
  PlusCircle,
  Search,
  Filter,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { Pagination } from "@/frontend/components/ui/Pagination";

export const dynamic = "force-dynamic";

interface PengaduanPageProps {
  searchParams: Promise<{
    status?: string;
    kategori?: string;
    q?: string;
    page?: string;
  }>;
}

const PAGE_SIZE = 20;

export default async function PengaduanPage({ searchParams }: PengaduanPageProps) {
  const params = await searchParams;
  const statusFilter = params.status || "";
  const kategoriFilter = params.kategori || "";
  const queryFilter = params.q || "";
  const currentPage = Math.max(1, parseInt(params.page || "1", 10) || 1);
  const sekarang = new Date();

  const where: any = {};
  if (statusFilter === "OVERDUE") {
    where.status = { not: "SELESAI" };
    where.batasWaktu = { lt: sekarang };
  } else if (statusFilter) {
    where.status = statusFilter;
  }

  if (kategoriFilter) {
    where.kategori = kategoriFilter;
  }
  if (queryFilter) {
    where.OR = [
      { nomorTiket: { contains: queryFilter } },
      { namaPelapor: { contains: queryFilter } },
      { uraian: { contains: queryFilter } },
      { unit: { nomor: { contains: queryFilter } } },
    ];
  }

  const [totalFiltered, totalSemua, totalBaru, totalDiproses, totalSelesai, totalOverdue] =
    await Promise.all([
      db.pengaduan.count({ where }),
      db.pengaduan.count(),
      db.pengaduan.count({ where: { status: "BARU" } }),
      db.pengaduan.count({ where: { status: "DIPROSES" } }),
      db.pengaduan.count({ where: { status: "SELESAI" } }),
      db.pengaduan.count({
        where: {
          status: { not: "SELESAI" },
          batasWaktu: { lt: sekarang },
        },
      }),
    ]);

  const totalPages = Math.ceil(totalFiltered / PAGE_SIZE);

  const pengaduanList = await db.pengaduan.findMany({
    where,
    include: {
      unit: { include: { tower: true } },
    },
    orderBy: [{ tanggalLapor: "desc" }],
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <AlertCircle className="w-7 h-7 text-sky-700" />
            <span>Pengaduan Gangguan & Layanan Rusun</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Penanganan laporan kerusakan fisik, air, sanitasi, dan listrik sesuai standar waktu kerja (SLA Formulir RSN-03)
          </p>
        </div>

        <Link
          href="/pengaduan/baru"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-700 hover:bg-sky-800 text-white font-medium text-sm rounded-xl shadow-sm transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Buat Pengaduan Baru (RSN-03)</span>
        </Link>
      </div>

      {/* KPI Cards (Clickable Quick Filters) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Link
          href="/pengaduan"
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm hover:border-sky-300 transition block"
        >
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Seluruh Aduan
          </div>
          <div className="text-2xl font-bold text-slate-800 mt-1">{totalSemua}</div>
          <div className="text-xs text-slate-400 mt-0.5">{totalBaru} tiket baru</div>
        </Link>

        <Link
          href="/pengaduan?status=DIPROSES"
          className={`p-4 rounded-xl border shadow-sm transition block ${
            statusFilter === "DIPROSES"
              ? "bg-amber-50/80 border-amber-300 ring-2 ring-amber-400"
              : "bg-white border-slate-200/80 hover:border-amber-300"
          }`}
        >
          <div className="text-xs font-semibold text-amber-600 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Sedang Ditangani</span>
          </div>
          <div className="text-2xl font-bold text-amber-700 mt-1">{totalDiproses}</div>
          <div className="text-xs text-amber-600/80 mt-0.5">Dalam pengerjaan teknisi</div>
        </Link>

        <Link
          href="/pengaduan?status=SELESAI"
          className={`p-4 rounded-xl border shadow-sm transition block ${
            statusFilter === "SELESAI"
              ? "bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-400"
              : "bg-white border-slate-200/80 hover:border-emerald-300"
          }`}
        >
          <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Selesai Tertangani</span>
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{totalSelesai}</div>
          <div className="text-xs text-emerald-600/80 mt-0.5">Perbaikan tuntas</div>
        </Link>

        <Link
          href="/pengaduan?status=OVERDUE"
          className={`p-4 rounded-xl border shadow-sm transition block ${
            statusFilter === "OVERDUE"
              ? "bg-rose-100 border-rose-400 ring-2 ring-rose-500"
              : "bg-rose-50 border-rose-200 hover:border-rose-300"
          }`}
        >
          <div className="text-xs font-semibold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Lewat Batas SLA</span>
          </div>
          <div className="text-2xl font-bold text-rose-700 mt-1">{totalOverdue}</div>
          <div className="text-xs text-rose-600 font-medium mt-0.5">Membutuhkan atensi &bull; Klik filter</div>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
        <form method="GET" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              name="q"
              defaultValue={queryFilter}
              placeholder="Cari tiket, nama, masalah..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50 focus:bg-white"
            />
          </div>

          <div>
            <select
              name="kategori"
              defaultValue={kategoriFilter}
              className="w-full py-2 px-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50 focus:bg-white"
            >
              <option value="">Semua Kategori</option>
              <option value="AIR_BERSIH">Air Bersih</option>
              <option value="SANITASI">Sanitasi</option>
              <option value="LISTRIK">Kelistrikan</option>
              <option value="KEBERSIHAN">Kebersihan</option>
              <option value="KEAMANAN">Keamanan</option>
              <option value="BANGUNAN">Fisik Bangunan</option>
              <option value="LAINNYA">Lain-Lain</option>
            </select>
          </div>

          <div>
            <select
              name="status"
              defaultValue={statusFilter}
              className="w-full py-2 px-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50 focus:bg-white"
            >
              <option value="">Semua Status</option>
              <option value="BARU">Baru (Belum Ditangani)</option>
              <option value="DIPROSES">Diproses (Pengerjaan)</option>
              <option value="SELESAI">Selesai</option>
              <option value="OVERDUE">Khusus Lewat SLA (Overdue)</option>
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
            {(statusFilter || kategoriFilter || queryFilter) && (
              <Link
                href="/pengaduan"
                className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition flex items-center justify-center"
              >
                Reset
              </Link>
            )}
          </div>
        </form>
      </div>

      {/* Tabel Tiket Pengaduan */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50/80 text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4">No. Tiket & Tanggal</th>
                <th className="py-3.5 px-4">Lokasi Unit & Pelapor</th>
                <th className="py-3.5 px-4">Kategori & Masalah</th>
                <th className="py-3.5 px-4">Tingkat & SLA</th>
                <th className="py-3.5 px-4">Status & Waktu</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pengaduanList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-medium">Tidak ada tiket pengaduan yang sesuai filter.</p>
                  </td>
                </tr>
              ) : (
                pengaduanList.map((aduan) => {
                  const overdue = isLewatBatasWaktu(aduan.batasWaktu, aduan.status === "SELESAI");
                  const sInfo = STATUS_ADUAN_LABEL[aduan.status as StatusAduan] || {
                    label: aduan.status,
                    color: "text-slate-700",
                    badgeBg: "bg-slate-100 border-slate-200",
                  };
                  const tInfo = TINGKAT_ADUAN_LABEL[aduan.tingkat as TingkatAduan] || {
                    label: aduan.tingkat,
                    badgeBg: "bg-slate-100 border-slate-200",
                    color: "text-slate-700",
                  };
                  const katLabel = KATEGORI_ADUAN_LABEL[aduan.kategori as KategoriAduan] || aduan.kategori;

                  return (
                    <tr
                      key={aduan.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        overdue ? "bg-rose-50/40" : ""
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/pengaduan/${aduan.id}`}
                          className="font-mono font-bold text-sky-800 hover:text-sky-950 block text-xs"
                        >
                          {aduan.nomorTiket}
                        </Link>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {formatTanggal(aduan.tanggalLapor)}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <Link
                          href={`/unit/${aduan.unit.id}`}
                          className="font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 inline-block text-xs"
                        >
                          Unit {aduan.unit.nomor}
                        </Link>
                        <div className="text-xs text-slate-800 font-medium mt-1">
                          {aduan.namaPelapor}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {aduan.noHp}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <span className="inline-block text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded mb-1">
                          {katLabel}
                        </span>
                        <p className="text-xs text-slate-700 line-clamp-2">
                          {aduan.uraian}
                        </p>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${tInfo.badgeBg} ${tInfo.color}`}
                        >
                          {tInfo.label}
                        </span>
                        <div className="text-[11px] text-slate-400 mt-1">
                          Batas: {formatTanggal(aduan.batasWaktu)}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${sInfo.badgeBg} ${sInfo.color}`}
                          >
                            {sInfo.label}
                          </span>
                          {overdue && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-100 border border-rose-300 px-2 py-0.5 rounded-full animate-pulse">
                              <AlertTriangle className="w-3 h-3" />
                              <span>LEWAT SLA</span>
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/pengaduan/${aduan.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 hover:text-sky-900 bg-sky-50 hover:bg-sky-100 px-2.5 py-1.5 rounded-lg border border-sky-200 transition"
                        >
                          <span>Tindak Lanjut</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
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
          baseUrl="/pengaduan"
          searchParams={{
            status: statusFilter,
            kategori: kategoriFilter,
            q: queryFilter,
          }}
        />
      </div>
    </div>
  );
}
