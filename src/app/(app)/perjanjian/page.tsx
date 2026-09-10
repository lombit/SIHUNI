import Link from "next/link";
import db from "@/backend/db";
import { formatRupiah, formatTanggal } from "@/frontend/utils/format";
import { STATUS_SEWA_LABEL, StatusSewa } from "@/types";
import {
  FileText,
  PlusCircle,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  ChevronRight,
  Home,
  Printer,
} from "lucide-react";
import { AkhiriPerjanjianButton } from "@/frontend/components/perjanjian/AkhiriPerjanjianButton";
import { Pagination } from "@/frontend/components/ui/Pagination";

export const dynamic = "force-dynamic";

interface PerjanjianPageProps {
  searchParams: Promise<{
    status?: string;
    q?: string;
    page?: string;
  }>;
}

const PAGE_SIZE = 20;

export default async function PerjanjianPage({ searchParams }: PerjanjianPageProps) {
  const params = await searchParams;
  const statusFilter = params.status || "";
  const queryFilter = params.q || "";
  const currentPage = Math.max(1, parseInt(params.page || "1", 10) || 1);

  const where: any = {};
  if (statusFilter) {
    where.status = statusFilter;
  }
  if (queryFilter) {
    where.OR = [
      { nomor: { contains: queryFilter } },
      { penghuni: { nama: { contains: queryFilter } } },
      { unit: { nomor: { contains: queryFilter } } },
    ];
  }

  const [totalFiltered, totalAktif, totalBerakhir, totalSemua, perjanjianList] =
    await Promise.all([
      db.perjanjianSewa.count({ where }),
      db.perjanjianSewa.count({ where: { status: "AKTIF" } }),
      db.perjanjianSewa.count({ where: { status: "BERAKHIR" } }),
      db.perjanjianSewa.count(),
      db.perjanjianSewa.findMany({
        where,
        include: {
          unit: { include: { tower: true } },
          penghuni: true,
        },
        orderBy: [{ status: "asc" }, { id: "desc" }],
        skip: (currentPage - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
    ]);

  const totalPages = Math.ceil(totalFiltered / PAGE_SIZE);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <FileText className="w-7 h-7 text-sky-700" />
            <span>Perjanjian Sewa Rusunawa</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Daftar Surat Perjanjian Sewa (SPS) yang mengikat penghuni ke unit hunian
          </p>
        </div>

        <Link
          href="/perjanjian/baru"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-700 hover:bg-sky-800 text-white font-medium text-sm rounded-xl shadow-sm transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Buat Perjanjian Baru</span>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Seluruh Dokumen SPS
          </div>
          <div className="text-2xl font-bold text-slate-800 mt-1">{totalSemua}</div>
          <div className="text-xs text-slate-400 mt-0.5">Sepanjang operasional</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Perjanjian Aktif</span>
          </div>
          <div className="text-2xl font-bold text-blue-700 mt-1">{totalAktif}</div>
          <div className="text-xs text-blue-600/80 mt-0.5">Penghuni aktif saat ini</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Perjanjian Berakhir / Selesai
          </div>
          <div className="text-2xl font-bold text-slate-700 mt-1">{totalBerakhir}</div>
          <div className="text-xs text-slate-400 mt-0.5">Arsip riwayat sewa</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
        <form method="GET" className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              name="q"
              defaultValue={queryFilter}
              placeholder="Cari nomor SPS, nama penghuni, atau unit..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50 focus:bg-white"
            />
          </div>

          <div className="sm:w-48">
            <select
              name="status"
              defaultValue={statusFilter}
              className="w-full py-2 px-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50 focus:bg-white"
            >
              <option value="">Semua Status</option>
              <option value="AKTIF">Hanya Aktif</option>
              <option value="BERAKHIR">Hanya Berakhir</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="px-5 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-sm font-medium transition shadow-sm flex items-center gap-1.5"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Saring</span>
            </button>
            {(statusFilter || queryFilter) && (
              <Link
                href="/perjanjian"
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition"
              >
                Reset
              </Link>
            )}
          </div>
        </form>
      </div>

      {/* Tabel Perjanjian */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50/80 text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4">Nomor Perjanjian</th>
                <th className="py-3.5 px-4">Unit Hunian</th>
                <th className="py-3.5 px-4">Penghuni / Penyewa</th>
                <th className="py-3.5 px-4">Periode Masa Sewa</th>
                <th className="py-3.5 px-4">Tarif Bulanan</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {perjanjianList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-medium">Tidak ada perjanjian sewa yang ditemukan.</p>
                  </td>
                </tr>
              ) : (
                perjanjianList.map((p) => {
                  const sInfo = STATUS_SEWA_LABEL[p.status as StatusSewa] || {
                    label: p.status,
                    color: "text-slate-700",
                    badgeBg: "bg-slate-100 border-slate-200",
                  };

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-xs">
                        {p.nomor}
                      </td>
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/unit/${p.unit.id}`}
                          className="font-mono font-bold text-sky-700 hover:text-sky-900 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 inline-block text-xs"
                        >
                          {p.unit.nomor}
                        </Link>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {p.unit.tower.nama} Lt. {p.unit.lantai}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/penghuni/${p.penghuni.id}`}
                          className="font-semibold text-slate-800 hover:text-sky-700 block"
                        >
                          {p.penghuni.nama}
                        </Link>
                        <div className="text-xs text-slate-400 font-mono">
                          {p.penghuni.noHp}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        <div className="font-medium text-slate-800">
                          {formatTanggal(p.tanggalMulai)}
                        </div>
                        <div className="text-slate-400">
                          s/d {formatTanggal(p.tanggalBerakhir)}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs font-semibold text-slate-900">
                        {formatRupiah(p.tarifBulanan)}
                        <span className="font-sans font-normal text-slate-400 text-[10px] ml-1">/bln</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${sInfo.badgeBg} ${sInfo.color}`}
                        >
                          {sInfo.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/perjanjian/${p.id}/cetak`}
                            title="Cetak Naskah Surat Perjanjian Sewa (RSN-02)"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 px-2.5 py-1.5 rounded-lg border border-sky-200 transition shadow-xs"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Cetak SPS</span>
                          </Link>

                          {p.status === "AKTIF" && (
                            <AkhiriPerjanjianButton
                              perjanjianId={p.id}
                              nomorPerjanjian={p.nomor}
                              unitNomor={p.unit.nomor}
                            />
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
          baseUrl="/perjanjian"
          searchParams={{ status: statusFilter, q: queryFilter }}
        />
      </div>
    </div>
  );
}
