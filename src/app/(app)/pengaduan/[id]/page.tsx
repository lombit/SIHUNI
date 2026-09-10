import Link from "next/link";
import { notFound } from "next/navigation";
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
  ChevronLeft,
  Building,
  User,
  Phone,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  ShieldAlert,
} from "lucide-react";
import { TindakLanjutForm } from "@/frontend/components/pengaduan/TindakLanjutForm";

export const dynamic = "force-dynamic";

interface PengaduanDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PengaduanDetailPage({ params }: PengaduanDetailPageProps) {
  const { id } = await params;

  const [aduan, users] = await Promise.all([
    db.pengaduan.findUnique({
      where: { id },
      include: {
        unit: {
          include: {
            tower: true,
            perjanjian: {
              where: { status: "AKTIF" },
              include: { penghuni: true },
            },
          },
        },
      },
    }),
    db.user.findMany({
      where: { aktif: true },
      select: { id: true, nama: true, peran: true },
      orderBy: { nama: "asc" },
    }),
  ]);

  if (!aduan) {
    notFound();
  }

  const overdue = isLewatBatasWaktu(aduan.batasWaktu, aduan.status === "SELESAI");
  const sInfo = STATUS_ADUAN_LABEL[aduan.status as StatusAduan] || {
    label: aduan.status,
    color: "text-slate-700",
    badgeBg: "bg-slate-100 border-slate-200",
  };
  const tInfo = TINGKAT_ADUAN_LABEL[aduan.tingkat as TingkatAduan] || {
    label: aduan.tingkat,
    color: "text-slate-700",
    badgeBg: "bg-slate-100 border-slate-200",
  };
  const katLabel = KATEGORI_ADUAN_LABEL[aduan.kategori as KategoriAduan] || aduan.kategori;
  const unit = aduan.unit;

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Header */}
      <div>
        <Link
          href="/pengaduan"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:text-sky-900 mb-2 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Pengaduan</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                {aduan.nomorTiket}
              </h1>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${sInfo.badgeBg} ${sInfo.color}`}
              >
                {sInfo.label}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Dilaporkan pada {formatTanggalWaktu(aduan.tanggalLapor)}
            </p>
          </div>
        </div>
      </div>

      {/* Banner Peringatan Jika Overdue SLA */}
      {overdue && (
        <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-2xl flex items-start gap-3.5 text-rose-800 animate-pulse">
          <AlertTriangle className="w-6 h-6 flex-shrink-0 text-rose-600 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">PERINGATAN: TIKET MELEWATI BATAS WAKTU (OVERDUE SLA)</h4>
            <p className="text-xs text-rose-700 mt-0.5">
              Batas waktu penanganan yang ditetapkan ({formatTanggalWaktu(aduan.batasWaktu)}) telah terlampaui. Segera lakukan koordinasi teknis dan prioritaskan penyelesaian gangguan ini.
            </p>
          </div>
        </div>
      )}

      {/* Grid Informasi Aduan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Kolom Kiri: Detail Pengaduan & Pelapor */}
        <div className="space-y-6">
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
              <AlertCircle className="w-4 h-4 text-sky-700" />
              <span>Detail Laporan Gangguan (RSN-03)</span>
            </h2>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs text-slate-400 block">Unit Lokasi</span>
                <Link
                  href={`/unit/${unit.id}`}
                  className="font-mono font-bold text-sky-700 hover:underline text-base"
                >
                  Unit {unit.nomor}
                </Link>
                <div className="text-[11px] text-slate-400">
                  {unit.tower.nama} • Lantai {unit.lantai}
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-400 block">Kategori Gangguan</span>
                <span className="font-semibold text-slate-800">{katLabel}</span>
              </div>

              <div>
                <span className="text-xs text-slate-400 block">Nama Pelapor</span>
                <span className="font-semibold text-slate-800">{aduan.namaPelapor}</span>
              </div>

              <div>
                <span className="text-xs text-slate-400 block">Kontak WhatsApp / HP</span>
                <span className="font-mono font-bold text-sky-800">{aduan.noHp}</span>
              </div>

              <div className="col-span-2 pt-2 border-t border-slate-100">
                <span className="text-xs text-slate-400 block mb-1">Tingkat & SLA Penyelesaian</span>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block text-xs font-bold px-3 py-1 rounded-full border ${tInfo.badgeBg} ${tInfo.color}`}
                  >
                    {tInfo.label}
                  </span>
                  <span className="text-xs text-slate-600">
                    Batas Maksimal: <strong>{formatTanggalWaktu(aduan.batasWaktu)}</strong>
                  </span>
                </div>
              </div>

              <div className="col-span-2 pt-2 border-t border-slate-100">
                <span className="text-xs text-slate-400 block mb-1">Uraian Masalah & Gejala</span>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed">
                  {aduan.uraian}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Lembar Kerja Tindak Lanjut Petugas */}
        <div className="space-y-6">
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
              <Wrench className="w-4 h-4 text-emerald-600" />
              <span>Lembar Tindak Lanjut Teknisi</span>
            </h2>

            <TindakLanjutForm
              pengaduanId={aduan.id}
              currentStatus={aduan.status}
              currentTindakan={aduan.tindakan}
              currentPetugasId={aduan.petugasId}
              petugasList={users}
            />

            {aduan.tanggalSelesai && (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>
                  Tiket dinyatakan tuntas pada {formatTanggalWaktu(aduan.tanggalSelesai)}.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
