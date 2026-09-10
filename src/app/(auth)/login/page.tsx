"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Building2, ShieldCheck, UserCheck, Eye, EyeOff, Lock, User, AlertCircle, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        username,
        password,
      });

      if (res?.error) {
        setError("Nama pengguna atau kata sandi tidak valid.");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("Terjadi kesalahan jaringan saat proses masuk.");
    } finally {
      setLoading(false);
    }
  };

  const setDemoUser = (u: string) => {
    setUsername(u);
    setPassword("sihuni123");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 flex flex-col justify-center items-center px-4 py-8">
      {/* Banner PKP */}
      <div className="mb-6 px-4 py-2 bg-sky-500/10 border border-sky-400/20 rounded-full text-sky-200 text-xs sm:text-sm font-medium flex items-center gap-2 backdrop-blur">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>Aksi Perubahan PKP — UPTD Rusunawa Purwakarta</span>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100">
        {/* Header Instansi */}
        <div className="bg-gradient-to-r from-sky-800 to-indigo-900 px-6 py-8 text-white text-center relative">
          <div className="w-16 h-16 bg-white/10 rounded-2xl mx-auto flex items-center justify-center mb-3 shadow-inner border border-white/20">
            <Building2 className="w-8 h-8 text-sky-200" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">SIHUNI</h1>
          <p className="text-xs text-sky-200 uppercase tracking-widest mt-1 font-semibold">
            Sistem Informasi Penghuni & Retribusi Rusunawa
          </p>
          <p className="text-xs text-slate-300 mt-2">
            Dinas Perumahan & Kawasan Permukiman Kab. Purwakarta
          </p>
        </div>

        {/* Form Login */}
        <div className="p-6 sm:p-8">
          {error && (
            <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-700 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Nama Pengguna (Username)
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin / petugas / pimpinan"
                  className="w-full pl-11 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-slate-50 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-slate-50 focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-sky-700 hover:bg-sky-800 active:bg-sky-900 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 text-sm disabled:opacity-50 mt-2"
            >
              {loading ? (
                <span>Memproses Masuk...</span>
              ) : (
                <>
                  <span>Masuk ke Sistem</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Akses Cepat Akun Demo */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5 text-center">
              Pilih Akun Demo (Sandi: <span className="font-mono text-sky-700">sihuni123</span>)
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDemoUser("petugas")}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-sky-500 hover:bg-sky-50/50 transition text-center group"
              >
                <UserCheck className="w-4 h-4 text-sky-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-semibold text-slate-800">Petugas</div>
                <div className="text-[10px] text-slate-400">Operasional</div>
              </button>

              <button
                type="button"
                onClick={() => setDemoUser("pimpinan")}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition text-center group"
              >
                <ShieldCheck className="w-4 h-4 text-indigo-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-semibold text-slate-800">Pimpinan</div>
                <div className="text-[10px] text-slate-400">Dasbor & Laporan</div>
              </button>

              <button
                type="button"
                onClick={() => setDemoUser("admin")}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition text-center group"
              >
                <Lock className="w-4 h-4 text-emerald-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-semibold text-slate-800">Admin</div>
                <div className="text-[10px] text-slate-400">Akses Penuh</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 text-center text-xs text-slate-400">
          Prototipe Versi 1.0 — Data Tersimpan Lokal (SQLite)
        </div>
      </div>
    </div>
  );
}
