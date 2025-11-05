import { Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductImageFallbackProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function ProductImageFallback({ 
  className, 
  size = "md" 
}: ProductImageFallbackProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  return (
    <div className={cn(
      "flex items-center justify-center bg-muted",
      className
    )}>
      <Package className={cn(
        "text-muted-foreground",
        sizeClasses[size]
      )} />
    </div>
  );
}


