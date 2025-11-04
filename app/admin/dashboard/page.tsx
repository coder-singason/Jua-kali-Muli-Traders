import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ShoppingBag,
  TrendingUp,
  Package,
  Users,
  AlertCircle,
  Clock,
  CheckCircle2,
  Truck,
  DollarSign,
  ArrowRight,
  PackageCheck,
} from "lucide-react";
import { format } from "date-fns";
import { RevenueChart } from "@/components/admin/RevenueChart";

async function getDashboardStats() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalOrders,
    pendingOrders,
    processingOrders,
    shippedOrders,
    deliveredOrders,
    totalRevenue,
    todayRevenue,
    weekRevenue,
    monthRevenue,
    totalProducts,
    allProducts,
    totalCustomers,
    recentOrders,
    orderStatusCounts,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: "PROCESSING" } }),
    prisma.order.count({ where: { status: "SHIPPED" } }),
    prisma.order.count({ where: { status: "DELIVERED" } }),
    // Revenue calculations
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { in: ["PROCESSING", "SHIPPED", "DELIVERED"] } },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: {
        status: { in: ["PROCESSING", "SHIPPED", "DELIVERED"] },
        createdAt: { gte: todayStart },
      },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: {
        status: { in: ["PROCESSING", "SHIPPED", "DELIVERED"] },
        createdAt: { gte: weekAgo },
      },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: {
        status: { in: ["PROCESSING", "SHIPPED", "DELIVERED"] },
        createdAt: { gte: monthAgo },
      },
    }),
    // Product stats
    prisma.product.count(),
    prisma.product.findMany({
      include: {
        sizes: true,
      },
    }),
    prisma.user.count({ where: { role: "USER" } }),
    // Recent orders with more details
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        items: {
          take: 1,
        },
      },
    }),
    // Order status breakdown
    prisma.order.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
  ]);

  // Calculate low stock and out of stock products
  const outOfStockCount = allProducts.filter((product) => {
    if (product.sizes.length === 0) return true; // No sizes = out of stock
    const totalStock = product.sizes.reduce((sum, size) => sum + size.stock, 0);
    return totalStock === 0;
  }).length;

  const lowStockCount = allProducts.filter((product) => {
    if (product.sizes.length === 0) return false; // No sizes = out of stock, not low stock
    const totalStock = product.sizes.reduce((sum, size) => sum + size.stock, 0);
    return totalStock > 0 && totalStock <= 5;
  }).length;

  // Get revenue and order data for the last 7 days for chart
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  // Fetch all orders from the last 7 days
  const recentOrdersForChart = await prisma.order.findMany({
    where: {
      createdAt: { gte: sevenDaysAgo },
    },
    select: {
      total: true,
      createdAt: true,
      status: true,
    },
  });

  // Initialize daily revenue and order data
  const dailyRevenueMap = new Map<string, number>();
  const dailyOrderMap = new Map<string, number>();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dayKey = format(date, "MMM d");
    dailyRevenueMap.set(dayKey, 0);
    dailyOrderMap.set(dayKey, 0);
  }

  // Aggregate revenue and orders by day
  recentOrdersForChart.forEach((order) => {
    const dayKey = format(new Date(order.createdAt), "MMM d");
    
    // Revenue (only for completed orders)
    if (["PROCESSING", "SHIPPED", "DELIVERED"].includes(order.status)) {
      const currentRevenue = dailyRevenueMap.get(dayKey) || 0;
      dailyRevenueMap.set(dayKey, currentRevenue + Number(order.total));
    }
    
    // Order count (all orders)
    const currentOrders = dailyOrderMap.get(dayKey) || 0;
    dailyOrderMap.set(dayKey, currentOrders + 1);
  });

  // Convert to array format for chart
  const dailyRevenueData = Array.from(dailyRevenueMap.entries()).map(([date, revenue]) => ({
    date,
    revenue,
  }));

  const dailyOrderData = Array.from(dailyOrderMap.entries()).map(([date, orders]) => ({
    date,
    orders,
  }));

  return {
    totalOrders,
    pendingOrders,
    processingOrders,
    shippedOrders,
    deliveredOrders,
    totalRevenue: Number(totalRevenue._sum.total || 0),
    todayRevenue: Number(todayRevenue._sum.total || 0),
    weekRevenue: Number(weekRevenue._sum.total || 0),
    monthRevenue: Number(monthRevenue._sum.total || 0),
    totalProducts,
    outOfStockProducts: outOfStockCount,
    lowStockProducts: lowStockCount,
    totalCustomers,
    recentOrders,
    dailyRevenueData,
    dailyOrderData,
    orderStatusCounts: orderStatusCounts.reduce(
      (acc, item) => {
        acc[item.status] = item._count.id;
        return acc;
      },
      {} as Record<string, number>
    ),
  };
}

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const stats = await getDashboardStats();

  return (
    <div className="max-w-7xl mx-auto w-full">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's what's happening with your store.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/orders?status=PENDING">
            <Button variant="outline" size="sm">
              View Pending Orders
            </Button>
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              KSh {stats.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              All time revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.pendingOrders} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Registered users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.lowStockProducts > 0 && (
                <span className="text-yellow-600 dark:text-yellow-400">
                  {stats.lowStockProducts} low stock
                </span>
              )}
              {stats.outOfStockProducts > 0 && (
                <span className="text-red-600 dark:text-red-400 ml-2">
                  {stats.outOfStockProducts} out of stock
                </span>
              )}
              {stats.lowStockProducts === 0 && stats.outOfStockProducts === 0 && "All in stock"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Charts */}
      <div className="mb-6">
        <RevenueChart 
          data={stats.dailyRevenueData} 
          orderData={stats.dailyOrderData}
          statusData={stats.orderStatusCounts}
        />
      </div>

      {/* Revenue Breakdown */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              KSh {stats.todayRevenue.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              KSh {stats.weekRevenue.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              KSh {stats.monthRevenue.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        {/* Order Status Overview */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PackageCheck className="h-5 w-5" />
              Order Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium">Pending</span>
              </div>
              <span className="font-bold">{stats.pendingOrders}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-950">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Processing</span>
              </div>
              <span className="font-bold">{stats.processingOrders}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50 dark:bg-purple-950">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Shipped</span>
              </div>
              <span className="font-bold">{stats.shippedOrders}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Delivered</span>
              </div>
              <span className="font-bold">{stats.deliveredOrders}</span>
            </div>
            <Link href="/admin/orders" className="block mt-4">
              <Button variant="outline" className="w-full" size="sm">
                View All Orders
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Recent Orders
            </CardTitle>
            <Link href="/admin/orders">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {stats.recentOrders.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No orders yet.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {stats.recentOrders.map((order) => {
                  const statusColors = {
                    PENDING: "bg-yellow-100 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-200",
                    PROCESSING: "bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200",
                    SHIPPED: "bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-200",
                    DELIVERED: "bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-200",
                    CANCELLED: "bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-200",
                  };

                  const orderDate = new Date(order.createdAt);
                  const formattedDate = format(orderDate, "MMM d, yyyy");
                  const formattedTime = format(orderDate, "h:mm a");

                  return (
                    <Link
                      key={order.id}
                      href={`/admin/orders/${order.id}`}
                      className="block p-4 rounded-lg border border-border/50 hover:bg-muted/50 dark:hover:bg-muted/30 hover:border-primary/30 transition-all active:scale-[0.98]"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                        {/* Left Section - Order Info */}
                        <div className="flex-1 min-w-0">
                          {/* Order Number and Status */}
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="font-semibold text-base text-foreground">
                              #{order.orderNumber}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-md text-xs font-medium shrink-0 ${
                                statusColors[order.status as keyof typeof statusColors] || ""
                              }`}
                            >
                              {order.status.charAt(0) +
                                order.status.slice(1).toLowerCase()}
                            </span>
                          </div>
                          
                          {/* Customer Name */}
                          <div className="mb-2">
                            <p className="text-sm font-medium text-foreground">
                              {order.user.name || order.user.email}
                            </p>
                          </div>
                          
                          {/* Date and Time - Stacked on mobile, inline on desktop */}
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs text-muted-foreground">
                            <span>{formattedDate}</span>
                            <span className="hidden sm:inline">•</span>
                            <span>{formattedTime}</span>
                            <span className="hidden sm:inline">•</span>
                            <span className="hidden sm:inline">
                              {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                            </span>
                          </div>
                          
                          {/* Items count - Mobile only */}
                          <div className="sm:hidden mt-1 text-xs text-muted-foreground">
                            {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                          </div>
                        </div>
                        
                        {/* Right Section - Amount and Arrow */}
                        <div className="flex items-start justify-between sm:justify-end gap-3 sm:flex-col sm:items-end">
                          <div className="text-right sm:text-right">
                            <p className="font-bold text-lg sm:text-xl text-foreground">
                              KSh {Number(order.total).toLocaleString()}
                            </p>
                            {/* Items count - Desktop only */}
                            <p className="hidden sm:block text-xs text-muted-foreground mt-1">
                              {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                            </p>
                          </div>
                          <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5 sm:mt-0" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alerts & Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Stock Alerts */}
        {(stats.lowStockProducts > 0 || stats.outOfStockProducts > 0) && (
          <Card className="border-yellow-200 dark:border-yellow-900 bg-yellow-50 dark:bg-yellow-950">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-900 dark:text-yellow-100">
                <AlertCircle className="h-5 w-5" />
                Stock Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats.outOfStockProducts > 0 && (
                  <div className="flex items-center justify-between p-2 rounded bg-red-100 dark:bg-red-900">
                    <span className="text-sm font-medium text-red-900 dark:text-red-100">
                      Out of Stock Products
                    </span>
                    <span className="font-bold text-red-900 dark:text-red-100">
                      {stats.outOfStockProducts}
                    </span>
                  </div>
                )}
                {stats.lowStockProducts > 0 && (
                  <div className="flex items-center justify-between p-2 rounded bg-yellow-100 dark:bg-yellow-900">
                    <span className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                      Low Stock Products
                    </span>
                    <span className="font-bold text-yellow-900 dark:text-yellow-100">
                      {stats.lowStockProducts}
                    </span>
                  </div>
                )}
              </div>
              <Link href="/admin/products" className="block mt-4">
                <Button variant="outline" size="sm" className="w-full">
                  Manage Products
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Pending Orders Alert */}
        {stats.pendingOrders > 0 && (
          <Card className="border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                <Clock className="h-5 w-5" />
                Attention Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-1">
                  {stats.pendingOrders}
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  {stats.pendingOrders === 1
                    ? "order is pending"
                    : "orders are pending"}
                </p>
              </div>
              <Link href="/admin/orders?status=PENDING" className="block">
                <Button variant="outline" size="sm" className="w-full">
                  Review Pending Orders
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

