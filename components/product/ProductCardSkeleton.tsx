import { Card, CardContent } from "@/components/ui/card";

export function ProductCardSkeleton() {
  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <div className="relative aspect-square w-full overflow-hidden bg-muted animate-pulse" />
      <CardContent className="flex flex-col flex-1 p-4 space-y-3">
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
          <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
        </div>
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="h-6 bg-muted rounded w-24 animate-pulse" />
        </div>
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <div className="h-9 bg-muted rounded flex-1 animate-pulse" />
          <div className="h-9 bg-muted rounded flex-1 animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}

