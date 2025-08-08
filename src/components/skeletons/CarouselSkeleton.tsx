// components/skeleton.tsx
import { cn } from '@/utils/class';

export function CarouselSkeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('overflow-hidden rounded-md border', className)}
      {...props}
    >
      <div className="relative w-full aspect-[16/7] bg-gray-200 animate-pulse" />
      <div className="py-4 px-3 flex flex-col gap-2">
        <div className="h-5 bg-gray-200 rounded w-4/5 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
      </div>
    </div>
  );
}
