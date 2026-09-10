"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Phone,
  CreditCard,
  Plus,
  Trash2,
  Save,
  AlertCircle,
  ChevronLeft,
} from "lucide-react";

interface AnggotaInput {
  id?: string;
  nik: string;
  nama: string;
  hubungan: string;
  usia: string;
}

interface PenghuniFormProps {
  initialData?: {
    id?: string;
    nik: string;
    nomorKk?: string | null;
    nama: string;
    tempatLahir?: string | null;
    tanggalLahir?: string | null;
    jenisKelamin?: string | null;
    statusKawin?: string | null;
    pekerjaan?: string | null;
    penghasilan?: number | null;
    noHp: string;
    alamatKtp?: string | null;
    berkasLengkap: boolean;
    anggota?: Array<{
      id?: string;
      nik?: string | null;
      nama: string;
      hubungan: string;
      usia?: number | null;
    }>;
  };
  isEdit?: boolean;
}

export function PenghuniForm({ initialData, isEdit }: PenghuniFormProps) {
  const router = useRouter();

  const [nik, setNik] = useState(initialData?.nik || "");
  const [nomorKk, setNomorKk] = useState(initialData?.nomorKk || "");
  const [nama, setNama] = useState(initialData?.nama || "");
  const [tempatLahir, setTempatLahir] = useState(initialData?.tempatLahir || "");
  const [tanggalLahir, setTanggalLahir] = useState(
    initialData?.tanggalLahir
      ? new Date(initialData.tanggalLahir).toISOString().split("T")[0]
      : ""
  );
  const [jenisKelamin, setJenisKelamin] = useState(initialData?.jenisKelamin || "L");
  const [statusKawin, setStatusKawin] = useState(initialData?.statusKawin || "Kawin");
  const [pekerjaan, setPekerjaan] = useState(initialData?.pekerjaan || "");
  const [penghasilan, setPenghasilan] = useState(
    initialData?.penghasilan ? String(initialData.penghasilan) : ""
  );
  const [noHp, setNoHp] = useState(initialData?.noHp || "");
  const [alamatKtp, setAlamatKtp] = useState(initialData?.alamatKtp || "");
  const [berkasLengkap, setBerkasLengkap] = useState(initialData?.berkasLengkap || false);

  const [anggotaList, setAnggotaList] = useState<AnggotaInput[]>(
    initialData?.anggota?.map((a) => ({
      id: a.id,
      nik: a.nik || "",
      nama: a.nama,
      hubungan: a.hubungan,
      usia: a.usia ? String(a.usia) : "",
    })) || []
  );

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAddAnggota = () => {
    setAnggotaList([
      ...anggotaList,
      { nik: "", nama: "", hubungan: "Istri", usia: "" },
    ]);
  };

  const handleRemoveAnggota = (index: number) => {
    setAnggotaList(anggotaList.filter((_, i) => i !== index));
  };

  const handleAnggotaChange = (index: number, field: keyof AnggotaInput, val: string) => {
    const updated = [...anggotaList];
    updated[index][field] = val;
    setAnggotaList(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (nik.length !== 16) {
      setError("NIK Kepala Keluarga wajib tepat 16 digit angka.");
      return;
    }

    if (!nama.trim()) {
      setError("Nama lengkap kepala keluarga wajib diisi.");
      return;
    }

    if (!noHp.trim()) {
      setError("Nomor HP / WhatsApp wajib diisi.");
      return;
    }

    for (let i = 0; i < anggotaList.length; i++) {
      if (!anggotaList[i].nama.trim()) {
        setError(`Nama anggota keluarga baris ke-${i + 1} belum diisi.`);
        return;
      }
    }

    setLoading(true);

    const payload = {
      nik,
      nomorKk: nomorKk || null,
      nama,
      tempatLahir: tempatLahir || null,
      tanggalLahir: tanggalLahir || null,
      jenisKelamin,
      statusKawin,
      pekerjaan: pekerjaan || null,
      penghasilan: penghasilan ? parseInt(penghasilan, 10) : null,
      noHp,
      alamatKtp: alamatKtp || null,
      berkasLengkap,
      anggota: anggotaList.map((a) => ({
        id: a.id,
        nik: a.nik || null,
        nama: a.nama,
        hubungan: a.hubungan,
        usia: a.usia ? parseInt(a.usia, 10) : null,
      })),
    };

    try {
      const url = isEdit ? `/api/penghuni/${initialData?.id}` : `/api/penghuni`;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();

      if (!res.ok) {
        setError(resData.error || "Gagal menyimpan data penghuni.");
      } else {
        const id = isEdit ? initialData?.id : resData.penghuni.id;
        router.push(`/penghuni/${id}`);
        router.refresh();
      }
    } catch {
      setError("Terjadi kesalahan koneksi saat menyimpan data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <User className="w-5 h-5 text-sky-700" />
            <span>Biodata Kepala Keluarga (Formulir RSN-01)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Informasi identitas kependudukan dan kontak penghuni penanggung jawab
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nomor Induk Kependudukan (NIK) <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={16}
              value={nik}
              onChange={(e) => setNik(e.target.value.replace(/\D/g, ""))}
              placeholder="16 digit angka (3214...)"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
            />
            <p className="text-[11px] text-slate-400 mt-1">Harus 16 digit angka unik</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nomor Kartu Keluarga (KK)
            </label>
            <input
              type="text"
              maxLength={16}
              value={nomorKk}
              onChange={(e) => setNomorKk(e.target.value.replace(/\D/g, ""))}
              placeholder="16 digit nomor KK..."
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Lengkap (Sesuai KTP) <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Nama lengkap kepala keluarga..."
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tempat Lahir</label>
            <input
              type="text"
              value={tempatLahir}
              onChange={(e) => setTempatLahir(e.target.value)}
              placeholder="Kota / Kabupaten kelahiran..."
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Lahir</label>
            <input
              type="date"
              value={tanggalLahir}
              onChange={(e) => setTanggalLahir(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Jenis Kelamin</label>
            <select
              value={jenisKelamin}
              onChange={(e) => setJenisKelamin(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
            >
              <option value="L">Laki-Laki</option>
              <option value="P">Perempuan</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Status Perkawinan</label>
            <select
              value={statusKawin}
              onChange={(e) => setStatusKawin(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
            >
              <option value="Kawin">Kawin</option>
              <option value="Belum Kawin">Belum Kawin</option>
              <option value="Cerai Hidup">Cerai Hidup</option>
              <option value="Cerai Mati">Cerai Mati</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Pekerjaan</label>
            <input
              type="text"
              value={pekerjaan}
              onChange={(e) => setPekerjaan(e.target.value)}
              placeholder="Contoh: Karyawan Swasta, Wiraswasta..."
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Estimasi Penghasilan Bulanan (Rp)
            </label>
            <input
              type="number"
              value={penghasilan}
              onChange={(e) => setPenghasilan(e.target.value)}
              placeholder="Contoh: 3500000"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nomor Handphone / WhatsApp <span className="text-rose-600">*</span>
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

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat Asal KTP</label>
            <textarea
              rows={2}
              value={alamatKtp}
              onChange={(e) => setAlamatKtp(e.target.value)}
              placeholder="Alamat domisili asal sesuai KTP..."
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="sm:col-span-2 pt-3 border-t border-slate-100">
            <label className="flex items-center gap-3 cursor-pointer p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 transition">
              <input
                type="checkbox"
                checked={berkasLengkap}
                onChange={(e) => setBerkasLengkap(e.target.checked)}
                className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
              />
              <div>
                <span className="text-sm font-semibold text-slate-800">
                  Dokumen Persyaratan Fisik Sudah Lengkap (KTP & KK diserahkan)
                </span>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tandai jika pemohon telah menyerahkan salinan fotokopi KTP dan KK kepada petugas UPTD.
                </p>
              </div>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-600" />
              <span>Daftar Anggota Keluarga yang Tinggal Bersama ({anggotaList.length})</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Masukkan istri, suami, anak, atau anggota keluarga lain yang akan menghuni unit
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddAnggota}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg border border-indigo-200 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Anggota</span>
          </button>
        </div>

        {anggotaList.length === 0 ? (
          <div className="py-6 text-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 text-xs">
            Belum ada anggota keluarga yang didaftarkan. Klik tombol &ldquo;Tambah Anggota&rdquo; jika ada keluarga yang ikut tinggal.
          </div>
        ) : (
          <div className="space-y-3">
            {anggotaList.map((anggota, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center"
              >
                <div className="sm:col-span-4">
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-0.5">
                    Nama Anggota <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={anggota.nama}
                    onChange={(e) => handleAnggotaChange(idx, "nama", e.target.value)}
                    placeholder="Nama anggota keluarga..."
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-0.5">
                    Hubungan Keluarga
                  </label>
                  <select
                    value={anggota.hubungan}
                    onChange={(e) => handleAnggotaChange(idx, "hubungan", e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="Istri">Istri</option>
                    <option value="Suami">Suami</option>
                    <option value="Anak">Anak</option>
                    <option value="Orang Tua">Orang Tua</option>
                    <option value="Famili Lain">Famili Lain</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-0.5">
                    Usia (Tahun)
                  </label>
                  <input
                    type="number"
                    value={anggota.usia}
                    onChange={(e) => handleAnggotaChange(idx, "usia", e.target.value)}
                    placeholder="Usia..."
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-0.5">
                    NIK (Opsional)
                  </label>
                  <input
                    type="text"
                    maxLength={16}
                    value={anggota.nik}
                    onChange={(e) => handleAnggotaChange(idx, "nik", e.target.value.replace(/\D/g, ""))}
                    placeholder="16 digit..."
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-mono"
                  />
                </div>

                <div className="sm:col-span-1 flex justify-end pt-3 sm:pt-0">
                  <button
                    type="button"
                    onClick={() => handleRemoveAnggota(idx)}
                    className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition"
                    title="Hapus baris"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-2">
        <Link
          href={isEdit ? `/penghuni/${initialData?.id}` : "/penghuni"}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Batal</span>
        </Link>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-sky-700 hover:bg-sky-800 text-white font-semibold text-sm rounded-xl shadow-md transition disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? "Menyimpan Data..." : isEdit ? "Simpan Perubahan" : "Daftarkan Penghuni"}</span>
        </button>
      </div>
    </form>
  );
}
