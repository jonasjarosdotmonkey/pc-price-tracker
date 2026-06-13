import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded bg-surface-700 relative overflow-hidden",
        "after:absolute after:inset-0 after:bg-shimmer-gradient after:bg-[length:200%_100%] after:animate-shimmer",
        className
      )}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-surface-800 border border-surface-700 rounded-xl p-4 space-y-4">
      <Skeleton className="h-48 w-full rounded-lg" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Skeleton className="h-80 rounded-xl" />
      <div className="space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-16" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}
