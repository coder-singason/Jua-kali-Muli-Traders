"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { ProductCard } from "./ProductCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History } from "lucide-react";

interface RecentlyViewedProps {
  currentProductId?: string;
  limit?: number;
}

export function RecentlyViewed({
  currentProductId,
  limit = 4,
}: RecentlyViewedProps) {
  const { data: session } = useSession();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchRecentlyViewed();
    } else {
      setLoading(false);
    }
  }, [session, currentProductId]);

  const fetchRecentlyViewed = async () => {
    try {
      const response = await fetch("/api/recently-viewed");
      if (response.ok) {
        const data = await response.json();
        // Filter out current product and limit results
        const filtered = data
          .filter((item: any) => item.product.id !== currentProductId)
          .slice(0, limit)
          .map((item: any) => item.product);
        setProducts(filtered);
      }
    } catch (error) {
      console.error("Error fetching recently viewed:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!session || loading || products.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Recently Viewed
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

