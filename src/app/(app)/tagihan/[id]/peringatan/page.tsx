import Link from "next/link";
import { notFound } from "next/navigation";
import db from "@/backend/db";
import { formatRupiah, formatTanggal, NAMA_BULAN } from "@/frontend/utils/format";
import { KopSurat } from "@/frontend/components/dokumen/KopSurat";
import { PrintButton } from "@/frontend/components/ui/PrintButton";
import { ArrowLeft, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

interface PeringatanPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tingkat?: string }>;
}

export default async function PeringatanPage({ params, searchParams }: PeringatanPageProps) {
  const { id } = await params;
  const sParams = await searchParams;

  const tagihan = await db.tagihan.findUnique({
    where: { id },
    include: {
      perjanjian: {
        include: {
          unit: { include: { tower: true } },
          penghuni: true,
        },
      },
      pembayaran: true,
    },
  });

  if (!tagihan) {
    notFound();
  }

  const unit = tagihan.perjanjian.unit;
  const penghuni = tagihan.perjanjian.penghuni;
  const dibayar = tagihan.pembayaran.reduce((sum, p) => sum + p.jumlah, 0);
  const sisaTunggakan = tagihan.jumlah - dibayar;

  // Hitung berapa bulan menunggak untuk perjanjian ini
  const semuaTunggakanUnit = await db.tagihan.findMany({
    where: {
      perjanjianId: tagihan.perjanjianId,
      status: { in: ["BELUM_BAYAR", "TERLAMBAT"] },
    },
    orderBy: [{ periodeTahun: "asc" }, { periodeBulan: "asc" }],
  });

  const jumlahBulanMenunggak = Math.max(1, semuaTunggakanUnit.length);
  const tingkatParam = sParams.tingkat?.toUpperCase();
  const tingkatSP = tingkatParam === "SP-2" ? "SP-2" : tingkatParam === "SP-3" ? "SP-3" : jumlahBulanMenunggak >= 3 ? "SP-3" : jumlahBulanMenunggak === 2 ? "SP-2" : "SP-1";

  const totalAkumulasiTunggakan = semuaTunggakanUnit.reduce((sum, t) => sum + t.jumlah, 0);

  const nomorSurat = `600.1.2/${tingkatSP}/${unit.nomor.replace("-", "")}/${new Date().getFullYear()}`;

  return (
    <div className="space-y-6">
      {/* Action Bar (Hidden when printing) */}
      <div className="flex items-center justify-between gap-3 print:hidden">
        <Link
          href="/tagihan"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Tagihan</span>
        </Link>

        <div className="flex items-center gap-2">
          <PrintButton label={`Cetak Surat ${tingkatSP} Resmi`} />
        </div>
      </div>

      {/* Printable Letter Paper */}
      <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 rounded-2xl border border-slate-200/90 shadow-lg print:shadow-none print:border-none print:p-0 print:m-0 font-serif leading-relaxed text-slate-900 text-sm">
        {/* Kop Surat */}
        <KopSurat />

        {/* Info Surat */}
        <div className="grid grid-cols-12 gap-2 text-xs mb-6 font-sans">
          <div className="col-span-8 space-y-1">
            <div className="grid grid-cols-12 gap-1">
              <span className="col-span-3 text-slate-500">Nomor</span>
              <span className="col-span-9 font-semibold">: {nomorSurat}</span>
            </div>
            <div className="grid grid-cols-12 gap-1">
              <span className="col-span-3 text-slate-500">Sifat</span>
              <span className="col-span-9 font-semibold">: Penting / Segera</span>
            </div>
            <div className="grid grid-cols-12 gap-1">
              <span className="col-span-3 text-slate-500">Lampiran</span>
              <span className="col-span-9">: 1 (satu) Lembar Rincian Tunggakan</span>
            </div>
            <div className="grid grid-cols-12 gap-1">
              <span className="col-span-3 text-slate-500">Perihal</span>
              <span className="col-span-9 font-bold text-rose-800">
                : {tingkatSP === "SP-1" ? "SURAT TEGURAN KESATU (SP-1)" : tingkatSP === "SP-2" ? "SURAT PERINGATAN KEDUA (SP-2)" : "SURAT PERINGATAN KETIGA / TERAKHIR (SP-3)"} TUNGGAKAN RETRIBUSI SEWA RUSUNAWA
              </span>
            </div>
          </div>

          <div className="col-span-4 text-right">
            <span>Purwakarta, {formatTanggal(new Date())}</span>
            <div className="mt-4 text-left pl-6">
              <p className="font-semibold">Kepada Yth.</p>
              <p className="font-bold">{penghuni.nama}</p>
              <p>Penghuni Unit {unit.nomor}</p>
              <p className="text-slate-600">Rusunawa {unit.tower.nama}</p>
              <p className="text-slate-600">di Tempat</p>
            </div>
          </div>
        </div>

        {/* Isi Surat */}
        <div className="space-y-4 text-justify">
          <p>Dengan hormat,</p>
          <p>
            Berdasarkan Peraturan Daerah Kabupaten Purwakarta tentang Retribusi Pemakaian Kekayaan Daerah serta Surat Perjanjian Sewa (SPS) Nomor: <strong>{tagihan.perjanjian.nomor}</strong> tanggal {formatTanggal(tagihan.perjanjian.tanggalMulai)}, bersama ini kami beritahukan bahwa berdasarkan pembukuan UPTD Rusunawa sampai dengan diterbitkannya surat ini, Saudara tercatat belum menyelesaikan kewajiban retribusi sewa hunian dengan rincian sebagai berikut:
          </p>

          <div className="my-3 bg-slate-50 p-4 rounded-xl border border-slate-200 font-sans text-xs space-y-2">
            <div className="flex justify-between border-b border-slate-200/80 pb-1.5">
              <span className="text-slate-500">Nomor Unit Hunian</span>
              <span className="font-bold text-slate-900">Unit {unit.nomor} ({unit.tower.nama} Lantai {unit.lantai})</span>
            </div>
            <div className="flex justify-between border-b border-slate-200/80 pb-1.5">
              <span className="text-slate-500">Nama Kepala Keluarga / Penyewa</span>
              <span className="font-semibold text-slate-900">{penghuni.nama} (NIK: {penghuni.nik})</span>
            </div>
            <div className="flex justify-between border-b border-slate-200/80 pb-1.5">
              <span className="text-slate-500">Jumlah Bulan Menunggak</span>
              <span className="font-bold text-rose-700">{semuaTunggakanUnit.length} Bulan ({semuaTunggakanUnit.map(t => `${NAMA_BULAN[t.periodeBulan]} ${t.periodeTahun}`).join(", ")})</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-slate-700 font-bold">Total Akumulasi Kewajiban Retribusi</span>
              <span className="font-mono font-black text-sm text-rose-800">{formatRupiah(totalAkumulasiTunggakan)}</span>
            </div>
          </div>

          <p>
            Sehubungan dengan hal tersebut di atas, kami meminta Saudara untuk segera melakukan pelunasan tunggakan retribusi tersebut di Kantor Pengelola UPTD Rusunawa Purwakarta selambat-lambatnya <strong>7 (tujuh) hari kalender</strong> sejak diterimanya surat ini.
          </p>

          {tingkatSP === "SP-3" ? (
            <div className="p-3 bg-rose-50 border-l-4 border-rose-600 rounded-r-xl font-sans text-xs text-rose-900 my-3">
              <strong>PERINGATAN KERAS / PENERTIBAN:</strong> Mengingat surat ini merupakan Peringatan Terakhir (SP-3), apabila dalam batas waktu 7 (tujuh) hari Saudara tidak menyelesaikan kewajiban pembayaran, maka pihak UPTD Rusunawa akan melakukan tindakan <strong>pemutusan utilitas listrik dan air serta pengosongan dan penyegelan unit hunian</strong> sesuai dengan ketentuan hukum yang berlaku.
            </div>
          ) : (
            <p>
              Apabila dalam jangka waktu yang telah ditetapkan Saudara tidak menyelesaikan pembayaran atau tidak memberikan konfirmasi resmi kepada pengelola, maka kami akan menerbitkan surat peringatan tahap berikutnya dan dapat dikenakan sanksi penertiban fasilitas hunian.
            </p>
          )}

          <p>
            Demikian surat peringatan ini disampaikan untuk menjadi perhatian dan dilaksanakan dengan penuh tanggung jawab.
          </p>
        </div>

        {/* Tanda Tangan */}
        <div className="mt-12 flex justify-end font-sans text-xs">
          <div className="w-64 text-center">
            <p>Purwakarta, {formatTanggal(new Date())}</p>
            <p className="font-bold mt-1">KEPALA UPTD RUSUNAWA</p>
            <p className="text-[11px] text-slate-500">Dinas Perumahan & Kawasan Permukiman<br />Kabupaten Purwakarta</p>
            
            <div className="my-14 text-slate-300 italic text-[11px]">
              [Tanda Tangan & Cap Dinas]
            </div>

            <p className="font-bold text-slate-900 underline">Ir. H. DEDI SUPRIYADI, M.Si.</p>
            <p className="text-slate-500 text-[11px]">Pembina / IV a</p>
            <p className="text-slate-500 text-[11px]">NIP. 19740815 200212 1 003</p>
          </div>
        </div>

        {/* Tembusan */}
        <div className="mt-8 pt-4 border-t border-slate-200 text-[11px] text-slate-500 font-sans">
          <p className="font-bold">Tembusan disampaikan kepada Yth.:</p>
          <ol className="list-decimal list-inside space-y-0.5 mt-1 text-[10px]">
            <li>Kepala Dinas Perumahan dan Kawasan Permukiman Kab. Purwakarta (sebagai laporan);</li>
            <li>Inspektur Daerah Kabupaten Purwakarta;</li>
            <li>Pertinggal / Arsip Pengelola UPTD Rusunawa.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
