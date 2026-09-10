import Link from "next/link";
import { notFound } from "next/navigation";
import db from "@/backend/db";
import { formatRupiah, formatTanggal, NAMA_BULAN } from "@/frontend/utils/format";
import { terbilangRupiah } from "@/frontend/utils/terbilang";
import { KopSurat } from "@/frontend/components/dokumen/KopSurat";
import { PrintButton } from "@/frontend/components/ui/PrintButton";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

interface CetakPerjanjianProps {
  params: Promise<{ id: string }>;
}

export default async function CetakPerjanjianPage({ params }: CetakPerjanjianProps) {
  const { id } = await params;

  const perjanjian = await db.perjanjianSewa.findUnique({
    where: { id },
    include: {
      unit: { include: { tower: true } },
      penghuni: {
        include: { anggota: true },
      },
    },
  });

  if (!perjanjian) {
    notFound();
  }

  const { unit, penghuni } = perjanjian;

  return (
    <div className="space-y-6">
      {/* Top Action Bar (Hidden when printing) */}
      <div className="flex items-center justify-between gap-3 print:hidden">
        <Link
          href="/perjanjian"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Perjanjian</span>
        </Link>

        <div className="flex items-center gap-2">
          <PrintButton label="Cetak Naskah Perjanjian Sewa" />
        </div>
      </div>

      {/* Printable Agreement Document */}
      <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 rounded-2xl border border-slate-200/90 shadow-lg print:shadow-none print:border-none print:p-0 print:m-0 font-serif leading-relaxed text-slate-900 text-sm">
        {/* Kop Surat Dinas */}
        <KopSurat />

        {/* Judul Perjanjian */}
        <div className="text-center my-6">
          <h2 className="text-base sm:text-lg font-black tracking-wider text-slate-950 uppercase underline decoration-2 underline-offset-4">
            Surat Perjanjian Sewa Menyewa Rumah Susun Sederhana Sewa (Rusunawa)
          </h2>
          <p className="text-xs font-mono font-bold text-slate-700 mt-1">
            Nomor: {perjanjian.nomor}
          </p>
          <p className="text-[11px] text-slate-500 font-sans mt-0.5">
            Formulir RSN-02 &bull; UPTD Rusunawa Kabupaten Purwakarta
          </p>
        </div>

        {/* Pembukaan */}
        <div className="space-y-4 text-justify">
          <p>
            Pada hari ini, tanggal <strong>{formatTanggal(perjanjian.tanggalMulai)}</strong>, bertempat di Kantor UPTD Rumah Susun Sederhana Sewa (Rusunawa) Kabupaten Purwakarta, kami yang bertanda tangan di bawah ini:
          </p>

          <div className="pl-4 space-y-2 font-sans text-xs">
            <div className="grid grid-cols-12 gap-2">
              <span className="col-span-3 font-semibold">1. Nama</span>
              <span className="col-span-9 font-bold">: Ir. H. DEDI SUPRIYADI, M.Si.</span>
            </div>
            <div className="grid grid-cols-12 gap-2">
              <span className="col-span-3 font-semibold">Jabatan</span>
              <span className="col-span-9">: Kepala UPTD Rusunawa Dinas Perumahan dan Kawasan Permukiman Kab. Purwakarta</span>
            </div>
            <div className="grid grid-cols-12 gap-2">
              <span className="col-span-3 font-semibold">Alamat Kantor</span>
              <span className="col-span-9">: Jl. Veteran No. 12, Purwakarta</span>
            </div>
            <p className="text-slate-600 font-serif italic text-sm pt-1">
              Bertindak untuk dan atas nama Pemerintah Kabupaten Purwakarta, selanjutnya disebut sebagai <strong>PIHAK PERTAMA (Pengelola)</strong>.
            </p>
          </div>

          <div className="pl-4 space-y-2 font-sans text-xs pt-2">
            <div className="grid grid-cols-12 gap-2">
              <span className="col-span-3 font-semibold">2. Nama</span>
              <span className="col-span-9 font-bold">: {penghuni.nama}</span>
            </div>
            <div className="grid grid-cols-12 gap-2">
              <span className="col-span-3 font-semibold">Nomor KTP (NIK)</span>
              <span className="col-span-9 font-mono">: {penghuni.nik}</span>
            </div>
            <div className="grid grid-cols-12 gap-2">
              <span className="col-span-3 font-semibold">Pekerjaan</span>
              <span className="col-span-9">: {penghuni.pekerjaan || "Wiraswasta"}</span>
            </div>
            <div className="grid grid-cols-12 gap-2">
              <span className="col-span-3 font-semibold">No. HP / Kontak</span>
              <span className="col-span-9 font-mono">: {penghuni.noHp}</span>
            </div>
            <p className="text-slate-600 font-serif italic text-sm pt-1">
              Bertindak untuk dan atas nama diri sendiri serta anggota keluarga terdaftar, selanjutnya disebut sebagai <strong>PIHAK KEDUA (Penyewa)</strong>.
            </p>
          </div>

          <p>
            Kedua belah pihak telah sepakat untuk mengikatkan diri dalam Perjanjian Sewa Menyewa Rumah Susun Sederhana Sewa dengan ketentuan pasal-pasal berikut:
          </p>

          {/* Pasal 1 */}
          <div className="pt-2">
            <h4 className="font-bold text-center font-sans text-xs uppercase tracking-wider mb-1">
              Pasal 1 &bull; Objek Sewa
            </h4>
            <p>
              PIHAK PERTAMA menyewakan kepada PIHAK KEDUA dan PIHAK KEDUA menerima sewa berupa 1 (satu) unit hunian Rumah Susun Sederhana Sewa <strong>Unit {unit.nomor}</strong> yang terletak pada <strong>{unit.tower.nama} Lantai {unit.lantai}</strong> dengan Tipe {unit.tipe} (Luas {unit.luas} m²), dilengkapi sarana instalasi air bersih dan listrik.
            </p>
          </div>

          {/* Pasal 2 */}
          <div className="pt-2">
            <h4 className="font-bold text-center font-sans text-xs uppercase tracking-wider mb-1">
              Pasal 2 &bull; Jangka Waktu Sewa
            </h4>
            <p>
              Sewa menyewa ini berlaku untuk jangka waktu <strong>1 (satu) tahun</strong> terhitung sejak tanggal <strong>{formatTanggal(perjanjian.tanggalMulai)}</strong> sampai dengan tanggal <strong>{formatTanggal(perjanjian.tanggalBerakhir)}</strong>, dan dapat diperpanjang atas persetujuan tertulis PIHAK PERTAMA setelah dilakukan evaluasi kepatuhan.
            </p>
          </div>

          {/* Pasal 3 */}
          <div className="pt-2">
            <h4 className="font-bold text-center font-sans text-xs uppercase tracking-wider mb-1">
              Pasal 3 &bull; Besaran Tarif dan Cara Pembayaran
            </h4>
            <p>
              Besaran tarif retribusi sewa adalah sebesar <strong>{formatRupiah(perjanjian.tarifBulanan)}</strong> ({terbilangRupiah(perjanjian.tarifBulanan)}) per bulan, yang wajib dibayarkan oleh PIHAK KEDUA paling lambat tanggal <strong>20 (dua puluh)</strong> setiap bulan berjalan melalui loket pembayaran UPTD Rusunawa untuk disetorkan ke Kas Daerah Kabupaten Purwakarta.
            </p>
          </div>

          {/* Pasal 4 */}
          <div className="pt-2">
            <h4 className="font-bold text-center font-sans text-xs uppercase tracking-wider mb-1">
              Pasal 4 &bull; Larangan dan Kewajiban
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-xs font-sans pl-2">
              <li>PIHAK KEDUA dilarang menyewakan kembali, memindahtangankan, atau meminjamkan unit hunian kepada pihak ketiga dengan alasan apapun.</li>
              <li>PIHAK KEDUA dilarang mengubah bentuk fisik, membongkar dinding, atau menambah bangunan permanen di luar izin tertulis pengelola.</li>
              <li>PIHAK KEDUA wajib menjaga ketertiban, kebersihan, keamanan, dan norma sosial di lingkungan rusunawa.</li>
            </ol>
          </div>

          {/* Pasal 5 */}
          <div className="pt-2">
            <h4 className="font-bold text-center font-sans text-xs uppercase tracking-wider mb-1">
              Pasal 5 &bull; Sanksi dan Pemutusan Perjanjian
            </h4>
            <p>
              Apabila PIHAK KEDUA menunggak pembayaran retribusi sewa selama 3 (tiga) bulan berturut-turut setelah diterbitkan Surat Peringatan (SP-1, SP-2, dan SP-3), maka PIHAK PERTAMA berhak secara sepihak memutus perjanjian ini, memutus utilitas air/listrik, dan melakukan pengosongan unit hunian.
            </p>
          </div>

          <p className="pt-2">
            Demikian Surat Perjanjian ini dibuat dan ditandatangani oleh kedua belah pihak dalam rangkap 2 (dua) bermeterai cukup yang masing-masing mempunyai kekuatan hukum yang sama.
          </p>
        </div>

        {/* Tanda Tangan Para Pihak */}
        <div className="mt-14 grid grid-cols-2 gap-8 text-center text-xs font-sans">
          <div>
            <p className="font-semibold text-slate-700">PIHAK KEDUA (Penyewa),</p>
            <div className="my-16 flex items-center justify-center">
              <div className="w-24 h-12 border border-dashed border-slate-400 rounded flex items-center justify-center text-[10px] text-slate-400">
                [Meterai Rp 10.000]
              </div>
            </div>
            <p className="font-bold text-slate-900 underline">{penghuni.nama}</p>
            <p className="text-slate-500 text-[11px]">NIK. {penghuni.nik}</p>
          </div>

          <div>
            <p className="font-semibold text-slate-700">PIHAK PERTAMA (Pengelola),</p>
            <p className="text-[11px] text-slate-500">Kepala UPTD Rusunawa Purwakarta</p>
            <div className="my-16 text-slate-300 italic text-[11px]">
              [Tanda Tangan & Cap Dinas]
            </div>
            <p className="font-bold text-slate-900 underline">Ir. H. DEDI SUPRIYADI, M.Si.</p>
            <p className="text-slate-500 text-[11px]">NIP. 19740815 200212 1 003</p>
          </div>
        </div>
      </div>
    </div>
  );
}
