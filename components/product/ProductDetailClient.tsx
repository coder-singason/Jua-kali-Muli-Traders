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

  const availableSizes = product.sizes.filter((size) => size.stock > 0);
  const selectedSizeStock = product.sizes.find(
    (s) => s.size === selectedSize
  )?.stock || 0;

  const handleAddToCart = async () => {
    if (!selectedSize) {
      toast({
        title: "Size Required",
        description: "Please select a size",
        variant: "destructive",
      });
      return;
    }

    if (quantity > selectedSizeStock) {
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
    const imageUrl = product.images?.[0] || (product as any).productImages?.[0]?.url || "";
    
    addToCart({
      productId: product.id,
      size: selectedSize,
      quantity,
      price: Number(product.price),
      name: product.name,
      image: imageUrl,
    });

    setIsAdding(false);
    toast({
      title: "Added to Cart",
      description: `${product.name} (Size: ${selectedSize}) added to cart`,
    });
  };

  return (
    <div className="space-y-4">
      {/* Wishlist Button */}
      <div className="flex items-center gap-2">
        <WishlistButton productId={product.id} size="md" />
        <span className="text-sm text-muted-foreground">Add to Wishlist</span>
      </div>

      {/* Size Selection */}
      <div>
        <Label className="mb-2 block text-sm font-semibold">Size</Label>
        <div className="flex flex-wrap gap-2">
          {availableSizes.length === 0 ? (
            <p className="text-destructive">Out of Stock</p>
          ) : (
            availableSizes.map((size) => (
              <button
                key={size.size}
                onClick={() => setSelectedSize(size.size)}
                className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all ${
                  selectedSize === size.size
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

      {/* Quantity Selection */}
      {selectedSize && (
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
                setQuantity(Math.min(selectedSizeStock, quantity + 1))
              }
              disabled={quantity >= selectedSizeStock}
              className="h-9 w-9"
            >
              <span className="text-lg">+</span>
            </Button>
            <span className="text-sm text-muted-foreground">
              Max: {selectedSizeStock}
            </span>
          </div>
        </div>
      )}

      {/* Add to Cart Button */}
      <Button
        className="w-full rounded-full"
        size="lg"
        onClick={handleAddToCart}
        disabled={!selectedSize || availableSizes.length === 0 || isAdding}
      >
        {isAdding ? (
          <>
            <LoadingSpinner size="sm" className="mr-2" />
            Adding...
          </>
        ) : (
          "Add to Cart"
        )}
      </Button>
    </div>
  );
}

