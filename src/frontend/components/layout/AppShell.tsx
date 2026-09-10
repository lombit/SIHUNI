"use client";

import { Suspense, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { NavigationProgress } from "./NavigationProgress";
import { AlertTriangle } from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col">
      <Suspense fallback={null}>
        <NavigationProgress />
      </Suspense>

      {/* Sidebar Navigation (Desktop + Mobile Drawer) */}
      <Sidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Banner Peringatan Data Fiktif PKP */}
        <div className="bg-amber-50 border-b border-amber-200/80 px-4 py-2 text-amber-900 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-medium">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>
              <strong>PROTOTIPE AKSI PERUBAHAN PKP:</strong> Seluruh data penghuni, unit, dan retribusi adalah simulasi fiktif untuk UPTD Rusunawa Purwakarta.
            </span>
          </div>
          <span className="hidden sm:inline-block text-[11px] bg-amber-200/70 text-amber-900 px-2 py-0.5 rounded font-mono font-bold">
            v1.0-DEMO
          </span>
        </div>

        {/* Top Header Bar */}
        <Header onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white/50 px-6 py-4 text-center text-xs text-slate-400">
          <p>
            SIHUNI &copy; 2026 UPTD Rusunawa &bull; Dinas Perumahan dan Kawasan Permukiman Kabupaten Purwakarta
          </p>
        </footer>
      </div>
    </div>
  );
}
