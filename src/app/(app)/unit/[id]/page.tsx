import Link from "next/link";
import { notFound } from "next/navigation";
import db from "@/backend/db";
import { formatRupiah, formatTanggal } from "@/frontend/utils/format";
import {
  STATUS_UNIT_LABEL,
  STATUS_SEWA_LABEL,
  STATUS_ADUAN_LABEL,
  TINGKAT_ADUAN_LABEL,
  KATEGORI_ADUAN_LABEL,
  StatusUnit,
  StatusSewa,
  StatusAduan,
  TingkatAduan,
  KategoriAduan,
} from "@/types";
import {
  Building2,
  ChevronLeft,
  User,
  FileText,
  AlertCircle,
  PlusCircle,
  CheckCircle2,
} from "lucide-react";
import { UnitStatusButton } from "@/frontend/components/unit/UnitStatusButton";

export const dynamic = "force-dynamic";

interface UnitDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function UnitDetailPage({ params }: UnitDetailPageProps) {
  const { id } = await params;

  const unit = await db.unit.findUnique({
    where: { id },
    include: {
      tower: true,
      perjanjian: {
        include: {
          penghuni: true,
        },
        orderBy: [{ status: "asc" }, { id: "desc" }],
      },
      pengaduan: {
        orderBy: { tanggalLapor: "desc" },
      },
    },
  });

  if (!unit) {
    notFound();
  }

  const statusInfo = STATUS_UNIT_LABEL[unit.status as StatusUnit] || {
    label: unit.status,
    color: "text-slate-700",
    badgeBg: "bg-slate-50 border-slate-200",
  };

  const perjanjianAktif = unit.perjanjian.find((p) => p.status === "AKTIF");
  const penghuniAktif = perjanjianAktif?.penghuni;

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Header */}
      <div>
        <Link
          href="/unit"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:text-sky-900 mb-2 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Kembali ke Master Unit</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                Unit {unit.nomor}
              </h1>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${statusInfo.badgeBg} ${statusInfo.color}`}
              >
                {statusInfo.label}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              {unit.tower.nama} • Lantai {unit.lantai} • {unit.tipe}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            <UnitStatusButton
              unitId={unit.id}
              currentStatus={unit.status}
              isOccupied={!!perjanjianAktif}
            />

            {unit.status === "KOSONG" && (
              <Link
                href={`/perjanjian/baru?unitId=${unit.id}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-sky-700 hover:bg-sky-800 text-white text-xs font-semibold rounded-lg shadow-sm transition"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Buat Perjanjian Sewa</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Grid Informasi Utama */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Spesifikasi Unit */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building2 className="w-4 h-4 text-sky-700" />
            <span>Spesifikasi Unit Hunian</span>
          </h2>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-xs text-slate-400">Gedung / Tower</div>
              <div className="font-semibold text-slate-800 mt-0.5">{unit.tower.nama}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Lantai</div>
              <div className="font-semibold text-slate-800 mt-0.5">Lantai {unit.lantai}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Tipe Unit</div>
              <div className="font-semibold text-slate-800 mt-0.5">{unit.tipe}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Luas Bangunan</div>
              <div className="font-semibold text-slate-800 mt-0.5">{unit.luas} m²</div>
            </div>
            <div className="col-span-2 pt-2 border-t border-slate-100">
              <div className="text-xs text-slate-400">Tarif Retribusi Sewa Per Bulan</div>
              <div className="text-2xl font-bold text-sky-800 font-mono mt-0.5">
                {formatRupiah(unit.tarifSewa)}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Sesuai Keputusan Tarif Retribusi Pemda Kabupaten Purwakarta
              </div>
            </div>
          </div>
        </div>

        {/* Penghuni Aktif */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
            <User className="w-4 h-4 text-blue-600" />
            <span>Penghuni Saat Ini</span>
          </h2>

          {penghuniAktif && perjanjianAktif ? (
            <div className="space-y-3.5 text-sm">
              <div className="flex items-start justify-between">
                <div>
                  <Link
                    href={`/penghuni/${penghuniAktif.id}`}
                    className="text-lg font-bold text-slate-900 hover:text-sky-700 transition"
                  >
                    {penghuniAktif.nama}
                  </Link>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">
                    NIK: {penghuniAktif.nik}
                  </div>
                </div>
                <Link
                  href={`/penghuni/${penghuniAktif.id}`}
                  className="text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 px-2.5 py-1 rounded-md border border-sky-200"
                >
                  Lihat Profil
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block">Nomor HP / WhatsApp:</span>
                  <span className="font-semibold text-slate-800 font-mono">{penghuniAktif.noHp}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Nomor Perjanjian:</span>
                  <span className="font-semibold text-slate-800 font-mono">{perjanjianAktif.nomor}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Masa Sewa:</span>
                  <span className="font-medium text-slate-800">
                    {formatTanggal(perjanjianAktif.tanggalMulai)} s/d {formatTanggal(perjanjianAktif.tanggalBerakhir)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Tarif Disepakati:</span>
                  <span className="font-semibold text-slate-800 font-mono">
                    {formatRupiah(perjanjianAktif.tarifBulanan)}/bln
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 space-y-2">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500/60" />
              <p className="text-sm font-medium text-slate-600">Unit saat ini tidak sedang dihuni.</p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Unit berstatus {unit.status.toLowerCase()} dan siap dialokasikan untuk pemohon baru.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Riwayat Perjanjian Sewa */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-sky-700" />
            <span>Riwayat Perjanjian Sewa ({unit.perjanjian.length})</span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50/80 text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Nomor Perjanjian</th>
                <th className="py-3 px-4">Nama Penghuni</th>
                <th className="py-3 px-4">Periode Sewa</th>
                <th className="py-3 px-4">Tarif Bulanan</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {unit.perjanjian.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                    Belum ada riwayat perjanjian sewa untuk unit ini.
                  </td>
                </tr>
              ) : (
                unit.perjanjian.map((p) => {
                  const sInfo = STATUS_SEWA_LABEL[p.status as StatusSewa] || {
                    label: p.status,
                    color: "text-slate-700",
                    badgeBg: "bg-slate-100 border-slate-200",
                  };
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-mono font-medium text-slate-800">{p.nomor}</td>
                      <td className="py-3 px-4">
                        <Link
                          href={`/penghuni/${p.penghuni.id}`}
                          className="font-medium text-sky-700 hover:underline"
                        >
                          {p.penghuni.nama}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-xs">
                        {formatTanggal(p.tanggalMulai)} — {formatTanggal(p.tanggalBerakhir)}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs">{formatRupiah(p.tarifBulanan)}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${sInfo.badgeBg} ${sInfo.color}`}
                        >
                          {sInfo.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Riwayat Pengaduan di Unit Ini */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>Riwayat Pengaduan Unit ({unit.pengaduan.length})</span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50/80 text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">No. Tiket</th>
                <th className="py-3 px-4">Kategori & Tingkat</th>
                <th className="py-3 px-4">Uraian Masalah</th>
                <th className="py-3 px-4">Tanggal Lapor</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {unit.pengaduan.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-slate-400">
                    Tidak ada catatan riwayat pengaduan di unit ini.
                  </td>
                </tr>
              ) : (
                unit.pengaduan.map((aduan) => {
                  const stInfo = STATUS_ADUAN_LABEL[aduan.status as StatusAduan] || {
                    label: aduan.status,
                    color: "text-slate-700",
                    badgeBg: "bg-slate-100 border-slate-200",
                  };
                  const katLabel = KATEGORI_ADUAN_LABEL[aduan.kategori as KategoriAduan] || aduan.kategori;

                  return (
                    <tr key={aduan.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800 text-xs">
                        {aduan.nomorTiket}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800 text-xs">{katLabel}</div>
                        <div className="text-[11px] text-slate-400">{aduan.tingkat}</div>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600 max-w-xs truncate">
                        {aduan.uraian}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-500">
                        {formatTanggal(aduan.tanggalLapor)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${stInfo.badgeBg} ${stInfo.color}`}
                        >
                          {stInfo.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/pengaduan/${aduan.id}`}
                          className="text-xs font-semibold text-sky-700 hover:underline"
                        >
                          Tinjau
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
