function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-slate-200 rounded-xl ${className ?? ""}`} />
  );
}

export default function BookDetailLoading() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Skeleton className="h-8 w-24 rounded-lg" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20 rounded-lg" />
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 pb-28 md:pb-8">
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="flex flex-col sm:flex-row">
            {/* Cover */}
            <Skeleton className="sm:w-48 w-full h-64 sm:h-auto rounded-none shrink-0" />

            {/* Content */}
            <div className="flex-1 p-6 sm:p-8 space-y-4 animate-pulse">
              {/* Title + badge */}
              <div className="flex items-start justify-between gap-4">
                <Skeleton className="h-7 w-3/5" />
                <Skeleton className="h-6 w-20 rounded-full shrink-0" />
              </div>

              {/* Author */}
              <Skeleton className="h-4 w-2/5" />

              {/* Genre + rating */}
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>

              {/* Publisher metadata */}
              <div className="flex gap-4">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-20" />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>

              {/* Notes */}
              <div className="space-y-2 pt-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
                <Skeleton className="h-3 w-3/5" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
