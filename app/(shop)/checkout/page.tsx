"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCartStore } from "@/lib/stores/cart-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import Link from "next/link";
import Image from "next/image";

const checkoutSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  addressLine1: z.string().min(5, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  postalCode: z.string().optional(),
  paymentMethod: z.enum(["CASH_ON_DELIVERY", "MPESA"]),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { items, getTotal, clearCart } = useCartStore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: "CASH_ON_DELIVERY",
    },
  });

  const paymentMethod = watch("paymentMethod");
  const subtotal = getTotal();
  const shippingCost = 500;
  const total = subtotal + shippingCost;

  useEffect(() => {
    if (status === "unauthenticated") {
      // Redirect to login with return URL
      router.push("/login?callbackUrl=/checkout");
      return;
    }
    
    // Redirect admins away from checkout
    if (status === "authenticated" && session?.user?.role === "ADMIN") {
      toast({
        title: "Access Restricted",
        description: "Administrators cannot place orders. Please use a customer account.",
        variant: "destructive",
      });
      router.push("/");
    }
  }, [status, session, router, toast]);

  if (status === "loading") {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Loading...</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null; // Will redirect
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <h2 className="mb-4 text-2xl font-bold">Your cart is empty</h2>
            <Link href="/products">
              <Button>Browse Products</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const onSubmit = async (data: CheckoutFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Create order
      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            size: item.size,
            quantity: item.quantity,
            price: item.price,
            productName: item.name,
          })),
          shippingAddress: {
            fullName: data.fullName,
            phone: data.phone,
            addressLine1: data.addressLine1,
            addressLine2: data.addressLine2,
            city: data.city,
            postalCode: data.postalCode,
          },
          paymentMethod: data.paymentMethod,
          phone: data.phone,
        }),
      });

      const orderResult = await orderResponse.json();

      if (!orderResponse.ok) {
        const errorMessage = orderResult.error || "Failed to create order";
        setError(errorMessage);
        
        // If admin restriction error, redirect home
        if (orderResponse.status === 403 && errorMessage.includes("Administrator")) {
          setTimeout(() => {
            router.push("/");
          }, 2000);
        }
        
        setIsLoading(false);
        return;
      }

      // If M-Pesa, initiate payment
      if (data.paymentMethod === "MPESA") {
        const paymentResponse = await fetch("/api/payments/mpesa/initiate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: orderResult.order.id,
            phoneNumber: data.phone,
          }),
        });

        const paymentResult = await paymentResponse.json();

        if (!paymentResponse.ok) {
          setError(paymentResult.error || "Failed to initiate payment");
          setIsLoading(false);
          return;
        }

        // Show success message and redirect
        toast({
          title: "Payment Initiated",
          description: paymentResult.message || "Please complete the payment on your phone",
        });
        clearCart();
        router.push(`/orders/${orderResult.order.id}?success=true&payment=mpesa`);
      } else {
        // Cash on delivery - just redirect
        clearCart();
        toast({
          title: "Order Placed Successfully",
          description: "Your order has been received and will be processed shortly.",
        });
        router.push(`/orders/${orderResult.order.id}?success=true`);
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Checkout</h1>

      <div className="grid gap-6 md:gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                  <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    {...register("fullName")}
                    placeholder="John Doe"
                  />
                  {errors.fullName && (
                    <p className="text-sm text-destructive">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    {...register("phone")}
                    placeholder="+254 700 000 000"
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="addressLine1">Address Line 1</Label>
                  <Input
                    id="addressLine1"
                    {...register("addressLine1")}
                    placeholder="Street address"
                  />
                  {errors.addressLine1 && (
                    <p className="text-sm text-destructive">
                      {errors.addressLine1.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
                  <Input
                    id="addressLine2"
                    {...register("addressLine2")}
                    placeholder="Apartment, suite, etc."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" {...register("city")} placeholder="Nairobi" />
                    {errors.city && (
                      <p className="text-sm text-destructive">
                        {errors.city.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code (Optional)</Label>
                    <Input
                      id="postalCode"
                      {...register("postalCode")}
                      placeholder="00100"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <Label className="text-base font-semibold">
                    Payment Method
                  </Label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 rounded border p-4 cursor-pointer hover:bg-accent">
                      <input
                        type="radio"
                        value="CASH_ON_DELIVERY"
                        {...register("paymentMethod")}
                        className="h-4 w-4"
                      />
                      <div>
                        <div className="font-semibold">Cash on Delivery</div>
                        <div className="text-sm text-muted-foreground">
                          Pay when you receive your order
                        </div>
                      </div>
                    </label>
                    <label className="flex items-center space-x-2 rounded border p-4 cursor-pointer hover:bg-accent">
                      <input
                        type="radio"
                        value="MPESA"
                        {...register("paymentMethod")}
                        className="h-4 w-4"
                      />
                      <div>
                        <div className="font-semibold">M-Pesa</div>
                        <div className="text-sm text-muted-foreground">
                          Pay via M-Pesa mobile money
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Processing...
                    </>
                  ) : paymentMethod === "MPESA" ? (
                    "Pay with M-Pesa"
                  ) : (
                    "Place Order"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="shadow-md sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded bg-gray-100">
                      <Image
                        src={item.image || "/placeholder-shoe.jpg"}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Size: {item.size} × {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-semibold">
                      KSh {(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>KSh {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>KSh {shippingCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2 text-lg font-bold border-t">
                  <span>Total</span>
                  <span>KSh {total.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

