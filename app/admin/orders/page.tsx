import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OrdersList } from "@/components/admin/OrdersList";
import { OrderStatus } from "@prisma/client";

async function getOrders(status?: OrderStatus, search?: string) {
  const where: any = {};
  
  if (status) {
    where.status = status;
  }

  // For search, we'll filter after fetching if needed
  // MongoDB with Prisma has limitations on nested searches
  
  const orders = await prisma.order.findMany({
    where: status ? { status } : {},
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      items: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Filter by search term if provided (client-side filtering for nested fields)
  if (search) {
    const searchLower = search.toLowerCase();
    return orders.filter(
      (order) =>
        order.orderNumber.toLowerCase().includes(searchLower) ||
        order.user.email.toLowerCase().includes(searchLower) ||
        (order.user.name && order.user.name.toLowerCase().includes(searchLower))
    );
  }

  return orders;
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const params = await searchParams;
  const status = params.status as OrderStatus | undefined;
  const search = params.search;

  const orders = await getOrders(status, search);

  return (
    <div className="max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Orders</h1>
        <p className="text-muted-foreground mt-1">View and manage customer orders</p>
      </div>
      <OrdersList orders={orders} currentStatus={status} currentSearch={search} />
    </div>
  );
}

