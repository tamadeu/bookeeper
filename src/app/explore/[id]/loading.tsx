function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-slate-200 rounded-xl ${className ?? ""}`} />
  );
}

export default function ExploreBookDetailLoading() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Skeleton className="w-9 h-9 rounded-xl shrink-0" />
          <Skeleton className="h-4 w-40" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6 animate-pulse">
        {/* Hero */}
        <div className="flex gap-5">
          <Skeleton className="w-28 h-[168px] rounded-xl shrink-0" />
          <div className="flex-1 pt-1 space-y-3">
            <Skeleton className="h-5 w-4/5" />
            <Skeleton className="h-4 w-3/5" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-10 w-full rounded-xl mt-4" />
          </div>
        </div>

        {/* Metadata card */}
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <Skeleton className="w-4 h-4 rounded shrink-0" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-20 mb-1" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className={`h-3 ${i === 4 ? "w-3/5" : "w-full"}`} />
          ))}
        </div>
      </main>
    </div>
  );
}
