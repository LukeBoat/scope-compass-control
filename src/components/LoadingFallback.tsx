import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingFallback() {
  return (
    <div className="container mx-auto p-6 space-y-6" role="status" aria-label="Loading project details">
      <Skeleton className="h-12 w-[250px]" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-4 w-[150px]" />
      </div>
      <Skeleton className="h-[200px] w-full" />
    </div>
  );
} 