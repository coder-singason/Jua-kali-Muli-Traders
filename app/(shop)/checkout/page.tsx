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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ProductImageFallback } from "@/components/ui/product-image-fallback";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Plus, Info } from "lucide-react";

const checkoutSchema = z.object({
  addressId: z.string().optional(),
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  addressLine1: z.string().min(5, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  postalCode: z.string().optional(),
  paymentMethod: z.enum(["CASH_ON_DELIVERY", "MPESA"]),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface Address {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  postalCode: string | null;
  isDefault: boolean;
}

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { items, getTotal, clearCart } = useCartStore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [userProfile, setUserProfile] = useState<{ name?: string; phone?: string } | null>(null);
  const [defaultPromptShown, setDefaultPromptShown] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: "CASH_ON_DELIVERY",
    },
  });

  const paymentMethod = watch("paymentMethod");
  const subtotal = getTotal();
  const [shippingCost, setShippingCost] = useState(0);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const total = subtotal + shippingCost;

  // Calculate shipping based on products in cart
  useEffect(() => {
    if (items.length === 0) {
      setShippingCost(0); // Free shipping if no items
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
        setShippingCost(0); // Free shipping as fallback
      } finally {
        setLoadingShipping(false);
      }
    };

    calculateShipping();
  }, [items]);

  // Fetch addresses and user profile
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      (async () => {
        try {
          const [addrRes, profileRes] = await Promise.all([
            fetch("/api/addresses", { cache: "no-store" }),
            fetch("/api/profile", { cache: "no-store" }),
          ]);

          if (addrRes.ok) {
            const addressData = await addrRes.json();
            if (Array.isArray(addressData.addresses)) {
              setAddresses(addressData.addresses);
              const defaultAddress = addressData.addresses.find((addr: Address) => addr.isDefault);
              if (defaultAddress) {
                setSelectedAddressId(defaultAddress.id);
                fillAddressForm(defaultAddress);
              }
            }
          } else {
            console.warn("Addresses request failed", addrRes.status);
          }

          if (profileRes.ok) {
            const profileData = await profileRes.json();
            if (profileData.user) {
              setUserProfile(profileData.user);
              if (profileData.user.name) setValue("fullName", profileData.user.name);
              if (profileData.user.phone) setValue("phone", profileData.user.phone);
            }
          }
        } catch (err) {
          console.error("Error loading addresses/profile:", err);
        } finally {
          setLoadingAddresses(false);
        }
      })();
    }
  }, [status, session, setValue]);

  const fillAddressForm = (address: Address) => {
    setValue("addressId", address.id);
    setValue("fullName", address.fullName);
    setValue("phone", address.phone);
    setValue("addressLine1", address.addressLine1);
    setValue("addressLine2", address.addressLine2 || "");
    setValue("city", address.city);
    setValue("postalCode", address.postalCode || "");
  };

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId);
    const address = addresses.find((addr) => addr.id === addressId);
    if (address) {
      fillAddressForm(address);
    }
  };

  const handleUseNewAddress = () => {
    setSelectedAddressId("");
    reset({
      addressId: "",
      fullName: userProfile?.name || "",
      phone: userProfile?.phone || "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      postalCode: "",
      paymentMethod: "CASH_ON_DELIVERY",
    });
  };

  // Prompt to use default address if available and not already selected
  useEffect(() => {
    if (addresses.length > 0 && !defaultPromptShown) {
      const defaultAddress = addresses.find((a) => a.isDefault);
      if (defaultAddress && selectedAddressId !== defaultAddress.id) {
        setDefaultPromptShown(true);
      }
    }
  }, [addresses, selectedAddressId, defaultPromptShown]);

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

  // Don't show empty cart during redirect
  if (items.length === 0 && !isRedirecting) {
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

  // Show loading during redirect
  if (isRedirecting) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center py-12">
          <LoadingSpinner size="lg" className="mb-4" />
          <p className="text-muted-foreground">Redirecting to order details...</p>
        </div>
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

        // Show success message and redirect immediately, then clear cart
        toast({
          title: "Payment Initiated",
          description: paymentResult.message || "Please complete the payment on your phone",
        });
        setIsRedirecting(true);
        clearCart();
        // Use replace to avoid back navigation, redirect immediately
        router.replace(`/orders/${orderResult.order.id}?success=true&payment=mpesa`);
      } else {
        // Cash on delivery - redirect immediately, then clear cart
        toast({
          title: "Order Placed Successfully",
          description: "Your order has been received and will be processed shortly.",
        });
        setIsRedirecting(true);
        clearCart();
        // Use replace to avoid back navigation, redirect immediately
        router.replace(`/orders/${orderResult.order.id}?success=true`);
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 md:py-8 max-w-7xl">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Checkout</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review your order and complete your purchase
        </p>
      </div>

      <div className="grid gap-6 md:gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-lg border-2">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipping Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                  <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

                {/* Saved Addresses Selection */}
                {addresses.length > 0 && (
                  <div className="space-y-2 rounded-lg border p-4 bg-muted/50">
                    <div className="flex items-center justify-between mb-3">
                      <Label className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Saved Addresses
                      </Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleUseNewAddress}
                        className="text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        New Address
                      </Button>
                    </div>
                    {defaultPromptShown && (
                      <div className="mb-3 flex items-start gap-2 rounded-md border bg-background p-3 text-sm">
                        <Info className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <div className="flex-1">
                          <div className="mb-2 text-muted-foreground">
                            We found your default address. Would you like to use it?
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => {
                                const def = addresses.find((a) => a.isDefault);
                                if (def) {
                                  setSelectedAddressId(def.id);
                                  fillAddressForm(def);
                                  setDefaultPromptShown(false);
                                }
                              }}
                            >
                              Use Default Address
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setDefaultPromptShown(false);
                                // Clear the auto-selected address and reset form to profile data
                                setSelectedAddressId("");
                                reset({
                                  addressId: "",
                                  fullName: userProfile?.name || "",
                                  phone: userProfile?.phone || "",
                                  addressLine1: "",
                                  addressLine2: "",
                                  city: "",
                                  postalCode: "",
                                  paymentMethod: "CASH_ON_DELIVERY",
                                });
                              }}
                            >
                              Not Now
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                    {loadingAddresses ? (
                      <div className="py-2 text-sm text-muted-foreground">Loading addresses...</div>
                    ) : (
                      <Select
                        value={selectedAddressId}
                        onValueChange={handleAddressSelect}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a saved address" />
                        </SelectTrigger>
                        <SelectContent>
                          {addresses.map((address) => (
                            <SelectItem key={address.id} value={address.id}>
                              {address.label} {address.isDefault && "(Default)"} - {address.city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                )}

                {/* No addresses hint */}
                {addresses.length === 0 && !loadingAddresses && (
                  <div className="rounded-md border p-3 text-sm text-muted-foreground">
                    You have no saved addresses. You can enter your shipping details below or
                    <Link href="/profile?tab=addresses" className="ml-1 underline">manage addresses</Link>.
                  </div>
                )}

                {/* Manual Address Form */}
                <div className="space-y-4 pt-2">
                  {addresses.length > 0 && (
                    <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground pb-2 border-b">
                      <span>Or enter manually:</span>
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

                {/* Payment Method */}
                <div className="space-y-4 pt-6 border-t">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <span>💳</span>
                    Payment Method
                  </Label>
                  <div className="space-y-3">
                    <label className={`flex items-start gap-3 rounded-lg border-2 p-4 cursor-pointer transition-all ${
                      paymentMethod === "CASH_ON_DELIVERY" 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    }`}>
                      <input
                        type="radio"
                        value="CASH_ON_DELIVERY"
                        {...register("paymentMethod")}
                        className="h-5 w-5 mt-0.5"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-base mb-1">Cash on Delivery</div>
                        <div className="text-sm text-muted-foreground">
                          Pay when you receive your order
                        </div>
                      </div>
                    </label>
                    <label className={`flex items-start gap-3 rounded-lg border-2 p-4 cursor-pointer transition-all ${
                      paymentMethod === "MPESA" 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    }`}>
                      <input
                        type="radio"
                        value="MPESA"
                        {...register("paymentMethod")}
                        className="h-5 w-5 mt-0.5"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-base mb-1">M-Pesa</div>
                        <div className="text-sm text-muted-foreground">
                          Pay via M-Pesa mobile money
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full rounded-full" 
                  size="lg" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Processing Order...
                    </>
                  ) : paymentMethod === "MPESA" ? (
                    "Pay with M-Pesa"
                  ) : (
                    "Place Order"
                  )}
                </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="shadow-lg sticky top-4 border-2">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Items List */}
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {items.map((item) => {
                  const itemTotal = item.price * item.quantity;
                  return (
                    <div key={item.id} className="flex gap-3 pb-3 border-b last:border-0 last:pb-0">
                      <Link 
                        href={`/products/${item.productId}`}
                        className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted group"
                      >
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover transition-transform group-hover:scale-110"
                            sizes="80px"
                          />
                        ) : (
                          <ProductImageFallback className="w-full h-full" size="md" />
                        )}
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link href={`/products/${item.productId}`}>
                          <p className="text-sm font-semibold line-clamp-2 hover:text-primary transition-colors">
                            {item.name}
                          </p>
                        </Link>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-muted-foreground">
                            Size: <span className="font-medium">{item.size}</span> × <span className="font-medium">{item.quantity}</span>
                          </p>
                          <p className="text-sm font-bold ml-2">
                            KSh {itemTotal.toLocaleString()}
                          </p>
                        </div>
                        {item.quantity > 1 && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {item.quantity} × KSh {item.price.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary */}
              <div className="border-t pt-4 space-y-3">
                {/* Item Count */}
                <div className="pb-2 border-b">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Items ({itemCount})</span>
                    <span className="font-medium">KSh {subtotal.toLocaleString()}</span>
                  </div>
                </div>

                {/* Subtotal */}
                <div className="flex justify-between items-center">
                  <span className="font-medium">Subtotal</span>
                  <span className="font-bold text-lg">
                    KSh {subtotal.toLocaleString()}
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
                      KSh {total.toLocaleString()}
                    </span>
                  </div>
                  {shippingCost === 0 && total > 0 && (
                    <p className="text-xs text-green-600 dark:text-green-400 text-center">
                      Free shipping included
                    </p>
                  )}
                </div>
              </div>

              {/* Back to Cart Link */}
              <Link href="/cart">
                <Button variant="outline" className="w-full rounded-full" size="sm">
                  ← Edit Cart
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

