import Link from "next/link";
import { redirect } from "next/navigation";
import db from "@/backend/db";
import { getCurrentUser } from "@/backend/session";
import { formatTanggalWaktu } from "@/frontend/utils/format";
import {
  History,
  ShieldAlert,
  Search,
  Filter,
  Layers,
  Clock,
  User,
} from "lucide-react";
import { AuditDetailModal } from "@/frontend/components/audit/AuditDetailModal";
import { Pagination } from "@/frontend/components/ui/Pagination";

export const dynamic = "force-dynamic";

interface LogPageProps {
  searchParams: Promise<{
    entitas?: string;
    aksi?: string;
    page?: string;
  }>;
}

const PAGE_SIZE = 25;

export default async function LogAuditPage({ searchParams }: LogPageProps) {
  const user = await getCurrentUser();

  // Validasi Hak Akses Khusus ADMIN
  if (!user || user.peran !== "ADMIN") {
    redirect("/");
  }

  const params = await searchParams;
  const entitasFilter = params.entitas || "";
  const aksiFilter = params.aksi || "";
  const currentPage = Math.max(1, parseInt(params.page || "1", 10) || 1);

  const where: any = {};
  if (entitasFilter) {
    where.entitas = entitasFilter;
  }
  if (aksiFilter) {
    where.aksi = aksiFilter;
  }

  const [totalFiltered, totalLogs, logs] = await Promise.all([
    db.logAudit.count({ where }),
    db.logAudit.count(),
    db.logAudit.findMany({
      where,
      orderBy: { waktu: "desc" },
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  const totalPages = Math.ceil(totalFiltered / PAGE_SIZE);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-amber-800 text-xs font-semibold mb-2">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
          <span>Akses Terbatas — Khusus Administrator Sistem</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
          <History className="w-7 h-7 text-sky-700" />
          <span>Log Jejak Audit (Audit Trail)</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Rekaman permanen seluruh operasi tulis (tambah, ubah, hapus) data pada sistem SIHUNI untuk akuntabilitas
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
        <form method="GET" className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <select
              name="entitas"
              defaultValue={entitasFilter}
              className="w-full py-2 px-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50 focus:bg-white"
            >
              <option value="">Semua Entitas</option>
              <option value="Penghuni">Penghuni</option>
              <option value="PerjanjianSewa">Perjanjian Sewa</option>
              <option value="Tagihan">Tagihan</option>
              <option value="Pembayaran">Pembayaran</option>
              <option value="Pengaduan">Pengaduan</option>
              <option value="Unit">Unit Hunian</option>
              <option value="User">User</option>
            </select>
          </div>

          <div>
            <select
              name="aksi"
              defaultValue={aksiFilter}
              className="w-full py-2 px-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50 focus:bg-white"
            >
              <option value="">Semua Aksi</option>
              <option value="BUAT">BUAT (Penambahan Data)</option>
              <option value="UBAH">UBAH (Pembaruan Data)</option>
              <option value="HAPUS">HAPUS (Penghapusan Data)</option>
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
            {(entitasFilter || aksiFilter) && (
              <Link
                href="/pengaturan/log"
                className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition flex items-center justify-center"
              >
                Reset
              </Link>
            )}
          </div>
        </form>
      </div>

      {/* Tabel Log Audit */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50/80 text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Waktu Kejadian</th>
                <th className="py-3 px-4">Entitas & Aksi</th>
                <th className="py-3 px-4">ID Entitas</th>
                <th className="py-3 px-4">Pelaksana (User ID)</th>
                <th className="py-3 px-4 text-right">Rincian Perubahan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-xs">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 font-sans">
                    <History className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-medium">Belum ada riwayat audit yang cocok dengan filter.</p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const badgeAksi =
                    log.aksi === "BUAT"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : log.aksi === "UBAH"
                      ? "bg-sky-50 text-sky-700 border-sky-200"
                      : "bg-rose-50 text-rose-700 border-rose-200";

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-sans text-slate-600">
                        {formatTanggalWaktu(log.waktu)}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 font-sans">
                            {log.entitas}
                          </span>
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${badgeAksi}`}
                          >
                            {log.aksi}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 max-w-[140px] truncate">
                        {log.entitasId}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {log.userId}
                      </td>
                      <td className="py-3.5 px-4 text-right font-sans">
                        <AuditDetailModal log={log} />
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
          baseUrl="/pengaturan/log"
          searchParams={{ entitas: entitasFilter, aksi: aksiFilter }}
        />
      </div>
    </div>
  );
}
