import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderDetailAdmin } from "@/components/admin/OrderDetailAdmin";
import { format } from "date-fns";

async function getOrder(id: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      payments: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  return order;
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const { id } = await params;
  const order = await getOrder(id);

  if (!order) {
    notFound();
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Order #{order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Placed on {format(new Date(order.createdAt), "PPP 'at' p")}
          </p>
        </div>
      </div>

      <OrderDetailAdmin order={order} />
    </>
  );
}

