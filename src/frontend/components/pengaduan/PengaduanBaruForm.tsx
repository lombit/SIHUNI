"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  Building,
  User,
  Phone,
  Save,
  ChevronLeft,
  Clock,
  Wrench,
  AlertTriangle,
} from "lucide-react";
import { KategoriAduan, TingkatAduan, TINGKAT_ADUAN_LABEL } from "@/types";

interface UnitOption {
  id: string;
  nomor: string;
  tower: { nama: string };
  penghuniAktif?: { nama: string; noHp: string } | null;
}

export function PengaduanBaruForm({ unitList }: { unitList: UnitOption[] }) {
  const router = useRouter();

  const [unitId, setUnitId] = useState("");
  const [namaPelapor, setNamaPelapor] = useState("");
  const [noHp, setNoHp] = useState("");
  const [kategori, setKategori] = useState<KategoriAduan>("AIR_BERSIH");
  const [tingkat, setTingkat] = useState<TingkatAduan>("BERAT");
  const [uraian, setUraian] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUnitChange = (id: string) => {
    setUnitId(id);
    const selected = unitList.find((u) => u.id === id);
    if (selected?.penghuniAktif) {
      setNamaPelapor(selected.penghuniAktif.nama);
      setNoHp(selected.penghuniAktif.noHp);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!unitId) {
      setError("Silakan pilih unit lokasi gangguan.");
      return;
    }

    if (!namaPelapor.trim()) {
      setError("Nama pelapor wajib diisi.");
      return;
    }

    if (!noHp.trim()) {
      setError("Nomor HP / WhatsApp pelapor wajib diisi.");
      return;
    }

    if (!uraian.trim() || uraian.length < 5) {
      setError("Uraian masalah gangguan minimal 5 karakter.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/pengaduan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitId,
          namaPelapor,
          noHp,
          kategori,
          tingkat,
          uraian,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal membuat tiket pengaduan.");
      } else {
        router.push(`/pengaduan/${data.pengaduan.id}`);
        router.refresh();
      }
    } catch {
      setError("Terjadi kesalahan jaringan saat menyimpan pengaduan.");
    } finally {
      setLoading(false);
    }
  };

  const slaInfo = TINGKAT_ADUAN_LABEL[tingkat];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-sky-700" />
            <span>Formulir Pengaduan Gangguan (RSN-03)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Nomor tiket otomatis: <span className="font-mono font-semibold text-slate-700">ADU-{new Date().getFullYear()}-[URUT]</span>
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Unit Lokasi Gangguan <span className="text-rose-600">*</span>
            </label>
            <select
              required
              value={unitId}
              onChange={(e) => handleUnitChange(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
            >
              <option value="">-- Pilih Unit Hunian --</option>
              {unitList.map((u) => (
                <option key={u.id} value={u.id}>
                  Unit {u.nomor} ({u.tower.nama}) {u.penghuniAktif ? `— Dihuni: ${u.penghuniAktif.nama}` : "— [KOSONG]"}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Nama Pelapor <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                value={namaPelapor}
                onChange={(e) => setNamaPelapor(e.target.value)}
                placeholder="Nama pelapor..."
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Nomor HP / WhatsApp Pelapor <span className="text-rose-600">*</span>
              </label>
              <input
                type="tel"
                required
                value={noHp}
                onChange={(e) => setNoHp(e.target.value)}
                placeholder="0812xxxxxxxx"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Kategori Gangguan <span className="text-rose-600">*</span>
              </label>
              <select
                value={kategori}
                onChange={(e) => setKategori(e.target.value as KategoriAduan)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
              >
                <option value="AIR_BERSIH">Air Bersih (Pompa / Pipa / Keran)</option>
                <option value="SANITASI">Sanitasi (Kloset / Pembuangan Limbah)</option>
                <option value="LISTRIK">Kelistrikan (MCB / Instalasi Kabel)</option>
                <option value="KEBERSIHAN">Kebersihan (Lorong / Sampah)</option>
                <option value="KEAMANAN">Keamanan Lingkungan</option>
                <option value="BANGUNAN">Fisik Bangunan (Plafon / Dinding / Pintu)</option>
                <option value="LAINNYA">Lain-Lain</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tingkat Gangguan (SLA) <span className="text-rose-600">*</span>
              </label>
              <select
                value={tingkat}
                onChange={(e) => setTingkat(e.target.value as TingkatAduan)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white font-medium"
              >
                <option value="BERAT">BERAT — Target Selesai 2 Hari Kerja</option>
                <option value="SEDANG">SEDANG — Target Selesai 5 Hari Kerja</option>
                <option value="RINGAN">RINGAN — Target Selesai 10 Hari Kerja</option>
              </select>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
            <Clock className="w-5 h-5 text-sky-700 flex-shrink-0" />
            <div className="text-xs">
              <span className="font-semibold text-slate-800">
                Standar Batas Waktu ({tingkat}):{" "}
                <span className="text-sky-700">{slaInfo.hariSLA} Hari Kerja</span>
              </span>
              <p className="text-slate-500 mt-0.5">
                Hari Sabtu dan Minggu tidak dihitung dalam masa kerja teknisi sesuai ketentuan SOP UPTD.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Uraian Masalah & Gejala Gangguan <span className="text-rose-600">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={uraian}
              onChange={(e) => setUraian(e.target.value)}
              placeholder="Jelaskan secara detail kerusakan yang terjadi agar teknisi dapat menyiapkan peralatan yang tepat..."
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Link
          href="/pengaduan"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Kembali</span>
        </Link>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-sky-700 hover:bg-sky-800 text-white font-semibold text-sm rounded-xl shadow-md transition disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? "Menerbitkan Tiket..." : "Terbitkan Tiket Pengaduan"}</span>
        </button>
      </div>
    </form>
  );
}
