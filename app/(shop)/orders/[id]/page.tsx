import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  XCircle,
  ArrowLeft,
  MapPin,
  CreditCard,
} from "lucide-react";
import { OrderTracking } from "@/components/order/OrderTracking";
import { OrderSuccessBanner } from "@/components/order/OrderSuccessBanner";
import { CancelOrderButton } from "@/components/order/CancelOrderButton";

async function getOrder(id: string, userId: string) {
  const order = await prisma.order.findFirst({
    where: {
      id,
      userId,
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      payments: true,
    },
  });

  return order;
}

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string; payment?: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    notFound();
  }

  // Admins cannot view orders through this route (they should use admin panel)
  if (session.user.role === "ADMIN") {
    notFound();
  }

  const { id } = await params;
  const search = await searchParams;
  const order = await getOrder(id, session.user.id);

  if (!order) {
    notFound();
  }

  const statusConfig = {
    PENDING: { icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-950", label: "Pending" },
    PROCESSING: { icon: Package, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950", label: "Processing" },
    SHIPPED: { icon: Truck, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-950", label: "Shipped" },
    DELIVERED: { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50 dark:bg-green-950", label: "Delivered" },
    CANCELLED: { icon: XCircle, color: "text-red-600", bg: "bg-red-50 dark:bg-red-950", label: "Cancelled" },
  };

  const StatusIcon = statusConfig[order.status].icon;
  const statusColor = statusConfig[order.status].color;
  const statusBg = statusConfig[order.status].bg;
  const shippingAddress = order.shippingAddress as {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    postalCode?: string;
  };

  const showSuccessBanner = search.success === "true" && order.status !== "CANCELLED";
  const showCancelledBanner = order.status === "CANCELLED";

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Success Banner */}
      {showSuccessBanner && (
        <OrderSuccessBanner
          orderNumber={order.orderNumber}
          paymentMethod={order.paymentMethod}
          showPaymentNote={search.payment === "paypal"}
        />
      )}

      {showCancelledBanner && (
        <Card className="mb-6 border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-red-600 p-2">
                <XCircle className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-red-900 dark:text-red-100 mb-2">
                  Order Cancelled
                </h2>
                <p className="text-red-800 dark:text-red-200 mb-3">
                  This order <span className="font-semibold">#{order.orderNumber}</span> has been cancelled and will
                  no longer be processed. If you still need the items, please place a new order or reach out to our
                  support team for assistance.
                </p>
                <div className="flex gap-2 flex-wrap">
                  <Button asChild size="sm" variant="outline">
                    <Link href="/profile?tab=orders">View Other Orders</Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link href="/products">Shop Again</Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mb-6">
        <Link href="/profile?tab=orders">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Order #{order.orderNumber}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Placed on {format(new Date(order.createdAt), "PPP 'at' p")}
        </p>
      </div>

      {/* Order Tracking */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Truck className={`h-5 w-5 ${statusColor}`} />
              Order Tracking
            </CardTitle>
            <CancelOrderButton orderId={order.id} orderStatus={order.status} />
          </div>
        </CardHeader>
        <CardContent>
          <OrderTracking
            status={order.status}
            createdAt={order.createdAt}
            estimatedDelivery={
              order.status !== "DELIVERED" && order.status !== "CANCELLED"
                ? new Date(
                  new Date(order.createdAt).getTime() +
                  (order.status === "SHIPPED" ? 2 : order.status === "PROCESSING" ? 4 : 7) *
                  24 *
                  60 *
                  60 *
                  1000
                )
                : undefined
            }
          />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0">
                    <Link href={`/products/${item.product.id}`} className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted hover:opacity-80 transition-opacity">
                      {item.product.images[0] ? (
                        <Image
                          src={item.product.images[0]}
                          alt={item.productName}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Package className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </Link>
                    <div className="flex-1">
                      <Link href={`/products/${item.product.id}`}>
                        <h4 className="font-semibold hover:text-primary transition-colors">
                          {item.productName}
                        </h4>
                      </Link>
                      <p className="text-sm text-muted-foreground mt-1">
                        Size: {item.size} • Quantity: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
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
        <div className="space-y-6">
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
                    : "PayPal"}
                </p>
              </div>
              {order.payments.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Payment Status</p>
                  {order.payments.map((payment) => (
                    <div key={payment.id} className="text-sm">
                      <div className="flex items-center justify-between">
                        <span className={`capitalize font-medium ${payment.status === "COMPLETED" ? "text-green-600" :
                          payment.status === "FAILED" ? "text-red-600" :
                            "text-yellow-600"
                          }`}>
                          {payment.status.toLowerCase()}
                        </span>
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
        </div>
      </div>
    </div>
  );
}

