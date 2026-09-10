"use client";

import { Printer } from "lucide-react";

export function PrintButton({ label = "Cetak Dokumen" }: { label?: string }) {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 px-4 py-2 bg-sky-700 hover:bg-sky-800 active:bg-sky-900 text-white text-xs font-semibold rounded-xl shadow-md transition print:hidden"
    >
      <Printer className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
}
