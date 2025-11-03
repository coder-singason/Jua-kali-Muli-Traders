"use client";

import { useSession } from "next-auth/react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useWishlistCheck, useToggleWishlist } from "@/lib/hooks/use-wishlist";

interface WishlistButtonProps {
  productId: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function WishlistButton({
  productId,
  className,
  size = "md",
}: WishlistButtonProps) {
  const { data: session } = useSession();
  const { data: wishlistCheck, isLoading: checking } = useWishlistCheck(
    productId,
    !!session?.user?.id
  );
  const toggleWishlist = useToggleWishlist();

  const isInWishlist = wishlistCheck?.inWishlist || false;
  const loading = toggleWishlist.isPending;

  const handleToggleWishlist = () => {
    if (!session) {
      // Toast will be shown by the mutation error handler
      return;
    }

    toggleWishlist.mutate({
      productId,
      isInWishlist,
    });
  };

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  const iconSizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  if (checking) {
    return (
      <Button
        variant="outline"
        size="icon"
        className={cn(sizeClasses[size], className)}
        disabled
      >
        <LoadingSpinner size="sm" />
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn(sizeClasses[size], className)}
      onClick={handleToggleWishlist}
      disabled={loading || checking}
      title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
    >
      {loading ? (
        <LoadingSpinner size="sm" />
      ) : (
        <Heart
          className={cn(
            iconSizeClasses[size],
            isInWishlist
              ? "fill-red-500 text-red-500"
              : "text-muted-foreground"
          )}
        />
      )}
    </Button>
  );
}

