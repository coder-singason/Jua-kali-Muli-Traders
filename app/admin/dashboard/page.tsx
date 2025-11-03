import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

async function getDashboardStats() {
  const [totalOrders, totalRevenue, totalProducts, recentOrders] =
    await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: {
          total: true,
        },
        where: {
          status: {
            notIn: ["CANCELLED", "PENDING"],
          },
        },
      }),
      prisma.product.count(),
      prisma.order.findMany({
        take: 5,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
    ]);

  return {
    totalOrders,
    totalRevenue: totalRevenue._sum.total || 0,
    totalProducts,
    recentOrders,
  };
}

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const stats = await getDashboardStats();

  return (
    <>
      <h1 className="mb-8 text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalOrders}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              KSh {Number(stats.totalRevenue).toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalProducts}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentOrders.length === 0 ? (
            <p className="text-muted-foreground">No orders yet.</p>
          ) : (
            <div className="space-y-4">
              {stats.recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between border-b pb-4"
                >
                  <div>
                    <p className="font-semibold">#{order.orderNumber}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.user.name || order.user.email}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      KSh {Number(order.total).toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {order.status.toLowerCase()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

