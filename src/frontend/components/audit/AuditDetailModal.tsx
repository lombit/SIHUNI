"use client";

import { useState } from "react";
import { Eye, X } from "lucide-react";
import { formatTanggalWaktu } from "@/frontend/utils/format";

interface AuditDetailProps {
  log: {
    id: string;
    entitas: string;
    entitasId: string;
    aksi: string;
    userId: string;
    waktu: Date | string;
    sebelum: string | null;
    sesudah: string | null;
  };
}

export function AuditDetailModal({ log }: AuditDetailProps) {
  const [isOpen, setIsOpen] = useState(false);

  let sebelumParsed: any = null;
  let sesudahParsed: any = null;

  try {
    if (log.sebelum) sebelumParsed = JSON.parse(log.sebelum);
  } catch {}

  try {
    if (log.sesudah) sesudahParsed = JSON.parse(log.sesudah);
  } catch {}

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 px-2.5 py-1.5 rounded-lg border border-sky-200 transition"
      >
        <Eye className="w-3.5 h-3.5" />
        <span>Rincian</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-slate-900 to-sky-950 p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Rincian Perubahan Log Audit</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Entitas: {log.entitas} • Aksi: {log.aksi} • {formatTanggalWaktu(log.waktu)}
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block">ID Entitas:</span>
                  <span className="font-mono font-bold text-slate-800">{log.entitasId}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Pelaksana Mutasi (User ID):</span>
                  <span className="font-mono font-bold text-slate-800">{log.userId}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    <span>Nilai Sebelum (Original)</span>
                  </div>
                  <pre className="p-3 bg-slate-950 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto border border-slate-800 min-h-[140px]">
                    {sebelumParsed
                      ? JSON.stringify(sebelumParsed, null, 2)
                      : log.sebelum || "// Tidak ada nilai sebelum (data baru)"}
                  </pre>
                </div>

                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Nilai Sesudah (Mutasi)</span>
                  </div>
                  <pre className="p-3 bg-slate-950 text-sky-400 font-mono text-xs rounded-xl overflow-x-auto border border-slate-800 min-h-[140px]">
                    {sesudahParsed
                      ? JSON.stringify(sesudahParsed, null, 2)
                      : log.sesudah || "// Data dihapus"}
                  </pre>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
