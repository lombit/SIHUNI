import Link from "next/link";
import db from "@/backend/db";
import { ChevronLeft, FilePlus } from "lucide-react";
import { PerjanjianBaruForm } from "@/frontend/components/perjanjian/PerjanjianBaruForm";

export const dynamic = "force-dynamic";

interface PerjanjianBaruPageProps {
  searchParams: Promise<{ unitId?: string }>;
}

export default async function PerjanjianBaruPage({ searchParams }: PerjanjianBaruPageProps) {
  const params = await searchParams;
  const preselectedUnitId = params.unitId;

  const [units, penghuni] = await Promise.all([
    db.unit.findMany({
      include: { tower: true },
      orderBy: [{ tower: { nama: "asc" } }, { lantai: "asc" }, { nomor: "asc" }],
    }),
    db.penghuni.findMany({
      include: {
        perjanjian: {
          where: { status: "AKTIF" },
        },
      },
      orderBy: { nama: "asc" },
    }),
  ]);

  const penghuniOptions = penghuni.map((p) => ({
    id: p.id,
    nama: p.nama,
    nik: p.nik,
    noHp: p.noHp,
    hasActiveLease: p.perjanjian.length > 0,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/perjanjian"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:text-sky-900 mb-2 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Perjanjian</span>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
          <FilePlus className="w-7 h-7 text-sky-700" />
          <span>Penerbitan Surat Perjanjian Sewa Baru</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Pengikatan hak sewa unit hunian kepada penghuni terdaftar. Status unit otomatis menjadi DIHUNI.
        </p>
      </div>

      <PerjanjianBaruForm
        unitList={units}
        penghuniList={penghuniOptions}
        preselectedUnitId={preselectedUnitId}
      />
    </div>
  );
}
