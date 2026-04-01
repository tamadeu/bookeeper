function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-slate-200 rounded-xl ${className ?? ""}`} />
  );
}

function BookCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 flex gap-4 animate-pulse">
      <Skeleton className="w-16 h-24 shrink-0 rounded-xl" />
      <div className="flex-1 min-w-0 space-y-2.5 py-1">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Skeleton className="h-7 w-32" />
          <div className="hidden md:flex gap-2">
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-36" />
          </div>
          <Skeleton className="md:hidden h-9 w-9 rounded-lg" />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-5 pb-28 md:pb-8">
        {/* Stats row */}
        <div className="flex md:grid md:grid-cols-4 gap-3 mb-6 overflow-x-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-slate-200 p-4 shrink-0 w-28 md:w-auto animate-pulse space-y-2"
            >
              <Skeleton className="h-7 w-8 mx-auto" />
              <Skeleton className="h-3 w-12 mx-auto" />
            </div>
          ))}
        </div>

        {/* Search bar */}
        <Skeleton className="h-10 w-full mb-6 rounded-xl" />

        {/* Book cards */}
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <BookCardSkeleton key={i} />
          ))}
        </div>
      </main>
    </div>
  );
}
