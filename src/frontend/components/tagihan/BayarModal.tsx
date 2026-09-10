"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatRupiah, NAMA_BULAN } from "@/frontend/utils/format";
import { CreditCard, X, Save, AlertCircle, RefreshCw } from "lucide-react";

interface BayarModalProps {
  tagihanId: string;
  unitNomor: string;
  penghuniNama: string;
  periodeBulan: number;
  periodeTahun: number;
  jumlahTagihan: number;
  sisaTagihan: number;
}

export function BayarModal({
  tagihanId,
  unitNomor,
  penghuniNama,
  periodeBulan,
  periodeTahun,
  jumlahTagihan,
  sisaTagihan,
}: BayarModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const sekarang = new Date();
  const [tanggalBayar, setTanggalBayar] = useState(
    sekarang.toISOString().split("T")[0]
  );
  const [jumlah, setJumlah] = useState(sisaTagihan);
  const [nomorBukti, setNomorBukti] = useState(
    `BKT/${periodeTahun}/${periodeBulan.toString().padStart(2, "0")}/${Math.floor(
      1000 + Math.random() * 9000
    )}`
  );
  const [tanggalSetor, setTanggalSetor] = useState("");
  const [nomorSetoran, setNomorSetoran] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpen = () => {
    setJumlah(sisaTagihan);
    setError(null);
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (jumlah <= 0) {
      setError("Jumlah pembayaran harus lebih dari 0.");
      return;
    }

    if (jumlah > sisaTagihan) {
      setError(`Jumlah bayar tidak boleh melebihi sisa tagihan (${formatRupiah(sisaTagihan)}).`);
      return;
    }

    if (!nomorBukti.trim()) {
      setError("Nomor kuitansi / bukti pembayaran wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/tagihan/${tagihanId}/bayar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tanggalBayar,
          jumlah: Number(jumlah),
          nomorBukti,
          tanggalSetor: tanggalSetor || null,
          nomorSetoran: nomorSetoran || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal mencatat pembayaran.");
      } else {
        setIsOpen(false);
        router.refresh();
      }
    } catch {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg border border-emerald-200 transition shadow-sm"
      >
        <CreditCard className="w-3.5 h-3.5" />
        <span>Catat Bayar</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-sky-800 to-indigo-900 p-5 text-white flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="font-bold text-base">Pencatatan Pembayaran Retribusi</h3>
                <p className="text-xs text-sky-200 mt-0.5">
                  Unit {unitNomor} • {penghuniNama}
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-sky-200 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-700 text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block">Periode Tagihan:</span>
                  <span className="font-semibold text-slate-800">
                    {NAMA_BULAN[periodeBulan]} {periodeTahun}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Sisa Harus Dibayar:</span>
                  <span className="font-mono font-bold text-rose-700 text-sm">
                    {formatRupiah(sisaTagihan)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Bayar <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={tanggalBayar}
                    onChange={(e) => setTanggalBayar(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nominal Pembayaran (Rp) <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1000}
                    max={sisaTagihan}
                    value={jumlah}
                    onChange={(e) => setJumlah(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono font-bold text-slate-800"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nomor Kuitansi / Bukti Bayar <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nomorBukti}
                    onChange={(e) => setNomorBukti(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                  />
                </div>

                <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                    Rekonsiliasi Kas Daerah (Opsional)
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Setor Kasda
                  </label>
                  <input
                    type="date"
                    value={tanggalSetor}
                    onChange={(e) => setTanggalSetor(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nomor Bukti STS / Kasda
                  </label>
                  <input
                    type="text"
                    value={nomorSetoran}
                    onChange={(e) => setNomorSetoran(e.target.value)}
                    placeholder="STS-KASDA-..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow transition disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>{loading ? "Menyimpan..." : "Simpan Pembayaran"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
