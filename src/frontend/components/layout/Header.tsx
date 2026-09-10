"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import {
  Menu,
  Shield,
  LogOut,
  Calendar,
  Building,
  Bell,
  Sparkles,
} from "lucide-react";
import { PERAN_LABEL, Peran } from "@/types";

interface HeaderProps {
  onOpenMobileMenu?: () => void;
}

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  "/": {
    title: "Dasbor Ringkasan",
    subtitle: "Ringkasan metrik okupansi, retribusi, dan tiket pengaduan",
  },
  "/unit": {
    title: "Master Data Unit",
    subtitle: "Daftar unit hunian Tower A & B beserta status keterisian",
  },
  "/penghuni": {
    title: "Master Data Penghuni",
    subtitle: "Biodata kepala keluarga dan anggota keluarga (RSN-01)",
  },
  "/penghuni/baru": {
    title: "Tambah Penghuni Baru",
    subtitle: "Formulir pendaftaran penghuni baru (RSN-01)",
  },
  "/perjanjian": {
    title: "Perjanjian Sewa",
    subtitle: "Surat Perjanjian Sewa (SPS) dan masa sewa unit",
  },
  "/perjanjian/baru": {
    title: "Penerbitan Sewa Baru",
    subtitle: "Penerbitan Surat Perjanjian Sewa unit hunian",
  },
  "/tagihan": {
    title: "Tagihan & Retribusi",
    subtitle: "Rekonsiliasi pembayaran sewa bulanan dan setoran kas daerah",
  },
  "/pengaduan": {
    title: "Pengaduan Gangguan",
    subtitle: "Monitoring tiket aduan fasilitas dengan penegakan batas waktu SLA",
  },
  "/pengaduan/baru": {
    title: "Buat Tiket Pengaduan",
    subtitle: "Formulir laporan gangguan fasilitas rusunawa (RSN-03)",
  },
  "/laporan": {
    title: "Laporan & Rekapitulasi",
    subtitle: "Konsolidasi penerimaan retribusi, piutang, dan kinerja layanan",
  },
  "/pengaturan/log": {
    title: "Log Jejak Audit",
    subtitle: "Rekam jejak seluruh mutasi data untuk akuntabilitas sistem",
  },
};

export function Header({ onOpenMobileMenu }: HeaderProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const peran = (session?.user as any)?.peran as Peran | undefined;

  // Match title
  const pageMeta =
    PAGE_TITLES[pathname] ||
    (pathname.startsWith("/unit/")
      ? { title: "Detail Unit Hunian", subtitle: "Informasi spesifikasi dan riwayat sewa unit" }
      : pathname.startsWith("/penghuni/")
      ? { title: "Detail Penghuni", subtitle: "Lembar biodata penghuni dan anggota keluarga" }
      : pathname.startsWith("/pengaduan/")
      ? { title: "Detail Pengaduan", subtitle: "Lembar tindak lanjut dan penanganan teknisi" }
      : { title: "SIHUNI", subtitle: "Sistem Informasi Penghuni & Retribusi Rusunawa" });

  const hariIni = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Sisi Kiri: Tombol Menu Mobile & Judul Halaman */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition flex-shrink-0"
            aria-label="Buka Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight truncate">
              {pageMeta.title}
            </h2>
            <p className="text-xs text-slate-500 hidden sm:block truncate mt-0.5">
              {pageMeta.subtitle}
            </p>
          </div>
        </div>

        {/* Sisi Kanan: Status & Akun Pengguna */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 flex-shrink-0">
          {/* Tanggal Hari Ini (Desktop) */}
          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <Calendar className="w-3.5 h-3.5 text-sky-700" />
            <span className="font-medium capitalize">{hariIni}</span>
          </div>

          {/* User Profile Pill */}
          <div className="flex items-center gap-2 pl-2 sm:border-l sm:border-slate-200">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "U"}
            </div>

            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-slate-800 leading-tight">
                {session?.user?.name || "Pengguna"}
              </div>
              <div className="text-[10px] font-medium text-sky-700 flex items-center gap-1">
                <Shield className="w-2.5 h-2.5" />
                <span>{peran ? PERAN_LABEL[peran] : "Memuat..."}</span>
              </div>
            </div>

            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
              title="Keluar (Logout)"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
