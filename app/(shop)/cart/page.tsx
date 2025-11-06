"use client";

import { useCartStore } from "@/lib/stores/cart-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ProductImageFallback } from "@/components/ui/product-image-fallback";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus, AlertCircle, ShoppingCart } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function CartPage() {
  const { data: session } = useSession();
  const { items, removeItem, updateQuantity, getTotal, clearCart } =
    useCartStore();
  const router = useRouter();
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());
  const [isClearing, setIsClearing] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [shippingCost, setShippingCost] = useState(0);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const isAdmin = session?.user?.role === "ADMIN";

  // Calculate shipping based on products in cart
  useEffect(() => {
    if (items.length === 0) {
      setShippingCost(0);
      return;
    }

    const calculateShipping = async () => {
      setLoadingShipping(true);
      try {
        const productIds = items.map((item) => item.productId);
        const response = await fetch(`/api/products/shipping?ids=${productIds.join(",")}`);
        if (response.ok) {
          const data = await response.json();
          const calculatedShipping = items.reduce((sum, item) => {
            const productShippingFee = data.shippingFees[item.productId] || 0;
            return sum + productShippingFee;
          }, 0);
          setShippingCost(calculatedShipping > 0 ? calculatedShipping : 0);
        }
      } catch (error) {
        console.error("Error calculating shipping:", error);
        setShippingCost(0);
      } finally {
        setLoadingShipping(false);
      }
    };

    calculateShipping();
  }, [items]);

  const handleUpdateQuantity = async (id: string, newQuantity: number) => {
    setUpdatingItems((prev) => new Set(prev).add(id));
    await new Promise((resolve) => setTimeout(resolve, 300));
    updateQuantity(id, newQuantity);
    setUpdatingItems((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleRemove = async (id: string) => {
    setRemovingItems((prev) => new Set(prev).add(id));
    await new Promise((resolve) => setTimeout(resolve, 300));
    removeItem(id);
    setRemovingItems((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const total = getTotal();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 md:py-8 max-w-7xl">
        <EmptyState
          icon={ShoppingCart}
          title="Your cart is empty"
          description="Start shopping to add items to your cart"
          action={{
            label: "Browse Products",
            href: "/products",
          }}
        />
      </div>
    );
  }

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 md:py-8 max-w-7xl">
      <div className="mb-6 sm:mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Shopping Cart</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {itemCount} {itemCount === 1 ? "item" : "items"} in your cart
          </p>
        </div>
        <Link href="/products">
          <Button variant="outline" className="gap-2">
            <ShoppingCart className="h-4 w-4" />
            Continue Shopping
          </Button>
        </Link>
      </div>

      {isAdmin && (
        <Card className="mb-6 border-yellow-200 dark:border-yellow-900 bg-yellow-50 dark:bg-yellow-950">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                  Administrator Account
                </h3>
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Administrators cannot place orders. This cart is for testing purposes only. 
                  Please use a customer account to make purchases.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const itemTotal = item.price * item.quantity;
            const isUpdating = updatingItems.has(item.id);
            const isRemoving = removingItems.has(item.id);
            
            return (
              <Card 
                key={item.id} 
                className={`shadow-sm transition-all ${
                  isRemoving ? "opacity-50" : "hover:shadow-md"
                }`}
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex gap-4 md:gap-6">
                    {/* Product Image */}
                    <Link 
                      href={`/products/${item.productId}`} 
                      className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted md:h-28 md:w-28 group"
                    >
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover transition-transform group-hover:scale-110"
                          sizes="112px"
                        />
                      ) : (
                        <ProductImageFallback className="w-full h-full" size="md" />
                      )}
                    </Link>

                    {/* Product Details */}
                    <div className="flex flex-1 flex-col justify-between gap-3 min-w-0">
                      <div className="space-y-1">
                        <Link href={`/products/${item.productId}`}>
                          <h3 className="font-semibold text-base md:text-lg line-clamp-2 hover:text-primary transition-colors">
                            {item.name}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span>Size: <span className="font-medium">{item.size}</span></span>
                          <span className="text-muted-foreground/50">•</span>
                          <span>Unit: <span className="font-medium">KSh {item.price.toLocaleString()}</span></span>
                        </div>
                      </div>

                      {/* Quantity and Price Controls */}
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        {/* Quantity Selector */}
                        <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            disabled={isUpdating || isRemoving || item.quantity <= 1}
                            className="h-8 w-8 rounded-md hover:bg-background"
                            title="Decrease quantity"
                          >
                            {isUpdating ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              <Minus className="h-4 w-4" />
                            )}
                          </Button>
                          <span className="w-10 text-center font-semibold text-base">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            disabled={isUpdating || isRemoving}
                            className="h-8 w-8 rounded-md hover:bg-background"
                            title="Increase quantity"
                          >
                            {isUpdating ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              <Plus className="h-4 w-4" />
                            )}
                          </Button>
                        </div>

                        {/* Price and Remove */}
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-bold text-lg text-foreground">
                              KSh {itemTotal.toLocaleString()}
                            </p>
                            {item.quantity > 1 && (
                              <p className="text-xs text-muted-foreground">
                                {item.quantity} × KSh {item.price.toLocaleString()}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemove(item.id)}
                            disabled={isRemoving || isUpdating}
                            className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                            title="Remove item"
                          >
                            {isRemoving ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              <Trash2 className="h-5 w-5" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="lg:col-span-1">
          <Card className="shadow-lg sticky top-4 border-2">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Item Count */}
              <div className="pb-2 border-b">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Items ({itemCount})</span>
                  <span className="font-medium">KSh {total.toLocaleString()}</span>
                </div>
              </div>

              {/* Subtotal */}
              <div className="flex justify-between items-center">
                <span className="font-medium">Subtotal</span>
                <span className="font-bold text-lg">
                  KSh {total.toLocaleString()}
                </span>
              </div>

              {/* Shipping */}
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="font-medium">Shipping</span>
                <span className="font-semibold">
                  {loadingShipping ? (
                    <span className="text-muted-foreground text-sm flex items-center gap-1">
                      <LoadingSpinner size="sm" />
                      Calculating...
                    </span>
                  ) : shippingCost > 0 ? (
                    `KSh ${shippingCost.toLocaleString()}`
                  ) : (
                    <span className="text-green-600 dark:text-green-400 font-bold">Free</span>
                  )}
                </span>
              </div>

              {/* Total */}
              <div className="pt-2 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-2xl font-bold text-primary">
                    KSh {(total + shippingCost).toLocaleString()}
                  </span>
                </div>
                {shippingCost === 0 && total > 0 && (
                  <p className="text-xs text-green-600 dark:text-green-400 text-center">
                    ✓ Free shipping included
                  </p>
                )}
              </div>
              {isAdmin ? (
                <Button 
                  className="w-full rounded-full" 
                  size="lg" 
                  disabled
                  title="Administrators cannot place orders"
                >
                  Checkout Disabled (Admin Account)
                </Button>
              ) : (
                <Button
                  className="w-full rounded-full"
                  size="lg"
                  onClick={async () => {
                    setIsCheckingOut(true);
                    await new Promise((resolve) => setTimeout(resolve, 300));
                    router.push("/checkout");
                  }}
                  disabled={isCheckingOut}
                >
                  {isCheckingOut ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Preparing Checkout...
                    </>
                  ) : (
                    "Proceed to Checkout"
                  )}
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full rounded-full"
                onClick={async () => {
                  setIsClearing(true);
                  await new Promise((resolve) => setTimeout(resolve, 300));
                  clearCart();
                  setIsClearing(false);
                }}
                disabled={isClearing}
              >
                {isClearing ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Clearing...
                  </>
                ) : (
                  "Clear Cart"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

