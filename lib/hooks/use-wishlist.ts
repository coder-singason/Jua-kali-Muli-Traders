import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export function useWishlist() {
  return useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => {
      const response = await fetch("/api/wishlist");
      if (!response.ok) throw new Error("Failed to fetch wishlist");
      return response.json();
    },
    enabled: typeof window !== "undefined", // Only run on client
  });
}

export function useWishlistCheck(productId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["wishlist", "check", productId],
    queryFn: async () => {
      const response = await fetch(`/api/wishlist/check?productId=${productId}`);
      if (!response.ok) throw new Error("Failed to check wishlist");
      return response.json();
    },
    enabled,
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useToggleWishlist() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ productId, isInWishlist }: { productId: string; isInWishlist: boolean }) => {
      const url = isInWishlist
        ? `/api/wishlist?productId=${productId}`
        : "/api/wishlist";
      const method = isInWishlist ? "DELETE" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: isInWishlist ? undefined : JSON.stringify({ productId }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(error.error || error.details || "Failed to update wishlist");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch wishlist queries
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      queryClient.invalidateQueries({ queryKey: ["wishlist", "check", variables.productId] });

      toast({
        title: variables.isInWishlist ? "Removed from Wishlist" : "Added to Wishlist",
        description: variables.isInWishlist
          ? "Item removed from your wishlist"
          : "Item added to your wishlist",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update wishlist",
        variant: "destructive",
      });
    },
  });
}

