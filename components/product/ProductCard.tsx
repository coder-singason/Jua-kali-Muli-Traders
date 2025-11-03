"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Product } from "@prisma/client";
import { Star, Package, ShoppingCart, Eye, X } from "lucide-react";
import { useCartStore } from "@/lib/stores/cart-store";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface ProductCardProps {
  product: Product & {
    category: { name: string; slug: string };
    sizes: { size: string; stock: number }[];
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const imageUrl = product.images[0] || "/placeholder-shoe.jpg";
  const hasStock = product.sizes.some((size) => size.stock > 0);
  const availableSizes = product.sizes.filter((size) => size.stock > 0);
  const [isAdding, setIsAdding] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const addToCart = useCartStore((state) => state.addItem);
  const { toast } = useToast();

  const handleCardClick = () => {
    router.push(`/products/${product.id}`);
  };

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!hasStock) {
      toast({
        title: "Out of Stock",
        description: "This product is currently out of stock",
        variant: "destructive",
      });
      return;
    }

    if (availableSizes.length === 0) {
      toast({
        title: "Out of Stock",
        description: "No sizes available",
        variant: "destructive",
      });
      return;
    }

    // If only one size, add directly
    if (availableSizes.length === 1) {
      setIsAdding(true);
      await new Promise((resolve) => setTimeout(resolve, 400));

      addToCart({
        productId: product.id,
        size: availableSizes[0].size,
        quantity: 1,
        price: Number(product.price),
        name: product.name,
        image: imageUrl,
      });

      setIsAdding(false);
      toast({
        title: "Added to Cart",
        description: `${product.name} (Size: ${availableSizes[0].size}) added to cart`,
      });
      return;
    }

    // Multiple sizes - show quick add menu
    setShowQuickAdd(true);
  };

  const handleSizeSelect = async (size: string) => {
    setIsAdding(true);
    setShowQuickAdd(false);
    
    await new Promise((resolve) => setTimeout(resolve, 400));

    addToCart({
      productId: product.id,
      size: size,
      quantity: 1,
      price: Number(product.price),
      name: product.name,
      image: imageUrl,
    });

    setIsAdding(false);
    toast({
      title: "Added to Cart",
      description: `${product.name} (Size: ${size}) added to cart`,
    });
  };

  return (
    <div className="group relative">
      <Card className="h-full overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer" onClick={handleCardClick}>
        <div className="relative aspect-square w-full overflow-hidden bg-muted">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            loading="lazy"
          />
          {product.featured && (
            <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground shadow-md">
              <Star className="h-3 w-3 fill-current" />
              Featured
            </div>
          )}
          {!hasStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
              <div className="rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground">
                Out of Stock
              </div>
            </div>
          )}
          
          {/* Quick Add Button - Appears on Hover */}
          {hasStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm opacity-0 transition-opacity group-hover:opacity-100">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuickAdd(e);
                  }}
                  disabled={isAdding}
                  className="rounded-full"
                >
                  {isAdding ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Quick Add
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCardClick();
                  }}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </Button>
              </div>
            </div>
          )}
        </div>
        <CardContent className="flex flex-col p-4">
          <div className="flex-1">
            <h3 className="font-semibold text-base leading-tight line-clamp-2 mb-1">
              {product.name}
            </h3>
            {product.brand && (
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <Package className="h-3 w-3" />
                {product.brand}
              </p>
            )}
          </div>
          <div className="mt-auto flex items-center justify-between pt-2">
            <span className="text-lg font-bold">
              KSh {Number(product.price).toLocaleString()}
            </span>
            {hasStock && (
              <span className="text-xs text-muted-foreground">
                In Stock
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Add Size Selection Modal */}
      {showQuickAdd && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          onClick={() => setShowQuickAdd(false)}
        >
          <Card
            className="w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Select Size</h3>
                  <p className="text-sm text-muted-foreground">{product.name}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowQuickAdd(false)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-4">
                {availableSizes.map((size) => (
                  <Button
                    key={size.size}
                    variant="outline"
                    className="h-14 rounded-lg flex flex-col items-center justify-center hover:border-primary hover:bg-primary/10 transition-all"
                    onClick={() => handleSizeSelect(size.size)}
                    disabled={isAdding || size.stock === 0}
                  >
                    <span className="font-semibold">{size.size}</span>
                    <span className="text-xs text-muted-foreground">
                      {size.stock} left
                    </span>
                  </Button>
                ))}
              </div>
              {isAdding && (
                <div className="flex items-center justify-center py-2">
                  <LoadingSpinner size="sm" className="mr-2" />
                  <span className="text-sm text-muted-foreground">Adding...</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
