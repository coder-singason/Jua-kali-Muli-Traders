"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Product } from "@prisma/client";
import { useCartStore } from "@/lib/stores/cart-store";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { WishlistButton } from "./WishlistButton";

interface ProductDetailClientProps {
  product: Product & {
    category: { name: string; slug: string };
    sizes: { size: string; stock: number }[];
  };
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const addToCart = useCartStore((state) => state.addItem);
  const { toast } = useToast();

  const hasVariants = product.sizes && product.sizes.length > 0;
  const availableSizes = hasVariants ? product.sizes.filter((size) => size.stock > 0) : [];

  // For simple products (no variants), use main stock. For variants, use selected size stock.
  const currentStock = hasVariants
    ? (product.sizes.find((s) => s.size === selectedSize)?.stock || 0)
    : product.stock;

  const handleAddToCart = async () => {
    // Only require size if product has variants
    if (hasVariants && !selectedSize) {
      toast({
        title: "Size Required",
        description: "Please select a size",
        variant: "destructive",
      });
      return;
    }

    if (quantity > currentStock) {
      toast({
        title: "Insufficient Stock",
        description: "Not enough stock available",
        variant: "destructive",
      });
      return;
    }

    setIsAdding(true);

    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Use productImages if available, otherwise fall back to images array
    const productWithImages = product as any;
    let imageUrl = "";
    if (productWithImages.productImages && productWithImages.productImages.length > 0) {
      const sorted = [...productWithImages.productImages].sort((a: any, b: any) => a.sortOrder - b.sortOrder);
      imageUrl = sorted[0].url;
    } else if (product.images && product.images.length > 0) {
      imageUrl = product.images[0];
    }

    addToCart({
      productId: product.id,
      size: hasVariants ? selectedSize : "Standard", // Default size label for simple products
      quantity,
      price: Number(product.price),
      name: product.name,
      image: imageUrl,
    });

    setIsAdding(false);
    toast({
      title: "Added to Cart",
      description: `${product.name}${hasVariants ? ` (Size: ${selectedSize})` : ""} added to cart`,
    });
  };

  const isOutOfStock = hasVariants ? availableSizes.length === 0 : product.stock === 0;

  return (
    <div className="space-y-4">
      {/* Wishlist Button */}
      <div className="flex justify-start">
        <WishlistButton
          productId={product.id}
          size="md"
          variant="icon"
        />
      </div>

      {/* Size Selection - Only show if variants exist */}
      {hasVariants && (
        <div>
          <Label className="mb-2 block text-sm font-semibold">Size</Label>
          <div className="flex flex-wrap gap-2">
            {availableSizes.length === 0 ? (
              <p className="text-destructive">Out of Stock</p>
            ) : (
              availableSizes.map((size) => (
                <button
                  key={size.size}
                  onClick={() => {
                    setSelectedSize(size.size);
                    setQuantity(1); // Reset quantity when size changes
                  }}
                  className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all ${selectedSize === size.size
                      ? "border-primary bg-primary text-primary-foreground shadow-md"
                      : "border-border bg-card hover:border-primary/50 hover:bg-muted"
                    }`}
                >
                  {size.size}
                  <span className="ml-1 text-xs opacity-75">({size.stock})</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Quantity Selection */}
      {(!hasVariants || selectedSize) && !isOutOfStock && (
        <div>
          <Label className="mb-2 block text-sm font-semibold">Quantity</Label>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="h-9 w-9"
            >
              <span className="text-lg">−</span>
            </Button>
            <span className="w-12 text-center text-lg font-semibold">{quantity}</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                setQuantity(Math.min(currentStock, quantity + 1))
              }
              disabled={quantity >= currentStock}
              className="h-9 w-9"
            >
              <span className="text-lg">+</span>
            </Button>
            <span className="text-sm text-muted-foreground">
              Max: {currentStock}
            </span>
          </div>
        </div>
      )}

      {/* Add to Cart Button */}
      <Button
        className="w-full rounded-full"
        size="lg"
        onClick={handleAddToCart}
        disabled={(hasVariants && !selectedSize) || isOutOfStock || isAdding}
      >
        {isAdding ? (
          <>
            <LoadingSpinner size="sm" className="mr-2" />
            Adding...
          </>
        ) : isOutOfStock ? (
          "Out of Stock"
        ) : (
          "Add to Cart"
        )}
      </Button>
    </div>
  );
}

