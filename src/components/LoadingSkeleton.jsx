export function SkeletonCard({ className = "" }) {
  return (
    <div className={`bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden ${className}`}>
      <div className="animate-pulse p-4 space-y-3">
        <div className="h-4 bg-slate-800 rounded-lg w-1/3" />
        <div className="h-3 bg-slate-800 rounded-lg w-2/3" />
        <div className="h-3 bg-slate-800 rounded-lg w-1/2" />
      </div>
    </div>
  );
}

export function SkeletonRow({ className = "" }) {
  return (
    <div className={`flex items-center gap-3 p-3 animate-pulse ${className}`}>
      <div className="w-14 h-14 rounded-xl bg-slate-800 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-slate-800 rounded-lg w-3/4" />
        <div className="h-2.5 bg-slate-800 rounded-lg w-1/2" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 3 }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse bg-slate-900/50 rounded-2xl p-3 border border-slate-800">
          <div className="w-8 h-8 bg-slate-800 rounded-lg mb-2" />
          <div className="h-5 bg-slate-800 rounded-lg w-1/2 mb-1" />
          <div className="h-2.5 bg-slate-800 rounded-lg w-3/4" />
        </div>
      ))}
    </div>
  );
}

// Full-page loading skeleton (used by React.lazy Suspense)
export default function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="w-full max-w-md px-6 space-y-4 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-6 w-32 bg-slate-800 rounded-lg" />
            <div className="h-3 w-20 bg-slate-800/50 rounded" />
          </div>
          <div className="w-10 h-10 bg-slate-800 rounded-xl" />
        </div>
        <div className="h-32 bg-slate-900 rounded-2xl border border-slate-800" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-24 bg-slate-900 rounded-2xl border border-slate-800" />
          <div className="h-24 bg-slate-900 rounded-2xl border border-slate-800" />
        </div>
        <div className="h-48 bg-slate-900 rounded-2xl border border-slate-800" />
      </div>
    </div>
  );
}

