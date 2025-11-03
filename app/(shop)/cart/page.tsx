"use client";

import { useCartStore } from "@/lib/stores/cart-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";

export default function CartPage() {
  const { data: session } = useSession();
  const { items, removeItem, updateQuantity, getTotal, clearCart } =
    useCartStore();
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());
  const [isClearing, setIsClearing] = useState(false);
  const isAdmin = session?.user?.role === "ADMIN";

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
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <h2 className="mb-4 text-2xl font-bold">Your cart is empty</h2>
            <p className="mb-6 text-muted-foreground">
              Start shopping to add items to your cart
            </p>
            <Link href="/products">
              <Button>Browse Products</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Shopping Cart</h1>

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
          {items.map((item) => (
            <Card key={item.id} className="shadow-sm">
              <CardContent className="p-4">
              <div className="flex gap-3 md:gap-4">
                <Link href={`/products/${item.productId}`} className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted md:h-24 md:w-24">
                  <Image
                    src={item.image || "/placeholder-shoe.jpg"}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform hover:scale-105"
                    sizes="80px"
                  />
                </Link>
                  <div className="flex flex-1 flex-col justify-between gap-2">
                    <div>
                      <Link href={`/products/${item.productId}`}>
                        <h3 className="font-semibold text-sm md:text-base line-clamp-2 hover:text-primary transition-colors">{item.name}</h3>
                      </Link>
                      <p className="text-xs md:text-sm text-muted-foreground mt-1">
                        Size: {item.size}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            handleUpdateQuantity(item.id, item.quantity - 1)
                          }
                          disabled={updatingItems.has(item.id) || item.quantity <= 1}
                          className="h-8 w-8"
                        >
                          {updatingItems.has(item.id) ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <Minus className="h-4 w-4" />
                          )}
                        </Button>
                        <span className="w-8 text-center font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            handleUpdateQuantity(item.id, item.quantity + 1)
                          }
                          disabled={updatingItems.has(item.id)}
                          className="h-8 w-8"
                        >
                          {updatingItems.has(item.id) ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <Plus className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-semibold text-sm md:text-base">
                          KSh {(item.price * item.quantity).toLocaleString()}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemove(item.id)}
                          disabled={removingItems.has(item.id)}
                          className="h-8 w-8"
                        >
                          {removingItems.has(item.id) ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <Trash2 className="h-4 w-4 text-destructive" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-1">
          <Card className="shadow-md sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold">
                  KSh {total.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-semibold">KSh 500</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>KSh {(total + 500).toLocaleString()}</span>
                </div>
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
                <Link href="/checkout" className="block">
                  <Button className="w-full rounded-full" size="lg">
                    Proceed to Checkout
                  </Button>
                </Link>
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

