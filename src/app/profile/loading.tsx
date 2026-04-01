function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-slate-200 rounded-xl ${className ?? ""}`} />
  );
}

export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-xl" />
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="hidden md:block h-9 w-16 rounded-lg" />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 pb-28 md:pb-8">
        {/* Avatar placeholder */}
        <div className="flex flex-col items-center mb-8 mt-2 gap-3 animate-pulse">
          <Skeleton className="w-20 h-20 rounded-full" />
          <Skeleton className="h-4 w-40" />
        </div>

        {/* Form fields */}
        <div className="space-y-4 animate-pulse">
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-36" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <Skeleton className="h-10 w-full mt-2 rounded-xl" />
        </div>

        <Skeleton className="md:hidden h-10 w-full mt-8 rounded-xl" />
      </main>
    </div>
  );
}
