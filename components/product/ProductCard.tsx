"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Product } from "@prisma/client";
import { Star, Package, ShoppingCart, Eye, Heart, X } from "lucide-react";
import { useCartStore } from "@/lib/stores/cart-store";
import { useToast } from "@/hooks/use-toast";
import { useState, memo, useMemo } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { WishlistButton } from "./WishlistButton";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product & {
    category: { name: string; slug: string };
    sizes: { size: string; stock: number }[];
  };
}

export const ProductCard = memo(function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const imageUrl = useMemo(() => product.images[0] || "/placeholder-shoe.jpg", [product.images]);
  const hasStock = useMemo(() => product.sizes.some((size) => size.stock > 0), [product.sizes]);
  const availableSizes = useMemo(() => product.sizes.filter((size) => size.stock > 0), [product.sizes]);
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
    <>
      <Card className="group relative h-full flex flex-col overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1">
        {/* Image Section */}
        <div className="relative aspect-square w-full overflow-hidden bg-muted">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            loading="lazy"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//9k="
          />
          
          {/* Top Badges - Always Visible */}
          <div className="absolute top-2 left-2 right-2 flex items-start justify-between gap-2 z-10">
            <div className="flex items-center gap-2 flex-wrap">
              {product.featured && (
                <div className="flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground shadow-md">
                  <Star className="h-3 w-3 fill-current" />
                  <span className="hidden sm:inline">Featured</span>
                </div>
              )}
            </div>
            <WishlistButton 
              productId={product.id} 
              size="sm" 
              className="bg-background/95 backdrop-blur-sm shadow-md hover:bg-background transition-all" 
            />
          </div>

          {/* Out of Stock Overlay */}
          {!hasStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/90 backdrop-blur-sm z-20">
              <div className="rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground">
                Out of Stock
              </div>
            </div>
          )}
        </div>

        {/* Content Section */}
        <CardContent className="flex flex-col flex-1 p-4 space-y-3">
          {/* Product Info */}
          <div className="flex-1 space-y-2">
            <h3 
              className="font-semibold text-base leading-tight line-clamp-2 cursor-pointer hover:text-primary transition-colors font-sf-pro"
              onClick={handleCardClick}
            >
              {product.name}
            </h3>
            {product.brand && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Package className="h-3 w-3" />
                {product.brand}
              </p>
            )}
          </div>

          {/* Price and Stock Info */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div>
              <span className="text-lg font-bold font-sf-pro">
                KSh {Number(product.price).toLocaleString()}
              </span>
              {hasStock && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  In Stock
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons - Compact and Responsive */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-initial sm:min-w-[100px] text-xs sm:text-sm"
              onClick={handleCardClick}
            >
              <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-2" />
              <span className="hidden sm:inline">View Details</span>
              <span className="sm:hidden">View</span>
            </Button>
            {hasStock && (
              <Button
                size="sm"
                className="flex-1 sm:flex-initial sm:min-w-[100px] text-xs sm:text-sm"
                onClick={handleQuickAdd}
                disabled={isAdding}
              >
                {isAdding ? (
                  <>
                    <LoadingSpinner size="sm" className="sm:mr-2" />
                    <span className="hidden sm:inline">Adding...</span>
                    <span className="sm:hidden">Add</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Quick Add</span>
                    <span className="sm:hidden">Add</span>
                  </>
                )}
              </Button>
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
    </>
  );
});
