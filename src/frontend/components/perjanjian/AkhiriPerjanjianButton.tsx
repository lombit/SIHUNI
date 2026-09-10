"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, RefreshCw } from "lucide-react";

export function AkhiriPerjanjianButton({
  perjanjianId,
  nomorPerjanjian,
  unitNomor,
}: {
  perjanjianId: string;
  nomorPerjanjian: string;
  unitNomor: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAkhiri = async () => {
    if (
      !confirm(
        `Konfirmasi Pengakhiran Sewa:\n\nApakah Anda yakin ingin mengakhiri Perjanjian Sewa ${nomorPerjanjian} untuk Unit ${unitNomor}?\n\nSetelah diakhiri, status unit akan otomatis kembali menjadi KOSONG dan siap dihuni pemohon lain.`
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/perjanjian/${perjanjianId}/akhiri`, {
        method: "POST",
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Gagal mengakhiri perjanjian sewa");
      } else {
        router.refresh();
      }
    } catch {
      alert("Terjadi kesalahan koneksi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleAkhiri}
      disabled={loading}
      className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1.5 rounded-lg border border-rose-200 transition disabled:opacity-50"
      title="Akhiri sewa dan kembalikan unit ke status KOSONG"
    >
      {loading ? (
        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <LogOut className="w-3.5 h-3.5" />
      )}
      <span>Akhiri Sewa</span>
    </button>
  );
}
