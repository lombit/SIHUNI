import Link from "next/link";
import { Building, ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center mx-auto mb-4 border border-sky-100">
          <Building className="w-8 h-8" />
        </div>

        <h1 className="text-4xl font-extrabold text-slate-900 font-mono tracking-tight">404</h1>
        <h2 className="text-lg font-bold text-slate-800 mt-2">Halaman Tidak Ditemukan</h2>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          Halaman atau unit/data yang Anda cari tidak tersedia atau tautan telah berpindah.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-semibold shadow-sm transition"
          >
            <Home className="w-4 h-4" />
            <span>Kembali ke Dasbor</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
