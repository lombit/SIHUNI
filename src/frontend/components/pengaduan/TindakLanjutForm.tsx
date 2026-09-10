"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { StatusAduan } from "@/types";

export function TindakLanjutForm({
  pengaduanId,
  currentStatus,
  currentTindakan,
  currentPetugasId,
  petugasList,
}: {
  pengaduanId: string;
  currentStatus: string;
  currentTindakan: string | null;
  currentPetugasId: string | null;
  petugasList: Array<{ id: string; nama: string; peran: string }>;
}) {
  const router = useRouter();

  const [status, setStatus] = useState<StatusAduan>(currentStatus as StatusAduan);
  const [tindakan, setTindakan] = useState(currentTindakan || "");
  const [petugasId, setPetugasId] = useState(currentPetugasId || "");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const res = await fetch(`/api/pengaduan/${pengaduanId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          tindakan: tindakan || null,
          petugasId: petugasId || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal memperbarui status pengaduan.");
      } else {
        setSuccess(true);
        router.refresh();
      }
    } catch {
      setError("Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-700 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-emerald-800 text-xs">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>Tindak lanjut pengaduan berhasil disimpan.</span>
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Status Penanganan <span className="text-rose-600">*</span>
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusAduan)}
          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white font-medium"
        >
          <option value="BARU">BARU — Belum Ditangani</option>
          <option value="DIPROSES">DIPROSES — Sedang Dikerjakan Teknisi</option>
          <option value="SELESAI">SELESAI — Gangguan Telah Tertangani</option>
          <option value="DITERUSKAN">DITERUSKAN — Diteruskan ke Dinas / Pihak Ketiga</option>
          <option value="TIDAK_DAPAT_DITANGANI">TIDAK DAPAT DITANGANI — Di Luar Tanggung Jawab</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Petugas / Teknisi Penanggung Jawab
        </label>
        <select
          value={petugasId}
          onChange={(e) => setPetugasId(e.target.value)}
          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
        >
          <option value="">-- Tetapkan Petugas / Teknisi --</option>
          {petugasList.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nama} ({p.peran})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Catatan Tindakan / Pekerjaan Fisik
        </label>
        <textarea
          rows={3}
          value={tindakan}
          onChange={(e) => setTindakan(e.target.value)}
          placeholder="Tuliskan tindakan perbaikan yang dilakukan, suku cadang yang diganti, atau kendala lapangan..."
          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
      </div>

      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-xl shadow transition disabled:opacity-50"
        >
          {loading ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          <span>{loading ? "Menyimpan..." : "Simpan Tindak Lanjut"}</span>
        </button>
      </div>
    </form>
  );
}
