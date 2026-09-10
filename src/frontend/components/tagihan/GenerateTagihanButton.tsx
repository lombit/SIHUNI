"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { NAMA_BULAN } from "@/frontend/utils/format";

export function GenerateTagihanButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "info" | "error"; text: string } | null>(null);

  const sekarang = new Date();
  const bulanIni = sekarang.getMonth() + 1;
  const tahunIni = sekarang.getFullYear();

  const handleGenerate = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/tagihan/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bulan: bulanIni, tahun: tahunIni }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({
          type: "error",
          text: data.error || "Gagal membuat tagihan.",
        });
      } else {
        if (data.dibuat > 0) {
          setMessage({
            type: "success",
            text: `Berhasil menerbitkan ${data.dibuat} tagihan baru untuk periode ${NAMA_BULAN[bulanIni]} ${tahunIni}.`,
          });
        } else {
          setMessage({
            type: "info",
            text: `Tagihan periode ${NAMA_BULAN[bulanIni]} ${tahunIni} sudah dibuat sebelumnya. (${data.dilewati} perjanjian aktif sudah memiliki tagihan).`,
          });
        }
        router.refresh();
      }
    } catch {
      setMessage({
        type: "error",
        text: "Terjadi kesalahan jaringan saat proses pembuatan tagihan.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-700 hover:bg-sky-800 active:bg-sky-900 text-white font-semibold text-sm rounded-xl shadow-sm transition disabled:opacity-50"
      >
        {loading ? (
          <RefreshCw className="w-4 h-4 animate-spin" />
        ) : (
          <PlusCircle className="w-4 h-4" />
        )}
        <span>{loading ? "Memproses Tagihan..." : "Buat Tagihan Bulan Ini"}</span>
      </button>

      {message && (
        <div
          className={`p-2.5 px-3 rounded-lg text-xs font-medium flex items-center gap-2 max-w-md ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : message.type === "info"
              ? "bg-sky-50 text-sky-800 border border-sky-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {message.type === "error" ? (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}
    </div>
  );
}
