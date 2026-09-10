import Link from "next/link";
import { notFound } from "next/navigation";
import db from "@/backend/db";
import { formatRupiah, formatTanggal, NAMA_BULAN } from "@/frontend/utils/format";
import { terbilangRupiah } from "@/frontend/utils/terbilang";
import { KopSurat } from "@/frontend/components/dokumen/KopSurat";
import { PrintButton } from "@/frontend/components/ui/PrintButton";
import { ArrowLeft, CheckCircle2, Receipt } from "lucide-react";

export const dynamic = "force-dynamic";

interface KuitansiPageProps {
  params: Promise<{ id: string }>;
}

export default async function KuitansiPage({ params }: KuitansiPageProps) {
  const { id } = await params;

  const tagihan = await db.tagihan.findUnique({
    where: { id },
    include: {
      perjanjian: {
        include: {
          unit: { include: { tower: true } },
          penghuni: true,
        },
      },
      pembayaran: {
        orderBy: { tanggalBayar: "desc" },
      },
    },
  });

  if (!tagihan) {
    notFound();
  }

  const pembayaranTerakhir = tagihan.pembayaran[0];
  const unit = tagihan.perjanjian.unit;
  const penghuni = tagihan.perjanjian.penghuni;
  const totalBayar = tagihan.pembayaran.reduce((sum, p) => sum + p.jumlah, 0);

  return (
    <div className="space-y-6">
      {/* Top Action Bar (Hidden when printing) */}
      <div className="flex items-center justify-between gap-3 print:hidden">
        <Link
          href="/tagihan"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Tagihan</span>
        </Link>

        <div className="flex items-center gap-2">
          <PrintButton label="Cetak Kuitansi Resmi" />
        </div>
      </div>

      {/* Printable Kuitansi Paper */}
      <div className="max-w-3xl mx-auto bg-white p-8 sm:p-10 rounded-2xl border border-slate-200/90 shadow-lg print:shadow-none print:border-none print:p-0 print:m-0">
        {/* Kop Surat Pemerintah Daerah */}
        <KopSurat />

        {/* Judul Kuitansi */}
        <div className="text-center my-6">
          <h2 className="text-base sm:text-lg font-black tracking-wider text-slate-900 uppercase underline decoration-2 underline-offset-4">
            Tanda Terima Pembayaran Retribusi (Kuitansi)
          </h2>
          <div className="flex items-center justify-center gap-3 text-xs font-mono text-slate-600 mt-1.5">
            <span>Nomor Kuitansi: <strong>{pembayaranTerakhir?.nomorBukti || `KWT/${tagihan.periodeTahun}/${tagihan.id.slice(0, 8).toUpperCase()}`}</strong></span>
            <span>&bull;</span>
            <span>Kode Retribusi: <strong>4.1.2.02.01</strong></span>
          </div>
        </div>

        {/* Isi Rincian Kuitansi */}
        <div className="space-y-4 text-sm text-slate-900">
          <div className="grid grid-cols-12 gap-2 py-2 border-b border-slate-100">
            <span className="col-span-4 sm:col-span-3 text-slate-500 font-medium">Telah Diterima Dari</span>
            <span className="col-span-8 sm:col-span-9 font-bold text-slate-900">
              : {penghuni.nama} <span className="font-normal text-slate-500 font-mono text-xs">(NIK: {penghuni.nik})</span>
            </span>
          </div>

          <div className="grid grid-cols-12 gap-2 py-2 border-b border-slate-100">
            <span className="col-span-4 sm:col-span-3 text-slate-500 font-medium">Unit Hunian</span>
            <span className="col-span-8 sm:col-span-9 font-semibold text-slate-900 font-mono">
              : Unit {unit.nomor} &bull; {unit.tower.nama} Lantai {unit.lantai}
            </span>
          </div>

          <div className="grid grid-cols-12 gap-2 py-2 border-b border-slate-100">
            <span className="col-span-4 sm:col-span-3 text-slate-500 font-medium">Uang Sejumlah</span>
            <span className="col-span-8 sm:col-span-9 font-mono font-black text-lg text-emerald-800">
              : {formatRupiah(totalBayar > 0 ? totalBayar : tagihan.jumlah)}
            </span>
          </div>

          <div className="grid grid-cols-12 gap-2 py-2 border-b border-slate-100 bg-slate-50 p-3 rounded-xl">
            <span className="col-span-4 sm:col-span-3 text-slate-500 font-medium">Terbilang</span>
            <span className="col-span-8 sm:col-span-9 font-serif italic font-bold text-slate-800">
              &ldquo;{terbilangRupiah(totalBayar > 0 ? totalBayar : tagihan.jumlah)}&rdquo;
            </span>
          </div>

          <div className="grid grid-cols-12 gap-2 py-2 border-b border-slate-100">
            <span className="col-span-4 sm:col-span-3 text-slate-500 font-medium">Untuk Pembayaran</span>
            <span className="col-span-8 sm:col-span-9 text-slate-800 leading-relaxed">
              : Retribusi Pemakaian Rumah Susun Sederhana Sewa (Rusunawa) Periode Bulan{" "}
              <strong>{NAMA_BULAN[tagihan.periodeBulan]} {tagihan.periodeTahun}</strong> berdasarkan Peraturan Daerah Kab. Purwakarta tentang Retribusi Daerah.
            </span>
          </div>

          {pembayaranTerakhir?.nomorSetoran && (
            <div className="grid grid-cols-12 gap-2 py-2 border-b border-slate-100 text-xs">
              <span className="col-span-4 sm:col-span-3 text-slate-500 font-medium">No. Setor Kasda (STS)</span>
              <span className="col-span-8 sm:col-span-9 font-mono font-bold text-sky-800">
                : {pembayaranTerakhir.nomorSetoran}
              </span>
            </div>
          )}
        </div>

        {/* Kolom Tanda Tangan */}
        <div className="mt-12 pt-6 grid grid-cols-2 gap-8 text-center text-xs">
          <div>
            <p className="text-slate-500 font-medium mb-16">Penyetor / Penghuni,</p>
            <p className="font-bold text-slate-900 underline">{penghuni.nama}</p>
            <p className="text-slate-400 font-mono text-[11px]">NIK. {penghuni.nik}</p>
          </div>

          <div>
            <p className="text-slate-500 font-medium mb-16">
              Purwakarta, {pembayaranTerakhir ? formatTanggal(pembayaranTerakhir.tanggalBayar) : formatTanggal(new Date())}
              <br />
              <strong>Kasir / Bendahara Penerimaan Pembantu,</strong>
            </p>
            <p className="font-bold text-slate-900 underline">PETUGAS PELAYANAN UPTD</p>
            <p className="text-slate-400 text-[11px]">NIP. 19850412 201001 1 008</p>
          </div>
        </div>

        {/* Lembar Distribusi / Catatan Footer */}
        <div className="mt-10 pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
          <span>Lembar 1: Penghuni &bull; Lembar 2: Arsip UPTD &bull; Lembar 3: BKAD</span>
          <span className="font-mono">Dicetak otomatis oleh SIHUNI Rusunawa Purwakarta</span>
        </div>
      </div>
    </div>
  );
}
