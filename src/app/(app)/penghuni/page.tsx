import Link from "next/link";
import db from "@/backend/db";
import {
  Users,
  Search,
  UserPlus,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  FileQuestion,
  Home,
} from "lucide-react";
import { Pagination } from "@/frontend/components/ui/Pagination";

export const dynamic = "force-dynamic";

interface PenghuniPageProps {
  searchParams: Promise<{
    q?: string;
    page?: string;
    berkas?: string;
  }>;
}

const PAGE_SIZE = 20;

export default async function PenghuniPage({ searchParams }: PenghuniPageProps) {
  const params = await searchParams;
  const q = params.q || "";
  const berkasFilter = params.berkas || "";
  const currentPage = Math.max(1, parseInt(params.page || "1", 10) || 1);

  const where: any = {};
  if (q) {
    where.OR = [
      { nama: { contains: q } },
      { nik: { contains: q } },
      { noHp: { contains: q } },
    ];
  }
  if (berkasFilter === "lengkap") {
    where.berkasLengkap = true;
  } else if (berkasFilter === "belum") {
    where.berkasLengkap = false;
  }

  const [totalFiltered, totalPenghuni, totalBerkasLengkap, totalAnggota] = await Promise.all([
    db.penghuni.count({ where }),
    db.penghuni.count(),
    db.penghuni.count({ where: { berkasLengkap: true } }),
    db.anggotaKeluarga.count(),
  ]);

  const totalPages = Math.ceil(totalFiltered / PAGE_SIZE);

  const penghuniList = await db.penghuni.findMany({
    where,
    include: {
      anggota: true,
      perjanjian: {
        where: { status: "AKTIF" },
        include: {
          unit: {
            include: { tower: true },
          },
        },
      },
    },
    orderBy: { nama: "asc" },
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-sky-700" />
            <span>Master Data Penghuni</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Data kepala keluarga penghuni rusunawa beserta anggota keluarga (Formulir RSN-01)
          </p>
        </div>

        <Link
          href="/penghuni/baru"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-700 hover:bg-sky-800 text-white font-medium text-sm rounded-xl shadow-sm transition"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Penghuni Baru</span>
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Kepala Keluarga Terdaftar
            </div>
            <div className="text-2xl font-bold text-slate-800 mt-1">{totalPenghuni}</div>
            <div className="text-xs text-slate-400 mt-0.5">Pemegang hak sewa</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-700">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Jiwa (Termasuk Keluarga)
            </div>
            <div className="text-2xl font-bold text-indigo-700 mt-1">
              {totalPenghuni + totalAnggota}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              +{totalAnggota} anggota keluarga
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700">
            <Home className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Berkas Lengkap
            </div>
            <div className="text-2xl font-bold text-emerald-700 mt-1">
              {totalBerkasLengkap}{" "}
              <span className="text-xs font-normal text-slate-400">
                ({Math.round((totalBerkasLengkap / (totalPenghuni || 1)) * 100)}%)
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">KTP, KK, & Surat Nikah</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
            <FileCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
        <form method="GET" className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Cari berdasarkan Nama Penghuni, NIK 16 digit, atau Nomor HP..."
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50 focus:bg-white"
            />
          </div>

          <div className="sm:w-48">
            <select
              name="berkas"
              defaultValue={berkasFilter}
              className="w-full py-2.5 px-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50 focus:bg-white"
            >
              <option value="">Semua Status Berkas</option>
              <option value="lengkap">Berkas Lengkap</option>
              <option value="belum">Berkas Belum Lengkap</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-sm font-medium transition shadow-sm"
            >
              Cari
            </button>
            {(q || berkasFilter) && (
              <Link
                href="/penghuni"
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition"
              >
                Reset
              </Link>
            )}
          </div>
        </form>
      </div>

      {/* Tabel Penghuni */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50/80 text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4">Nama & NIK</th>
                <th className="py-3.5 px-4">Kontak HP</th>
                <th className="py-3.5 px-4">Pekerjaan</th>
                <th className="py-3.5 px-4">Unit Dihuni</th>
                <th className="py-3.5 px-4">Anggota Kel.</th>
                <th className="py-3.5 px-4">Berkas</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {penghuniList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-medium">Tidak ada data penghuni yang ditemukan.</p>
                  </td>
                </tr>
              ) : (
                penghuniList.map((p) => {
                  const perjanjianAktif = p.perjanjian[0];
                  const unit = perjanjianAktif?.unit;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/penghuni/${p.id}`}
                          className="font-bold text-slate-900 hover:text-sky-700 block"
                        >
                          {p.nama}
                        </Link>
                        <div className="text-xs text-slate-400 font-mono mt-0.5">
                          NIK: {p.nik}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-800">
                        {p.noHp}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        {p.pekerjaan || "—"}
                      </td>
                      <td className="py-3.5 px-4">
                        {unit ? (
                          <Link
                            href={`/unit/${unit.id}`}
                            className="inline-flex items-center gap-1 font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded text-xs border border-sky-200 hover:border-sky-400"
                          >
                            <span>Unit {unit.nomor}</span>
                          </Link>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Belum menempati</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        {p.anggota.length} orang
                      </td>
                      <td className="py-3.5 px-4">
                        {p.berkasLengkap ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Lengkap</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                            <FileQuestion className="w-3 h-3" />
                            <span>Belum</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/penghuni/${p.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 hover:text-sky-900 bg-sky-50 hover:bg-sky-100 px-2.5 py-1.5 rounded-lg border border-sky-200 transition"
                        >
                          <span>Detail</span>
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
          baseUrl="/penghuni"
          searchParams={{ q, berkas: berkasFilter }}
        />
      </div>
    </div>
  );
}
