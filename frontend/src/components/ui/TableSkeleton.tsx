import { Skeleton } from "./Skeleton";

export function TableSkeleton({ rows = 5, columns = 5 }) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-8 w-64" /> {/* Title/Search */}
        <Skeleton className="h-8 w-32" /> {/* Button */}
      </div>
      <div className="border border-slate-100 rounded-xl overflow-hidden bg-white">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex gap-4">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}
        </div>
        <div className="divide-y divide-slate-100">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="p-4 flex gap-4 bg-white">
              {Array.from({ length: columns }).map((_, j) => (
                <Skeleton key={j} className="h-5 w-full" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
