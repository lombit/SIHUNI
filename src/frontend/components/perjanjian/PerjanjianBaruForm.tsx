"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatRupiah } from "@/frontend/utils/format";
import {
  FileText,
  Building2,
  User,
  Calendar,
  DollarSign,
  AlertCircle,
  Save,
  ChevronLeft,
  UserPlus,
} from "lucide-react";

interface UnitOption {
  id: string;
  nomor: string;
  lantai: number;
  tipe: string;
  tarifSewa: number;
  status: string;
  tower: { nama: string };
}

interface PenghuniOption {
  id: string;
  nama: string;
  nik: string;
  noHp: string;
  hasActiveLease: boolean;
}

export function PerjanjianBaruForm({
  unitList,
  penghuniList,
  preselectedUnitId,
}: {
  unitList: UnitOption[];
  penghuniList: PenghuniOption[];
  preselectedUnitId?: string;
}) {
  const router = useRouter();

  const [unitId, setUnitId] = useState(preselectedUnitId || "");
  const [penghuniId, setPenghuniId] = useState("");

  const sekarang = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  const localToday = `${sekarang.getFullYear()}-${pad(sekarang.getMonth() + 1)}-${pad(sekarang.getDate())}`;
  const localNextYear = `${sekarang.getFullYear() + 1}-${pad(sekarang.getMonth() + 1)}-${pad(sekarang.getDate())}`;

  const [tanggalMulai, setTanggalMulai] = useState(localToday);
  const [tanggalBerakhir, setTanggalBerakhir] = useState(localNextYear);
  const [tarifBulanan, setTarifBulanan] = useState<number>(300000);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Otomatis update tarif saat unit dipilih
  useEffect(() => {
    if (unitId) {
      const selected = unitList.find((u) => u.id === unitId);
      if (selected) {
        setTarifBulanan(selected.tarifSewa);
      }
    }
  }, [unitId, unitList]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!unitId) {
      setError("Silakan pilih unit hunian.");
      return;
    }

    if (!penghuniId) {
      setError("Silakan pilih penghuni pemohon.");
      return;
    }

    if (!tanggalMulai || !tanggalBerakhir) {
      setError("Tanggal mulai dan tanggal berakhir sewa wajib diisi.");
      return;
    }

    if (new Date(tanggalBerakhir) <= new Date(tanggalMulai)) {
      setError("Tanggal berakhir sewa harus setelah tanggal mulai.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/perjanjian", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitId,
          penghuniId,
          tanggalMulai,
          tanggalBerakhir,
          tarifBulanan: Number(tarifBulanan),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal membuat perjanjian sewa.");
      } else {
        router.refresh();
        router.push("/perjanjian");
      }
    } catch {
      setError("Terjadi kesalahan jaringan saat menyimpan data.");
    } finally {
      setLoading(false);
    }
  };

  const selectedUnit = unitList.find((u) => u.id === unitId);

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
            <FileText className="w-5 h-5 text-sky-700" />
            <span>Formulir Surat Perjanjian Sewa (SPS)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Nomor perjanjian akan di-generate otomatis oleh sistem: <span className="font-mono font-semibold text-slate-700">SPS/{sekarang.getFullYear()}/[URUT]</span>
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Unit Hunian Rusunawa <span className="text-rose-600">*</span></span>
              <span className="text-[11px] text-slate-400 font-normal">
                {unitList.filter((u) => u.status === "KOSONG").length} unit kosong tersedia
              </span>
            </label>
            <select
              required
              value={unitId}
              onChange={(e) => setUnitId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
            >
              <option value="">-- Pilih Unit Hunian --</option>
              {unitList.map((u) => (
                <option
                  key={u.id}
                  value={u.id}
                  disabled={u.status === "DIHUNI"}
                  className={u.status === "DIHUNI" ? "text-slate-400 bg-slate-100" : "font-medium"}
                >
                  Unit {u.nomor} ({u.tower.nama} Lt. {u.lantai} - {u.tipe}) — {formatRupiah(u.tarifSewa)}/bln {u.status === "DIHUNI" ? "[SUDAH DIHUNI]" : u.status === "PERBAIKAN" ? "[PERBAIKAN]" : "[KOSONG]"}
                </option>
              ))}
            </select>
            {selectedUnit && (
              <p className="text-xs text-emerald-700 mt-1 flex items-center gap-1 font-medium">
                <span>Unit {selectedUnit.nomor} siap dialokasikan. Tarif dasar: {formatRupiah(selectedUnit.tarifSewa)}/bulan.</span>
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Penyewa / Kepala Keluarga <span className="text-rose-600">*</span>
              </label>
              <Link
                href="/penghuni/baru"
                target="_blank"
                className="text-xs text-sky-700 hover:text-sky-900 font-medium flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Tambah Penghuni Baru</span>
              </Link>
            </div>
            <select
              required
              value={penghuniId}
              onChange={(e) => setPenghuniId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
            >
              <option value="">-- Pilih Penghuni Terdaftar --</option>
              {penghuniList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nama} (NIK: {p.nik}) — HP: {p.noHp} {p.hasActiveLease ? "[SUDAH MEMILIKI SEWA AKTIF]" : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tanggal Mulai Sewa <span className="text-rose-600">*</span>
              </label>
              <input
                type="date"
                required
                value={tanggalMulai}
                onChange={(e) => setTanggalMulai(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tanggal Berakhir Sewa <span className="text-rose-600">*</span>
              </label>
              <input
                type="date"
                required
                value={tanggalBerakhir}
                onChange={(e) => setTanggalBerakhir(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">Standar masa kontrak sewa adalah 1 tahun</p>
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Tarif Retribusi Bulanan (Rp) <span className="text-rose-600">*</span>
            </label>
            <input
              type="number"
              required
              min={10000}
              value={tarifBulanan}
              onChange={(e) => setTarifBulanan(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono font-bold text-slate-800"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Otomatis terisi dari tarif standar unit, namun dapat disesuaikan jika ada ketentuan keringanan/kebijakan khusus.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Link
          href="/perjanjian"
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
          <span>{loading ? "Menerbitkan Perjanjian..." : "Terbitkan Perjanjian Sewa"}</span>
        </button>
      </div>
    </form>
  );
}
