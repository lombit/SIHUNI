import Link from "next/link";
import { PenghuniForm } from "@/frontend/components/penghuni/PenghuniForm";
import { ChevronLeft, UserPlus } from "lucide-react";

export const dynamic = "force-dynamic";

export default function BaruPenghuniPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/penghuni"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:text-sky-900 mb-2 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Kembali ke Data Penghuni</span>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
          <UserPlus className="w-7 h-7 text-sky-700" />
          <span>Pendaftaran Penghuni Baru</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Pengisian formulir pendaftaran standar RSN-01 untuk pencatatan kepala keluarga baru
        </p>
      </div>

      {/* Form */}
      <PenghuniForm />
    </div>
  );
}
