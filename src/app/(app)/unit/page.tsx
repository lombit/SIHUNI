import Link from "next/link";
import db from "@/backend/db";
import { formatRupiah } from "@/frontend/utils/format";
import { STATUS_UNIT_LABEL, StatusUnit } from "@/types";
import {
  Building2,
  Search,
  Filter,
  CheckCircle2,
  Home,
  Wrench,
  ChevronRight,
  LayoutGrid,
  Table as TableIcon,
  User,
  PlusCircle,
} from "lucide-react";
import { Pagination } from "@/frontend/components/ui/Pagination";

export const dynamic = "force-dynamic";

interface UnitPageProps {
  searchParams: Promise<{
    tower?: string;
    lantai?: string;
    status?: string;
    q?: string;
    tampilan?: string;
    page?: string;
  }>;
}

const PAGE_SIZE = 25;

export default async function UnitPage({ searchParams }: UnitPageProps) {
  const params = await searchParams;
  const towerFilter = params.tower || "";
  const lantaiFilter = params.lantai ? parseInt(params.lantai, 10) : undefined;
  const statusFilter = params.status || "";
  const queryFilter = params.q || "";
  const tampilan = params.tampilan === "denah" ? "denah" : "tabel";
  const currentPage = Math.max(1, parseInt(params.page || "1", 10) || 1);

  const where: any = {};
  if (towerFilter) {
    where.tower = { nama: towerFilter };
  }
  if (lantaiFilter && !isNaN(lantaiFilter)) {
    where.lantai = lantaiFilter;
  }
  if (statusFilter) {
    where.status = statusFilter;
  }
  if (queryFilter) {
    where.nomor = { contains: queryFilter };
  }

  // Hitung total data untuk pagination
  const [totalFilteredUnits, totalUnit, totalDihuni, totalKosong, totalPerbaikan] =
    await Promise.all([
      db.unit.count({ where }),
      db.unit.count(),
      db.unit.count({ where: { status: "DIHUNI" } }),
      db.unit.count({ where: { status: "KOSONG" } }),
      db.unit.count({ where: { status: "PERBAIKAN" } }),
    ]);

  const totalPages = Math.ceil(totalFilteredUnits / PAGE_SIZE);

  // Ambil data unit (jika tampilan denah, ambil semua filtered; jika tabel, ambil paginated)
  const units = await db.unit.findMany({
    where,
    include: {
      tower: true,
      perjanjian: {
        where: { status: "AKTIF" },
        include: { penghuni: true },
      },
    },
    orderBy: [{ tower: { nama: "asc" } }, { lantai: "asc" }, { nomor: "asc" }],
    ...(tampilan === "tabel"
      ? {
          skip: (currentPage - 1) * PAGE_SIZE,
          take: PAGE_SIZE,
        }
      : {}),
  });

  const persentaseOkupansi = Math.round((totalDihuni / (totalUnit || 1)) * 100);

  // Untuk tampilan denah: kelompokkan berdasarkan Tower lalu Lantai
  const denahGrouped: Record<string, Record<number, typeof units>> = {};
  if (tampilan === "denah") {
    for (const u of units) {
      const towerNama = u.tower.nama;
      if (!denahGrouped[towerNama]) denahGrouped[towerNama] = {};
      if (!denahGrouped[towerNama][u.lantai]) denahGrouped[towerNama][u.lantai] = [];
      denahGrouped[towerNama][u.lantai].push(u);
    }
  }

  // Helper create toggle URL
  const getToggleUrl = (targetTampilan: string) => {
    const p = new URLSearchParams();
    if (towerFilter) p.set("tower", towerFilter);
    if (lantaiFilter) p.set("lantai", String(lantaiFilter));
    if (statusFilter) p.set("status", statusFilter);
    if (queryFilter) p.set("q", queryFilter);
    p.set("tampilan", targetTampilan);
    return `/unit?${p.toString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Header & Switch Tampilan */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Building2 className="w-7 h-7 text-sky-700" />
            <span>Master Data Unit Hunian</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Katalog 200 unit hunian Rusunawa Tower A dan Tower B beserta status okupansi
          </p>
        </div>

        {/* Tombol Toggle Tampilan (Tabel vs Denah Visual) */}
        <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-sm self-start sm:self-auto">
          <Link
            href={getToggleUrl("tabel")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              tampilan === "tabel"
                ? "bg-sky-700 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Tabel Detail</span>
          </Link>
          <Link
            href={getToggleUrl("denah")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              tampilan === "denah"
                ? "bg-sky-700 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Denah Visual</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Unit</div>
          <div className="text-2xl font-bold text-slate-800 mt-1">{totalUnit}</div>
          <div className="text-xs text-slate-400 mt-0.5">2 Tower &bull; 5 Lantai</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
            <Home className="w-3.5 h-3.5" />
            <span>Dihuni</span>
          </div>
          <div className="text-2xl font-bold text-blue-700 mt-1">{totalDihuni}</div>
          <div className="text-xs text-blue-600/80 mt-0.5">{persentaseOkupansi}% terisi</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Kosong / Siap</span>
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{totalKosong}</div>
          <div className="text-xs text-emerald-600/80 mt-0.5">Tersedia disewa</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="text-xs font-semibold text-amber-600 uppercase tracking-wider flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5" />
            <span>Perbaikan</span>
          </div>
          <div className="text-2xl font-bold text-amber-700 mt-1">{totalPerbaikan}</div>
          <div className="text-xs text-amber-600/80 mt-0.5">Dalam pemeliharaan</div>
        </div>

        <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-sky-700 to-indigo-800 p-4 rounded-xl text-white shadow-sm flex flex-col justify-between">
          <div className="text-xs font-medium text-sky-200 uppercase tracking-wider">Tingkat Okupansi</div>
          <div className="text-2xl font-bold mt-1">{persentaseOkupansi}%</div>
          <div className="w-full bg-white/20 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-emerald-400 h-full rounded-full transition-all"
              style={{ width: `${persentaseOkupansi}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
        <form method="GET" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <input type="hidden" name="tampilan" value={tampilan} />

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              name="q"
              defaultValue={queryFilter}
              placeholder="Cari nomor (mis: A-301)..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50 focus:bg-white"
            />
          </div>

          <div>
            <select
              name="tower"
              defaultValue={towerFilter}
              className="w-full py-2 px-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50 focus:bg-white"
            >
              <option value="">Semua Tower</option>
              <option value="Tower A">Tower A</option>
              <option value="Tower B">Tower B</option>
            </select>
          </div>

          <div>
            <select
              name="lantai"
              defaultValue={lantaiFilter ? String(lantaiFilter) : ""}
              className="w-full py-2 px-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50 focus:bg-white"
            >
              <option value="">Semua Lantai</option>
              <option value="1">Lantai 1</option>
              <option value="2">Lantai 2</option>
              <option value="3">Lantai 3</option>
              <option value="4">Lantai 4</option>
              <option value="5">Lantai 5</option>
            </select>
          </div>

          <div>
            <select
              name="status"
              defaultValue={statusFilter}
              className="w-full py-2 px-3 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50 focus:bg-white"
            >
              <option value="">Semua Status</option>
              <option value="KOSONG">Kosong (Tersedia)</option>
              <option value="DIHUNI">Dihuni</option>
              <option value="PERBAIKAN">Perbaikan</option>
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
              href={`/unit?tampilan=${tampilan}`}
              className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition flex items-center justify-center"
            >
              Reset
            </Link>
          </div>
        </form>
      </div>

      {/* TAMPILAN 1: DENAH VISUAL (GRID VIEW) */}
      {tampilan === "denah" && (
        <div className="space-y-6">
          {Object.keys(denahGrouped).length === 0 ? (
            <div className="bg-white p-12 rounded-xl border border-slate-200 text-center text-slate-400">
              <Building2 className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-medium">Tidak ada unit hunian yang cocok dengan filter saat ini.</p>
            </div>
          ) : (
            Object.entries(denahGrouped).map(([towerNama, perLantai]) => (
              <div key={towerNama} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
                      {towerNama.includes("A") ? "A" : "B"}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">{towerNama}</h2>
                      <p className="text-xs text-slate-500">
                        {towerNama === "Tower A" ? "Gedung Blok Barat" : "Gedung Blok Timur"} &bull; 100 Unit Hunian
                      </p>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="hidden sm:flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1 text-slate-600">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Dihuni
                    </span>
                    <span className="flex items-center gap-1 text-slate-600">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Kosong
                    </span>
                    <span className="flex items-center gap-1 text-slate-600">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Perbaikan
                    </span>
                  </div>
                </div>

                <div className="space-y-5">
                  {Object.entries(perLantai)
                    .sort(([a], [b]) => Number(b) - Number(a)) // Lantai 5 paling atas
                    .map(([lantaiNum, unitList]) => (
                      <div key={lantaiNum} className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider px-1">
                          <span>Lantai {lantaiNum}</span>
                          <span className="text-[11px] font-normal normal-case text-slate-400">
                            Tarif: {formatRupiah(unitList[0]?.tarifSewa || 0)} / bulan
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-2">
                          {unitList.map((u) => {
                            const isDihuni = u.status === "DIHUNI";
                            const isPerbaikan = u.status === "PERBAIKAN";
                            const penghuni = u.perjanjian[0]?.penghuni;

                            return (
                              <Link
                                key={u.id}
                                href={`/unit/${u.id}`}
                                title={`Unit ${u.nomor} - ${u.status}${penghuni ? ` (${penghuni.nama})` : ""}`}
                                className={`p-2.5 rounded-xl border text-center transition-all hover:scale-105 shadow-xs flex flex-col justify-between min-h-[72px] ${
                                  isDihuni
                                    ? "bg-blue-50/70 border-blue-200 hover:border-blue-400 text-blue-950"
                                    : isPerbaikan
                                    ? "bg-amber-50/80 border-amber-200 hover:border-amber-400 text-amber-950"
                                    : "bg-emerald-50/80 border-emerald-200 hover:border-emerald-400 text-emerald-950"
                                }`}
                              >
                                <div>
                                  <div className="font-mono font-bold text-xs tracking-tight">
                                    {u.nomor}
                                  </div>
                                  <div className="text-[10px] truncate mt-0.5 opacity-80">
                                    {penghuni ? penghuni.nama : u.status}
                                  </div>
                                </div>

                                <div className="mt-1">
                                  <span
                                    className={`inline-block w-2 h-2 rounded-full ${
                                      isDihuni
                                        ? "bg-blue-500"
                                        : isPerbaikan
                                        ? "bg-amber-500"
                                        : "bg-emerald-500"
                                    }`}
                                  />
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAMPILAN 2: TABEL DETAIL (TABLE VIEW DENGAN PAGINATION) */}
      {tampilan === "tabel" && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50/80 text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">Nomor Unit</th>
                  <th className="py-3.5 px-4">Tower & Lantai</th>
                  <th className="py-3.5 px-4">Tipe & Luas</th>
                  <th className="py-3.5 px-4">Tarif Retribusi</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Penghuni Aktif</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {units.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <Building2 className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      <p className="text-sm font-medium">Tidak ada data unit yang sesuai kriteria.</p>
                    </td>
                  </tr>
                ) : (
                  units.map((unit) => {
                    const statusInfo = STATUS_UNIT_LABEL[unit.status as StatusUnit] || {
                      label: unit.status,
                      color: "text-slate-700",
                      badgeBg: "bg-slate-100 border-slate-200",
                    };
                    const penghuniAktif = unit.perjanjian[0]?.penghuni;

                    return (
                      <tr key={unit.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-sky-800 text-sm">
                          <Link href={`/unit/${unit.id}`} className="hover:underline">
                            {unit.nomor}
                          </Link>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-800 text-xs">{unit.tower.nama}</div>
                          <div className="text-slate-400 text-[11px]">Lantai {unit.lantai}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-xs text-slate-700">Tipe {unit.tipe}</span>
                          <span className="text-slate-400 text-xs ml-1">({unit.luas} m²)</span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-medium text-slate-900 text-xs">
                          {formatRupiah(unit.tarifSewa)}
                          <span className="text-slate-400 text-[11px] font-sans"> /bln</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusInfo.badgeBg} ${statusInfo.color}`}
                          >
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {penghuniAktif ? (
                            <Link
                              href={`/penghuni/${penghuniAktif.id}`}
                              className="text-xs font-medium text-slate-800 hover:text-sky-700 hover:underline flex items-center gap-1.5"
                            >
                              <User className="w-3.5 h-3.5 text-slate-400" />
                              <span>{penghuniAktif.nama}</span>
                            </Link>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Tidak ada</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {unit.status === "KOSONG" && (
                              <Link
                                href={`/perjanjian/baru?unitId=${unit.id}`}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg border border-emerald-200 transition shadow-xs"
                              >
                                <PlusCircle className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Sewa</span>
                              </Link>
                            )}
                            <Link
                              href={`/unit/${unit.id}`}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 hover:text-sky-900 bg-sky-50 hover:bg-sky-100 px-2.5 py-1.5 rounded-lg border border-sky-200 transition shadow-xs"
                            >
                              <span>Detail</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalFilteredUnits}
            pageSize={PAGE_SIZE}
            baseUrl="/unit"
            searchParams={{
              tower: towerFilter,
              lantai: lantaiFilter,
              status: statusFilter,
              q: queryFilter,
              tampilan,
            }}
          />
        </div>
      )}
    </div>
  );
}
