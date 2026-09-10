"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  Receipt,
  AlertCircle,
  BarChart3,
  History,
  LogOut,
  X,
  Shield,
  Building,
  ChevronRight,
} from "lucide-react";
import { PERAN_LABEL, Peran } from "@/types";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const peran = (session?.user as any)?.peran as Peran | undefined;

  const semuaNav = [
    {
      label: "Dasbor",
      href: "/",
      icon: LayoutDashboard,
      roles: ["ADMIN", "PETUGAS", "PIMPINAN"],
      badge: null,
    },
    {
      label: "Unit Hunian",
      href: "/unit",
      icon: Building2,
      roles: ["ADMIN", "PETUGAS"],
      badge: "200 Unit",
    },
    {
      label: "Data Penghuni",
      href: "/penghuni",
      icon: Users,
      roles: ["ADMIN", "PETUGAS"],
      badge: null,
    },
    {
      label: "Perjanjian Sewa",
      href: "/perjanjian",
      icon: FileText,
      roles: ["ADMIN", "PETUGAS"],
      badge: null,
    },
    {
      label: "Tagihan & Retribusi",
      href: "/tagihan",
      icon: Receipt,
      roles: ["ADMIN", "PETUGAS"],
      badge: null,
    },
    {
      label: "Pengaduan Gangguan",
      href: "/pengaduan",
      icon: AlertCircle,
      roles: ["ADMIN", "PETUGAS"],
      badge: null,
    },
    {
      label: "Laporan & Rekap",
      href: "/laporan",
      icon: BarChart3,
      roles: ["ADMIN", "PETUGAS", "PIMPINAN"],
      badge: null,
    },
    {
      label: "Log Jejak Audit",
      href: "/pengaturan/log",
      icon: History,
      roles: ["ADMIN"],
      badge: "Admin",
    },
  ];

  const navigasiTersedia = semuaNav.filter(
    (item) => !peran || item.roles.includes(peran)
  );

  return (
    <>
      {/* Backdrop for mobile drawer */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-200"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="px-5 py-5 border-b border-slate-800/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-950">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-extrabold text-white tracking-tight leading-none">
                SIHUNI
              </div>
              <div className="text-[11px] text-sky-400 font-semibold tracking-wide mt-1">
                UPTD Rusunawa
              </div>
              <div className="text-[10px] text-slate-400 leading-tight">
                Kabupaten Purwakarta
              </div>
            </div>
          </div>

          {/* Close button inside mobile drawer */}
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Menu Operasional
          </div>

          {navigasiTersedia.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-[0.98] cursor-pointer ${
                  isActive
                    ? "bg-sky-600 text-white shadow-md shadow-sky-950 font-semibold"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/80 active:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 flex-shrink-0 transition-colors ${
                      isActive ? "text-white" : "text-slate-400 group-hover:text-sky-300"
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge ? (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium ${
                      isActive
                        ? "bg-sky-700/80 text-white"
                        : "bg-slate-800 text-slate-400 group-hover:text-slate-200"
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : isActive ? (
                  <ChevronRight className="w-3.5 h-3.5 text-sky-200" />
                ) : null}
              </Link>
            );
          })}
        </div>

        {/* User Card & Logout */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60">
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-sky-900 border border-sky-600/40 flex items-center justify-center text-sky-200 font-bold text-xs flex-shrink-0">
                {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-white truncate">
                  {session?.user?.name || "Pengguna"}
                </div>
                <div className="text-[10px] text-sky-300 font-medium flex items-center gap-1">
                  <Shield className="w-3 h-3 text-sky-400 flex-shrink-0" />
                  <span className="truncate">{peran ? PERAN_LABEL[peran] : "Memuat..."}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full mt-1 py-1.5 px-3 rounded-lg text-xs font-semibold text-rose-300 hover:text-white hover:bg-rose-900/50 border border-rose-800/30 transition flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar (Logout)</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
