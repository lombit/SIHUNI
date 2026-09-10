import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  baseUrl: string;
  searchParams?: Record<string, string | number | undefined>;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  baseUrl,
  searchParams = {},
}: PaginationProps) {
  if (totalPages <= 1) {
    return (
      <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
        <div>
          Menampilkan seluruh <strong>{totalItems}</strong> data
        </div>
      </div>
    );
  }

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, val]) => {
      if (val !== undefined && val !== "" && key !== "page") {
        params.set(key, String(val));
      }
    });
    if (page > 1) {
      params.set("page", String(page));
    }
    const qs = params.toString();
    return qs ? `${baseUrl}?${qs}` : baseUrl;
  };

  // Generate page numbers to show (max 5 visible)
  const pages: number[] = [];
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, startPage + 4);
  if (endPage - startPage < 4) {
    startPage = Math.max(1, endPage - 4);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="px-4 py-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 bg-slate-50/50">
      <div>
        Menampilkan <strong>{startItem}</strong> - <strong>{endItem}</strong> dari{" "}
        <strong>{totalItems}</strong> data
      </div>

      <div className="flex items-center gap-1.5">
        {/* Tombol Sebelumnya */}
        {currentPage > 1 ? (
          <Link
            href={createPageUrl(currentPage - 1)}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition flex items-center gap-1 font-medium"
            title="Halaman Sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Sebelumnya</span>
          </Link>
        ) : (
          <span className="p-1.5 rounded-lg border border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Sebelumnya</span>
          </span>
        )}

        {/* Nomor Halaman */}
        <div className="flex items-center gap-1">
          {startPage > 1 && (
            <>
              <Link
                href={createPageUrl(1)}
                className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 flex items-center justify-center font-medium transition"
              >
                1
              </Link>
              {startPage > 2 && <span className="px-1 text-slate-400">...</span>}
            </>
          )}

          {pages.map((p) => {
            const isCurrent = p === currentPage;
            return isCurrent ? (
              <span
                key={p}
                className="w-8 h-8 rounded-lg bg-sky-700 text-white font-bold flex items-center justify-center shadow-sm"
              >
                {p}
              </span>
            ) : (
              <Link
                key={p}
                href={createPageUrl(p)}
                className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-medium flex items-center justify-center transition"
              >
                {p}
              </Link>
            );
          })}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="px-1 text-slate-400">...</span>}
              <Link
                href={createPageUrl(totalPages)}
                className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 flex items-center justify-center font-medium transition"
              >
                {totalPages}
              </Link>
            </>
          )}
        </div>

        {/* Tombol Selanjutnya */}
        {currentPage < totalPages ? (
          <Link
            href={createPageUrl(currentPage + 1)}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition flex items-center gap-1 font-medium"
            title="Halaman Selanjutnya"
          >
            <span className="hidden sm:inline">Selanjutnya</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        ) : (
          <span className="p-1.5 rounded-lg border border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed flex items-center gap-1">
            <span className="hidden sm:inline">Selanjutnya</span>
            <ChevronRight className="w-4 h-4" />
          </span>
        )}
      </div>
    </div>
  );
}
