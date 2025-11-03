"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

interface ProductViewTrackerProps {
  productId: string;
}

export function ProductViewTracker({ productId }: ProductViewTrackerProps) {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user?.id && productId) {
      // Track product view
      fetch(`/api/products/${productId}/viewed`, {
        method: "POST",
      }).catch((error) => {
        console.error("Error tracking product view:", error);
      });
    }
  }, [session, productId]);

  return null;
}

