"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ProductActions } from "@/components/admin/ProductActions";

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  stock: number;
  featured: boolean;
  category: {
    name: string;
  };
}

interface ProductsListProps {
  products: Product[];
}

export function ProductsList({ products: initialProducts }: ProductsListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) {
      params.set("search", search.trim());
    }
    router.push(`/admin/products?${params.toString()}`);
  };

  const clearSearch = () => {
    setSearch("");
    router.push("/admin/products");
  };

  // Filter products client-side if search is provided
  const filteredProducts = search.trim()
    ? initialProducts.filter((product) =>
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.category.name.toLowerCase().includes(search.toLowerCase())
      )
    : initialProducts;

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by product name or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            {search && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={clearSearch}
                title="Clear search"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <Button type="submit">Search</Button>
          </form>
        </CardContent>
      </Card>

      {/* Products List */}
      {filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {search ? "No products found matching your search." : "No products yet."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="hover:shadow-md hover:bg-muted/30 dark:hover:bg-muted/20 transition-all">
              <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
                {product.images[0] && (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      KSh {Number(product.price).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {product.category.name}
                    </p>
                  </div>
                  <ProductActions product={product} />
                </div>
                <div className="mt-4 flex gap-2">
                  <Link href={`/admin/products/${product.id}/edit`} className="flex-1">
                    <Button variant="outline" className="w-full" size="sm">
                      Edit
                    </Button>
                  </Link>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Stock: {product.stock} | Featured: {product.featured ? "Yes" : "No"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

