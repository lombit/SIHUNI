export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Skeleton Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div className="space-y-2">
          <div className="h-7 w-64 bg-slate-200 rounded-xl" />
          <div className="h-4 w-96 max-w-full bg-slate-200/70 rounded-lg" />
        </div>
        <div className="h-9 w-36 bg-slate-200 rounded-xl self-start sm:self-auto" />
      </div>

      {/* Skeleton KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-3 w-24 bg-slate-200 rounded" />
              <div className="w-8 h-8 rounded-lg bg-slate-100" />
            </div>
            <div className="h-8 w-32 bg-slate-200 rounded-lg" />
            <div className="h-3 w-full bg-slate-100 rounded" />
          </div>
        ))}
      </div>

      {/* Skeleton Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="h-10 flex-1 bg-slate-100 rounded-xl" />
        <div className="h-10 w-40 bg-slate-100 rounded-xl" />
        <div className="h-10 w-24 bg-slate-200 rounded-xl" />
      </div>

      {/* Skeleton Table / Content Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden p-6 space-y-4">
        <div className="h-5 w-48 bg-slate-200 rounded" />
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5, 6].map((row) => (
            <div key={row} className="h-12 w-full bg-slate-50 border border-slate-100 rounded-xl flex items-center px-4 gap-4">
              <div className="w-16 h-5 bg-slate-200 rounded" />
              <div className="w-40 h-4 bg-slate-200/70 rounded" />
              <div className="flex-1 h-4 bg-slate-100 rounded hidden md:block" />
              <div className="w-24 h-5 bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
