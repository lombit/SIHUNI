import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/frontend/components/layout/Providers";

export const metadata: Metadata = {
  title: "SIHUNI — Sistem Informasi Penghuni & Retribusi Rusunawa",
  description: "Prototipe Aksi Perubahan PKP — UPTD Rusunawa Purwakarta",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-slate-50 text-slate-900 min-h-screen antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
