import Link from "next/link";
import db from "@/backend/db";
import { ChevronLeft, AlertCircle } from "lucide-react";
import { PengaduanBaruForm } from "@/frontend/components/pengaduan/PengaduanBaruForm";

export const dynamic = "force-dynamic";

export default async function BaruPengaduanPage() {
  const units = await db.unit.findMany({
    include: {
      tower: true,
      perjanjian: {
        where: { status: "AKTIF" },
        include: { penghuni: true },
      },
    },
    orderBy: [{ tower: { nama: "asc" } }, { lantai: "asc" }, { nomor: "asc" }],
  });

  const unitOptions = units.map((u) => ({
    id: u.id,
    nomor: u.nomor,
    tower: { nama: u.tower.nama },
    penghuniAktif: u.perjanjian[0]?.penghuni
      ? {
          nama: u.perjanjian[0].penghuni.nama,
          noHp: u.perjanjian[0].penghuni.noHp,
        }
      : null,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/pengaduan"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:text-sky-900 mb-2 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Pengaduan</span>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
          <AlertCircle className="w-7 h-7 text-sky-700" />
          <span>Penerbitan Tiket Pengaduan Gangguan (RSN-03)</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Pencatatan resmi keluhan warga rusunawa untuk disposisi tim teknisi dan monitoring batas waktu
        </p>
      </div>

      <PengaduanBaruForm unitList={unitOptions} />
    </div>
  );
}
