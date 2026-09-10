import Link from "next/link";
import { notFound } from "next/navigation";
import db from "@/backend/db";
import { formatRupiah, formatTanggal } from "@/frontend/utils/format";
import { STATUS_SEWA_LABEL, StatusSewa } from "@/types";
import {
  User,
  ChevronLeft,
  Edit3,
  Phone,
  Home,
  CheckCircle2,
  FileQuestion,
  CreditCard,
  Building,
  Calendar,
  Briefcase,
  MapPin,
  FileText,
} from "lucide-react";
import { HapusPenghuniButton } from "@/frontend/components/penghuni/HapusPenghuniButton";

export const dynamic = "force-dynamic";

interface PenghuniDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PenghuniDetailPage({ params }: PenghuniDetailPageProps) {
  const { id } = await params;

  const penghuni = await db.penghuni.findUnique({
    where: { id },
    include: {
      anggota: true,
      perjanjian: {
        include: {
          unit: {
            include: { tower: true },
          },
        },
        orderBy: [{ status: "asc" }, { id: "desc" }],
      },
    },
  });

  if (!penghuni) {
    notFound();
  }

  const perjanjianAktif = penghuni.perjanjian.find((p) => p.status === "AKTIF");
  const unitAktif = perjanjianAktif?.unit;

  return (
    <div className="space-y-6">
      {/* Breadcrumbs & Header */}
      <div>
        <Link
          href="/penghuni"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:text-sky-900 mb-2 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Kembali ke Master Penghuni</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {penghuni.nama}
              </h1>
              {penghuni.berkasLengkap ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Berkas Lengkap</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                  <FileQuestion className="w-3.5 h-3.5" />
                  <span>Berkas Belum Lengkap</span>
                </span>
              )}
            </div>
            <p className="text-sm font-mono text-slate-500 mt-1">
              NIK: {penghuni.nik} • No. KK: {penghuni.nomorKk || "—"}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href={`/penghuni/${penghuni.id}/ubah`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg border border-sky-200 transition"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Ubah Biodata</span>
            </Link>

            <HapusPenghuniButton
              penghuniId={penghuni.id}
              nama={penghuni.nama}
              hasActiveLease={!!perjanjianAktif}
            />
          </div>
        </div>
      </div>

      {/* Grid Informasi Utama */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Kolom 1 & 2: Biodata & Kontak */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
              <User className="w-4 h-4 text-sky-700" />
              <span>Biodata Kepala Keluarga (RSN-01)</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs text-slate-400 block">Tempat & Tanggal Lahir</span>
                <span className="font-medium text-slate-800">
                  {penghuni.tempatLahir || "—"}, {formatTanggal(penghuni.tanggalLahir)}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Jenis Kelamin</span>
                <span className="font-medium text-slate-800">
                  {penghuni.jenisKelamin === "L" ? "Laki-Laki" : penghuni.jenisKelamin === "P" ? "Perempuan" : "—"}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Status Perkawinan</span>
                <span className="font-medium text-slate-800">{penghuni.statusKawin || "—"}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Pekerjaan</span>
                <span className="font-medium text-slate-800">{penghuni.pekerjaan || "—"}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Estimasi Penghasilan Bulanan</span>
                <span className="font-mono font-medium text-slate-800">
                  {penghuni.penghasilan ? formatRupiah(penghuni.penghasilan) : "—"}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Nomor HP / WhatsApp</span>
                <span className="font-mono font-bold text-sky-800">{penghuni.noHp}</span>
              </div>
              <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                <span className="text-xs text-slate-400 block">Alamat Sesuai KTP</span>
                <span className="text-slate-700 mt-0.5 block">{penghuni.alamatKtp || "—"}</span>
              </div>
            </div>
          </div>

          {/* Tabel Anggota Keluarga */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-indigo-600" />
                <span>Susunan Anggota Keluarga ({penghuni.anggota.length})</span>
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50/80 text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Nama Anggota</th>
                    <th className="py-3 px-4">Hubungan</th>
                    <th className="py-3 px-4">Usia</th>
                    <th className="py-3 px-4">NIK</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {penghuni.anggota.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-xs text-slate-400">
                        Tidak ada anggota keluarga yang terdaftar.
                      </td>
                    </tr>
                  ) : (
                    penghuni.anggota.map((ang) => (
                      <tr key={ang.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 font-medium text-slate-800">{ang.nama}</td>
                        <td className="py-3 px-4 text-xs text-slate-600">
                          <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                            {ang.hubungan}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-600">
                          {ang.usia ? `${ang.usia} tahun` : "—"}
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-slate-500">
                          {ang.nik || "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Kolom 3: Status Hunian & Perjanjian Aktif */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
              <Building className="w-4 h-4 text-sky-700" />
              <span>Unit Hunian Saat Ini</span>
            </h2>

            {unitAktif && perjanjianAktif ? (
              <div className="space-y-3">
                <div className="p-3 bg-sky-50 rounded-xl border border-sky-200 text-center">
                  <div className="text-xs text-sky-600 font-semibold uppercase tracking-wider">
                    {unitAktif.tower.nama} • Lantai {unitAktif.lantai}
                  </div>
                  <Link
                    href={`/unit/${unitAktif.id}`}
                    className="text-3xl font-extrabold font-mono text-sky-900 hover:underline block my-1"
                  >
                    Unit {unitAktif.nomor}
                  </Link>
                  <div className="text-xs text-sky-700 font-medium">
                    {unitAktif.tipe} ({unitAktif.luas} m²)
                  </div>
                </div>

                <div className="text-xs space-y-2 pt-2 text-slate-600">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400">Nomor Perjanjian:</span>
                    <span className="font-mono font-semibold text-slate-800">{perjanjianAktif.nomor}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400">Mulai Sewa:</span>
                    <span className="font-medium text-slate-800">
                      {formatTanggal(perjanjianAktif.tanggalMulai)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400">Berakhir:</span>
                    <span className="font-medium text-slate-800">
                      {formatTanggal(perjanjianAktif.tanggalBerakhir)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Tarif Bulanan:</span>
                    <span className="font-mono font-bold text-sky-800">
                      {formatRupiah(perjanjianAktif.tarifBulanan)}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/unit/${unitAktif.id}`}
                  className="w-full mt-2 py-2 px-3 text-xs font-semibold text-sky-700 hover:text-sky-900 bg-white border border-sky-200 rounded-lg transition flex items-center justify-center gap-1"
                >
                  <span>Buka Lembar Unit</span>
                </Link>
              </div>
            ) : (
              <div className="py-6 text-center text-slate-400 space-y-2">
                <Home className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs text-slate-500">Penghuni saat ini belum menempati unit.</p>
                <Link
                  href="/perjanjian/baru"
                  className="inline-block mt-2 px-3 py-1.5 bg-sky-700 hover:bg-sky-800 text-white rounded-lg text-xs font-medium transition"
                >
                  Buat Perjanjian Sewa
                </Link>
              </div>
            )}
          </div>

          {/* Histori Perjanjian Sewa */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Riwayat Sewa ({penghuni.perjanjian.length})
            </h3>
            <div className="space-y-2.5">
              {penghuni.perjanjian.map((p) => {
                const sInfo = STATUS_SEWA_LABEL[p.status as StatusSewa] || {
                  label: p.status,
                  color: "text-slate-700",
                  badgeBg: "bg-slate-100 border-slate-200",
                };

                return (
                  <div
                    key={p.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-800">{p.nomor}</span>
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${sInfo.badgeBg} ${sInfo.color}`}
                      >
                        {sInfo.label}
                      </span>
                    </div>
                    <div className="text-slate-600">
                      Unit {p.unit.nomor} • {formatTanggal(p.tanggalMulai)} s/d {formatTanggal(p.tanggalBerakhir)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
