"use client";

import { MessageSquare } from "lucide-react";
import { buatTautanWhatsAppTagihan } from "@/frontend/utils/whatsapp";

interface WhatsAppButtonProps {
  nama: string;
  noHp: string;
  unitNomor: string;
  periodeBulan: number;
  periodeTahun: number;
  jumlah: number;
  bulanMenunggak?: number;
  compact?: boolean;
}

export function WhatsAppButton({
  nama,
  noHp,
  unitNomor,
  periodeBulan,
  periodeTahun,
  jumlah,
  bulanMenunggak = 1,
  compact = false,
}: WhatsAppButtonProps) {
  const url = buatTautanWhatsAppTagihan({
    nama,
    noHp,
    unitNomor,
    periodeBulan,
    periodeTahun,
    jumlah,
    bulanMenunggak,
  });

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title={`Kirim pengingat WhatsApp ke ${nama} (${noHp})`}
      className={`inline-flex items-center gap-1 font-semibold rounded-lg border transition shadow-xs ${
        compact
          ? "px-2 py-1 text-[11px] bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-600"
          : "px-2.5 py-1.5 text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200"
      }`}
    >
      <MessageSquare className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
      <span>{compact ? "WA" : "Kirim WA"}</span>
    </a>
  );
}
