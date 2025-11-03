"use client";

import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  BarChart3,
  PieChart as PieChartIcon,
} from "lucide-react";

interface RevenueChartProps {
  data: { date: string; revenue: number }[];
  orderData?: { date: string; orders: number }[];
  statusData?: Record<string, number>;
}

type ChartView = "revenue" | "orders" | "status";

const COLORS = {
  revenue: {
    primary: "#22c55e", // Green - matches Kenyan currency theme
    gradient: {
      start: "rgba(34, 197, 94, 0.3)", // Green with opacity
      end: "rgba(34, 197, 94, 0)", // Green with 0 opacity
    },
  },
  orders: {
    primary: "#3b82f6", // Blue
    gradient: {
      start: "rgba(59, 130, 246, 0.3)",
      end: "rgba(59, 130, 246, 0)",
    },
  },
  status: {
    PENDING: "#eab308",
    PROCESSING: "#3b82f6",
    SHIPPED: "#a855f7",
    DELIVERED: "#22c55e",
    CANCELLED: "#ef4444",
  },
};

export function RevenueChart({
  data,
  orderData = [],
  statusData = {},
}: RevenueChartProps) {
  const [chartView, setChartView] = useState<ChartView>("revenue");

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
    const avgDailyRevenue = totalRevenue / (data.length || 1);
    const maxRevenue = Math.max(...data.map((d) => d.revenue), 0);
    const minRevenue = Math.min(...data.filter((d) => d.revenue > 0).map((d) => d.revenue), maxRevenue);

    // Calculate trend (comparing last 3 days vs previous 3 days)
    const lastThreeDays = data.slice(-3).reduce((sum, d) => sum + d.revenue, 0);
    const prevThreeDays = data.slice(-6, -3).reduce((sum, d) => sum + d.revenue, 0);
    const trend = prevThreeDays > 0 
      ? ((lastThreeDays - prevThreeDays) / prevThreeDays) * 100 
      : 0;

    const totalOrders = orderData.reduce((sum, d) => sum + d.orders, 0);
    const avgDailyOrders = totalOrders / (orderData.length || 1);

    return {
      totalRevenue,
      avgDailyRevenue,
      maxRevenue,
      minRevenue,
      trend,
      totalOrders,
      avgDailyOrders,
    };
  }, [data, orderData]);

  // Format revenue data with better formatting
  const formattedData = useMemo(() => {
    return data.map((item) => ({
      ...item,
      revenueFormatted: `KSh ${item.revenue.toLocaleString()}`,
    }));
  }, [data]);

  // Format order data
  const formattedOrderData = useMemo(() => {
    return orderData.map((item) => ({
      ...item,
      ordersFormatted: `${item.orders} order${item.orders !== 1 ? "s" : ""}`,
    }));
  }, [orderData]);

  // Format status data for pie chart
  const statusChartData = useMemo(() => {
    return Object.entries(statusData)
      .filter(([_, count]) => count > 0)
      .map(([status, count]) => ({
        name: status.charAt(0) + status.slice(1).toLowerCase(),
        value: count,
        color: COLORS.status[status as keyof typeof COLORS.status] || "#6b7280",
      }));
  }, [statusData]);

  // Custom tooltip for revenue with smart colors
  const RevenueTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const value = Number(payload[0].value);
      const avg = metrics.avgDailyRevenue;
      
      // Determine color based on comparison to average
      let amountColor = "text-foreground";
      let statusText = "";
      let statusColor = "";
      
      if (avg > 0) {
        const diff = value - avg;
        const percentDiff = (diff / avg) * 100;
        const threshold = 5; // 5% threshold for "at average"
        
        if (percentDiff > threshold) {
          // Above average - teal/blue
          amountColor = "text-teal-600 dark:text-teal-400";
          statusText = `↑ ${percentDiff.toFixed(1)}% above average`;
          statusColor = "text-teal-600 dark:text-teal-400";
        } else if (percentDiff < -threshold) {
          // Below average - red
          amountColor = "text-red-600 dark:text-red-400";
          statusText = `↓ ${Math.abs(percentDiff).toFixed(1)}% below average`;
          statusColor = "text-red-600 dark:text-red-400";
        } else {
          // At average - yellow/orange
          amountColor = "text-yellow-600 dark:text-yellow-400";
          statusText = `≈ ${Math.abs(percentDiff).toFixed(1)}% from average`;
          statusColor = "text-yellow-600 dark:text-yellow-400";
        }
      }
      
      return (
        <div className="rounded-lg border bg-card p-3 shadow-lg backdrop-blur-sm">
          <p className="font-semibold text-sm mb-2 text-foreground">
            {data.date}
          </p>
          <div className="space-y-1">
            <p className={`font-bold text-base ${amountColor}`}>
              {data.revenueFormatted || `KSh ${value.toLocaleString()}`}
            </p>
            {avg > 0 && statusText && (
              <p className={`text-xs ${statusColor}`}>
                {statusText}
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for orders
  const OrderTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border bg-card p-3 shadow-lg backdrop-blur-sm">
          <p className="font-semibold text-sm mb-2 text-foreground">
            {data.date}
          </p>
          <p className="text-blue-600 dark:text-blue-400 font-bold text-base">
            {data.ordersFormatted || `${payload[0].value} order${Number(payload[0].value) !== 1 ? "s" : ""}`}
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for status pie chart
  const StatusTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="rounded-lg border bg-card p-3 shadow-lg backdrop-blur-sm">
          <p className="font-semibold text-sm mb-1 text-foreground">
            {data.name}
          </p>
          <p className="text-foreground font-bold text-base">
            {data.value} order{data.value !== 1 ? "s" : ""}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Metrics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Total Revenue</p>
                <p className="text-lg font-bold">
                  KSh {metrics.totalRevenue.toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Avg Daily</p>
                <p className="text-lg font-bold">
                  KSh {Math.round(metrics.avgDailyRevenue).toLocaleString()}
                </p>
              </div>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Total Orders</p>
                <p className="text-lg font-bold">{metrics.totalOrders}</p>
              </div>
              <ShoppingBag className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Trend</p>
                <p className={`text-lg font-bold flex items-center gap-1 ${
                  metrics.trend >= 0 
                    ? "text-green-600 dark:text-green-400" 
                    : "text-red-600 dark:text-red-400"
                }`}>
                  {metrics.trend >= 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  {Math.abs(metrics.trend).toFixed(1)}%
                </p>
              </div>
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart Tabs */}
      <Tabs value={chartView} onValueChange={(v) => setChartView(v as ChartView)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="revenue" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Revenue</span>
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Orders</span>
          </TabsTrigger>
          <TabsTrigger value="status" className="flex items-center gap-2">
            <PieChartIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Status</span>
          </TabsTrigger>
        </TabsList>

        {/* Revenue Chart */}
        <TabsContent value="revenue" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Revenue Trend (Last 7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full" style={{ height: "min(400px, 70vh)", minHeight: "300px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={formattedData}
                    margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                  >
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.revenue.primary} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={COLORS.revenue.primary} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      className="stroke-muted opacity-50" 
                    />
                    <XAxis
                      dataKey="date"
                      className="text-xs"
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis
                      className="text-xs"
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                      tickFormatter={(value) => {
                        if (value >= 1000000) return `KSh ${(value / 1000000).toFixed(1)}M`;
                        if (value >= 1000) return `KSh ${(value / 1000).toFixed(0)}K`;
                        return `KSh ${value}`;
                      }}
                      width={60}
                    />
                    <Tooltip content={<RevenueTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke={COLORS.revenue.primary}
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke={COLORS.revenue.primary}
                      strokeWidth={2}
                      dot={{ fill: COLORS.revenue.primary, r: 4 }}
                      activeDot={{ r: 6, fill: COLORS.revenue.primary }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Chart */}
        <TabsContent value="orders" className="mt-4">
          {orderData.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  Orders Trend (Last 7 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full" style={{ height: "min(400px, 70vh)", minHeight: "300px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={formattedOrderData}
                      margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                    >
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        className="stroke-muted opacity-50" 
                      />
                      <XAxis
                        dataKey="date"
                        className="text-xs"
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fill: "hsl(var(--muted-foreground))" }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis
                        className="text-xs"
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fill: "hsl(var(--muted-foreground))" }}
                        allowDecimals={false}
                        width={40}
                      />
                      <Tooltip content={<OrderTooltip />} />
                      <Bar
                        dataKey="orders"
                        fill={COLORS.orders.primary}
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No order data available</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Status Pie Chart */}
        <TabsContent value="status" className="mt-4">
          {statusChartData.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  Order Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full" style={{ height: "min(400px, 70vh)", minHeight: "300px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => 
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<StatusTooltip />} />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value, entry: any) => (
                          <span style={{ color: entry.color }}>
                            {value}: {entry.payload.value}
                          </span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No order status data available</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
