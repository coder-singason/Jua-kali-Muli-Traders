"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Order, OrderStatus } from "@prisma/client";
import { format } from "date-fns";
import { Search, X } from "lucide-react";
import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  XCircle,
} from "lucide-react";

interface OrdersListProps {
  orders: Array<
    Order & {
      user: {
        name: string | null;
        email: string;
      };
      items: Array<{ id: string }>;
    }
  >;
  currentStatus?: OrderStatus;
  currentSearch?: string;
}

const statusConfig = {
  PENDING: { icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-950" },
  PROCESSING: { icon: Package, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950" },
  SHIPPED: { icon: Truck, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-950" },
  DELIVERED: { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50 dark:bg-green-950" },
  CANCELLED: { icon: XCircle, color: "text-red-600", bg: "bg-red-50 dark:bg-red-950" },
};

export function OrdersList({ orders, currentStatus, currentSearch }: OrdersListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(currentSearch || "");

  const handleStatusFilter = (status: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (status === "ALL") {
      params.delete("status");
    } else {
      params.set("status", status);
    }
    params.delete("page");
    router.push(`/admin/orders?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (search.trim()) {
      params.set("search", search.trim());
    } else {
      params.delete("search");
    }
    params.delete("page");
    router.push(`/admin/orders?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push("/admin/orders");
    setSearch("");
  };

  const hasFilters = currentStatus || currentSearch;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <form onSubmit={handleSearch} className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by order number, email, or name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </form>

            <div className="flex items-center gap-2">
              <Select
                value={currentStatus || "ALL"}
                onValueChange={handleStatusFilter}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="PROCESSING">Processing</SelectItem>
                  <SelectItem value="SHIPPED">Shipped</SelectItem>
                  <SelectItem value="DELIVERED">Delivered</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              {hasFilters && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={clearFilters}
                  title="Clear filters"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {hasFilters
                ? "No orders found matching your filters."
                : "No orders yet."}
            </p>
            {hasFilters && (
              <Button variant="outline" onClick={clearFilters} className="mt-4">
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const StatusIcon = statusConfig[order.status].icon;
            const statusColor = statusConfig[order.status].color;
            const statusBg = statusConfig[order.status].bg;

            return (
              <Card key={order.id} className="hover:shadow-md hover:bg-muted/50 dark:hover:bg-muted/30 transition-all cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle>Order #{order.orderNumber}</CardTitle>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusBg} ${statusColor}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {order.user.name || order.user.email}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg">
                        KSh {Number(order.total).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(order.createdAt), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm">
                        {order.items.length} item(s) •{" "}
                        {order.paymentMethod === "CASH_ON_DELIVERY"
                          ? "Cash on Delivery"
                          : "M-Pesa"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(order.createdAt), "PPP 'at' p")}
                      </p>
                    </div>
                    <Link href={`/admin/orders/${order.id}`}>
                      <Button variant="outline">View Details</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

