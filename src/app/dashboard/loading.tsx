function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-slate-200 rounded-xl ${className ?? ""}`} />
  );
}

function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-4 animate-pulse">
      <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-7 w-16" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

function ChartSkeleton({ label }: { label: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse">
      <Skeleton className="h-4 w-36 mb-4" />
      <Skeleton className={`w-full ${label}`} />
    </div>
  );
}

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-5 w-28" />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 pb-28 md:pb-8 space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ChartSkeleton label="h-48" />
          <ChartSkeleton label="h-48" />
        </div>
        <ChartSkeleton label="h-52" />

        {/* Authors/books list */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse space-y-3">
          <Skeleton className="h-4 w-32 mb-2" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-3 w-8" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
