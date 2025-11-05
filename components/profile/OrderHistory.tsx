"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Order, OrderItem, Payment } from "@prisma/client";
import { format } from "date-fns";
import { Package, ArrowRight, CheckCircle2, Clock, Truck, XCircle } from "lucide-react";
import { ProductImageFallback } from "@/components/ui/product-image-fallback";
import Image from "next/image";

interface OrderHistoryProps {
  orders: Array<
    Order & {
      items: Array<
        OrderItem & {
          product: {
            id: string;
            name: string;
            images: string[];
          };
        }
      >;
      payments: Payment[];
    }
  >;
}

const statusConfig = {
  PENDING: { icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-950" },
  PROCESSING: { icon: Package, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950" },
  SHIPPED: { icon: Truck, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-950" },
  DELIVERED: { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50 dark:bg-green-950" },
  CANCELLED: { icon: XCircle, color: "text-red-600", bg: "bg-red-50 dark:bg-red-950" },
};

export function OrderHistory({ orders }: OrderHistoryProps) {
  if (orders.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No Orders Yet"
        description="Start shopping to see your orders here"
        action={{
          label: "Browse Products",
          href: "/products",
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const StatusIcon = statusConfig[order.status].icon;
        const statusColor = statusConfig[order.status].color;
        const statusBg = statusConfig[order.status].bg;

        return (
          <Card key={order.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Order #{order.orderNumber}
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusBg} ${statusColor}`}
                    >
                      <StatusIcon className="h-3 w-3" />
                      {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
                    </span>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {format(new Date(order.createdAt), "PPP 'at' p")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-lg">
                    KSh {Number(order.total).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {order.items.length} {order.items.length === 1 ? "item" : "items"}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {order.items.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="relative h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden bg-muted border"
                    >
                      {item.product.images?.[0] ? (
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <ProductImageFallback className="w-full h-full" size="sm" />
                      )}
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-muted border text-xs font-medium">
                      +{order.items.length - 3}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="text-sm text-muted-foreground">
                    Payment:{" "}
                    <span className="font-medium capitalize">
                      {order.paymentMethod === "CASH_ON_DELIVERY"
                        ? "Cash on Delivery"
                        : "M-Pesa"}
                    </span>
                    {order.payments.length > 0 &&
                      order.payments[0].status === "COMPLETED" && (
                        <span className="ml-2 text-green-600">✓ Paid</span>
                      )}
                  </div>
                  <Link href={`/orders/${order.id}`}>
                    <Button variant="outline" size="sm">
                      View Details
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

