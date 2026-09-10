"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export function HapusPenghuniButton({
  penghuniId,
  nama,
  hasActiveLease,
}: {
  penghuniId: string;
  nama: string;
  hasActiveLease: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (hasActiveLease) {
      alert(
        "Penghuni ini masih memiliki perjanjian sewa aktif! Akhiri perjanjian sewa terlebih dahulu sebelum menghapus data penghuni."
      );
      return;
    }

    if (
      !confirm(
        `Apakah Anda yakin ingin menghapus data penghuni "${nama}" secara permanen? Aksi ini tidak dapat dibatalkan.`
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/penghuni/${penghuniId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Gagal menghapus data penghuni.");
      } else {
        router.push("/penghuni");
        router.refresh();
      }
    } catch {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading || hasActiveLease}
      className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition ${
        hasActiveLease
          ? "opacity-50 cursor-not-allowed bg-slate-50 text-slate-400 border-slate-200"
          : "text-rose-700 bg-rose-50 hover:bg-rose-100 border-rose-200"
      }`}
      title={hasActiveLease ? "Tidak dapat dihapus karena masih ada sewa aktif" : "Hapus penghuni"}
    >
      <Trash2 className="w-3.5 h-3.5" />
      <span>{loading ? "Menghapus..." : "Hapus Penghuni"}</span>
    </button>
  );
}
