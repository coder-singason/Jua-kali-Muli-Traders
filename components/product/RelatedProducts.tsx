"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "./ProductCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";

interface RelatedProductsProps {
  productId: string;
  categoryId: string;
  limit?: number;
}

export function RelatedProducts({
  productId,
  categoryId,
  limit = 4,
}: RelatedProductsProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRelatedProducts();
  }, [productId, categoryId]);

  const fetchRelatedProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/products/related?productId=${productId}&categoryId=${categoryId}&limit=${limit}`
      );
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Error fetching related products:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || products.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Related Products
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

