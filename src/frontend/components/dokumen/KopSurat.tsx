import { Building } from "lucide-react";

export function KopSurat() {
  return (
    <div className="border-b-4 border-double border-slate-900 pb-3 mb-6">
      <div className="flex items-center justify-between gap-4">
        {/* Logo Lambang Daerah */}
        <div className="w-16 h-16 border-2 border-slate-900 rounded-2xl flex items-center justify-center text-slate-900 flex-shrink-0">
          <Building className="w-10 h-10" />
        </div>

        {/* Teks Kop Dinas */}
        <div className="text-center flex-1">
          <h3 className="text-sm font-bold tracking-wider text-slate-800 uppercase">
            Pemerintah Kabupaten Purwakarta
          </h3>
          <h2 className="text-base sm:text-lg font-extrabold text-slate-950 uppercase tracking-tight">
            Dinas Perumahan dan Kawasan Permukiman
          </h2>
          <h1 className="text-lg sm:text-xl font-black text-slate-950 uppercase tracking-tight">
            UPTD Rusunawa Purwakarta
          </h1>
          <p className="text-[11px] text-slate-600 mt-0.5 leading-tight">
            Jl. Veteran No. 12, Nagri Kaler, Kec. Purwakarta, Kab. Purwakarta, Jawa Barat 41115
            <br />
            Telepon: (0264) 822-1090 &bull; Pos-el: rusunawa@purwakartakab.go.id
          </p>
        </div>

        {/* Kotak Kode Form */}
        <div className="w-16 flex-shrink-0 text-right">
          <span className="inline-block text-[10px] font-mono border border-slate-400 px-1.5 py-0.5 rounded font-bold text-slate-600">
            RSN-PWK
          </span>
        </div>
      </div>
    </div>
  );
}
