import Link from "next/link";
import { notFound } from "next/navigation";
import db from "@/backend/db";
import { PenghuniForm } from "@/frontend/components/penghuni/PenghuniForm";
import { ChevronLeft, Edit3 } from "lucide-react";

export const dynamic = "force-dynamic";

interface UbahPenghuniPageProps {
  params: Promise<{ id: string }>;
}

export default async function UbahPenghuniPage({ params }: UbahPenghuniPageProps) {
  const { id } = await params;

  const penghuni = await db.penghuni.findUnique({
    where: { id },
    include: {
      anggota: true,
    },
  });

  if (!penghuni) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href={`/penghuni/${penghuni.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:text-sky-900 mb-2 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Kembali ke Detail Penghuni</span>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Edit3 className="w-7 h-7 text-sky-700" />
          <span>Ubah Biodata Penghuni: {penghuni.nama}</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Perbarui data kependudukan atau susunan anggota keluarga yang tinggal bersama
        </p>
      </div>

      {/* Form Edit */}
      <PenghuniForm
        isEdit
        initialData={{
          id: penghuni.id,
          nik: penghuni.nik,
          nomorKk: penghuni.nomorKk,
          nama: penghuni.nama,
          tempatLahir: penghuni.tempatLahir,
          tanggalLahir: penghuni.tanggalLahir ? penghuni.tanggalLahir.toISOString() : null,
          jenisKelamin: penghuni.jenisKelamin,
          statusKawin: penghuni.statusKawin,
          pekerjaan: penghuni.pekerjaan,
          penghasilan: penghuni.penghasilan,
          noHp: penghuni.noHp,
          alamatKtp: penghuni.alamatKtp,
          berkasLengkap: penghuni.berkasLengkap,
          anggota: penghuni.anggota.map((a) => ({
            id: a.id,
            nik: a.nik,
            nama: a.nama,
            hubungan: a.hubungan,
            usia: a.usia,
          })),
        }}
      />
    </div>
  );
}
