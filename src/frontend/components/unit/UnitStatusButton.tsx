"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wrench, CheckCircle, RefreshCw } from "lucide-react";

export function UnitStatusButton({
  unitId,
  currentStatus,
  isOccupied,
}: {
  unitId: string;
  currentStatus: string;
  isOccupied: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (isOccupied) return null;

  const nextStatus = currentStatus === "KOSONG" ? "PERBAIKAN" : "KOSONG";
  const buttonLabel =
    currentStatus === "KOSONG"
      ? "Tandai Dalam Perbaikan"
      : "Tandai Selesai / Siap Huni";

  const handleToggle = async () => {
    if (
      !confirm(
        `Apakah Anda yakin ingin mengubah status unit ini menjadi ${nextStatus}?`
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/unit/${unitId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Gagal mengubah status unit");
      } else {
        router.refresh();
      }
    } catch {
      alert("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition disabled:opacity-50 ${
        currentStatus === "KOSONG"
          ? "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
          : "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
      }`}
    >
      {loading ? (
        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
      ) : currentStatus === "KOSONG" ? (
        <Wrench className="w-3.5 h-3.5 text-amber-600" />
      ) : (
        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
      )}
      <span>{buttonLabel}</span>
    </button>
  );
}
