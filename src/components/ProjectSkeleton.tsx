
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ProjectSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-6 w-20" />
      </CardHeader>
      <CardContent className="p-4 pt-2 pb-2">
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="h-4 w-36" />
        </div>
        <Skeleton className="h-2 w-full" />
      </CardContent>
      <CardFooter className="p-4 pt-2 border-t flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-24" />
      </CardFooter>
    </Card>
  );
}
