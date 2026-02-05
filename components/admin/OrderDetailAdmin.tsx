"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import Image from "next/image";
import { format } from "date-fns";
import {
  Package,
  User,
  MapPin,
  CreditCard,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { Order, OrderItem, Payment, User as UserType } from "@prisma/client";

interface OrderDetailAdminProps {
  order: Order & {
    items: Array<
      OrderItem & {
        product: {
          id: string;
          name: string;
          images: string[];
        };
      }
    >;
    user: {
      id: string;
      name: string | null;
      email: string;
      phone: string | null;
    };
    payments: Payment[];
  };
}

const statusConfig = {
  PENDING: { icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-950", label: "Pending" },
  PROCESSING: { icon: Package, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950", label: "Processing" },
  SHIPPED: { icon: Truck, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-950", label: "Shipped" },
  DELIVERED: { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50 dark:bg-green-950", label: "Delivered" },
  CANCELLED: { icon: XCircle, color: "text-red-600", bg: "bg-red-50 dark:bg-red-950", label: "Cancelled" },
};

export function OrderDetailAdmin({ order: initialOrder }: OrderDetailAdminProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [order, setOrder] = useState(initialOrder);
  const [isUpdating, setIsUpdating] = useState(false);

  const StatusIcon = statusConfig[order.status].icon;
  const statusColor = statusConfig[order.status].color;
  const statusBg = statusConfig[order.status].bg;

  const handleStatusChange = async (newStatus: string) => {
    // Prevent updating cancelled orders
    if (order.status === "CANCELLED") {
      toast({
        title: "Cannot Update",
        description: "Cancelled orders cannot be updated. They are final.",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || errorData.details || "Failed to update order status");
      }

      const result = await response.json();
      setOrder(result.order);

      toast({
        title: "Order Updated",
        description: `Order status has been updated to ${statusConfig[newStatus as keyof typeof statusConfig].label}`,
      });
      router.refresh();
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update order status",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const shippingAddress = order.shippingAddress as {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    postalCode?: string;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Back Button */}
      <Link href="/admin/orders">
        <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>
      </Link>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Order Status Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <StatusIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${statusColor}`} />
                Order Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${statusBg} ${statusColor} w-fit`}>
                  <StatusIcon className="h-4 w-4" />
                  <span className="font-semibold text-sm">{statusConfig[order.status].label}</span>
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <Select
                    value={order.status}
                    onValueChange={handleStatusChange}
                    disabled={isUpdating || order.status === "CANCELLED"}
                  >
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="PROCESSING">Processing</SelectItem>
                      <SelectItem value="SHIPPED">Shipped</SelectItem>
                      <SelectItem value="DELIVERED">Delivered</SelectItem>
                      <SelectItem
                        value="CANCELLED"
                        disabled={order.status !== "PENDING" && order.status !== "PROCESSING"}
                      >
                        Cancelled
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {isUpdating && (
                    <LoadingSpinner size="sm" />
                  )}
                  {order.status === "CANCELLED" && (
                    <span className="text-xs text-muted-foreground">(Cannot be changed)</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row gap-3 sm:gap-4 pb-3 sm:pb-4 border-b last:border-0">
                    <div className="flex gap-3 sm:gap-4 flex-1">
                      <div className="relative h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                        {item.product?.images?.[0] ? (
                          <Image
                            src={item.product.images[0]}
                            alt={item.productName}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 64px, 80px"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Package className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm sm:text-base break-words">{item.productName}</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                          Size: {item.size} • Quantity: {item.quantity}
                        </p>
                        {item.product && (
                          <Link
                            href={`/admin/products/${item.product.id}/edit`}
                            className="text-xs text-primary hover:underline mt-1 inline-block"
                          >
                            View Product
                          </Link>
                        )}
                        {!item.product && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Product no longer available
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-left sm:text-right flex items-start sm:items-end justify-between sm:flex-col">
                      <p className="font-semibold text-sm sm:text-base">
                        KSh {(item.price * item.quantity).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        KSh {item.price.toLocaleString()} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 sm:space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">KSh {Number(order.subtotal).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">KSh {Number(order.shippingCost).toLocaleString()}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="text-lg font-bold">KSh {Number(order.total).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <p className="text-muted-foreground">Name</p>
                <p className="font-medium">{order.user.name || "N/A"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium">{order.user.email}</p>
              </div>
              {order.user.phone && (
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-medium">{order.user.phone}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p className="font-medium">{shippingAddress.fullName}</p>
              <p className="text-muted-foreground">{shippingAddress.addressLine1}</p>
              {shippingAddress.addressLine2 && (
                <p className="text-muted-foreground">{shippingAddress.addressLine2}</p>
              )}
              <p className="text-muted-foreground">
                {shippingAddress.city}
                {shippingAddress.postalCode && `, ${shippingAddress.postalCode}`}
              </p>
              <p className="text-muted-foreground">Phone: {shippingAddress.phone}</p>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Payment Method</p>
                <p className="font-medium">
                  {order.paymentMethod === "CASH_ON_DELIVERY"
                    ? "Cash on Delivery"
                    : order.paymentMethod === "PAYPAL"
                      ? "PayPal"
                      : order.paymentMethod}
                </p>
              </div>
              {order.payments.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Payment Status</p>
                  {order.payments.map((payment) => (
                    <div key={payment.id} className="text-sm">
                      <div className="flex items-center justify-between">
                        <span className="capitalize">{payment.status.toLowerCase()}</span>
                        <span className="font-medium">KSh {Number(payment.amount).toLocaleString()}</span>
                      </div>


                      <p className="text-xs text-muted-foreground">
                        {format(new Date(payment.createdAt), "PPP 'at' p")}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

