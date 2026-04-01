function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-slate-200 rounded-xl ${className ?? ""}`} />
  );
}

function BookShelfSkeleton() {
  return (
    <div className="mb-8">
      {/* Section title */}
      <Skeleton className="h-5 w-32 mb-3 ml-4" />
      {/* Horizontal row of book cards */}
      <div className="flex gap-3 overflow-x-hidden px-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex-none w-[108px] animate-pulse">
            <Skeleton className="w-[108px] h-[160px] mb-2" />
            <Skeleton className="h-3 w-4/5 mb-1.5" />
            <Skeleton className="h-3 w-3/5" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ExploreLoading() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-5 w-24" />
        </div>
      </header>

      <div className="pt-4 pb-28">
        {Array.from({ length: 4 }).map((_, i) => (
          <BookShelfSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
