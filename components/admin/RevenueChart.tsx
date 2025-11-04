"use client";

import { useState, useMemo, useEffect } from "react";
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
  const [selectedDataPoint, setSelectedDataPoint] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Calculate metrics
  const metrics = useMemo(() => {
    // Ensure we have exactly 7 days of data (fill missing days with 0)
    const daysWithData = data.length;
    const expectedDays = 7;
    
    // Validate and ensure data contains daily values (not totals)
    // Each item should represent ONE day's revenue
    const validatedData = data.map((item) => ({
      ...item,
      revenue: Number(item.revenue) || 0, // Ensure it's a number
    }));
    
    // Calculate total revenue from validated daily data
    const totalRevenue = validatedData.reduce((sum, d) => sum + d.revenue, 0);
    
    // Calculate average daily revenue - always divide by 7 days for consistency
    // This ensures the average represents the true daily average over the period
    const avgDailyRevenue = expectedDays > 0 ? totalRevenue / expectedDays : 0;
    
    // Alternative: Calculate average only from days with revenue (more accurate for business metrics)
    const daysWithRevenue = validatedData.filter((d) => d.revenue > 0).length;
    const avgDailyRevenueFromActiveDays = daysWithRevenue > 0 
      ? totalRevenue / daysWithRevenue 
      : avgDailyRevenue;
    
    // Use the more conservative average (over all 7 days) for comparison
    // This prevents inflated percentages when most days have no revenue
    const maxRevenue = validatedData.length > 0 
      ? Math.max(...validatedData.map((d) => d.revenue), 0)
      : 0;
    const minRevenue = validatedData.length > 0
      ? Math.min(...validatedData.filter((d) => d.revenue > 0).map((d) => d.revenue), maxRevenue || Infinity)
      : 0;

    // Calculate trend (comparing last 3 days vs previous 3 days)
    const lastThreeDays = validatedData.slice(-3).reduce((sum, d) => sum + d.revenue, 0);
    const prevThreeDays = validatedData.length >= 6 
      ? validatedData.slice(-6, -3).reduce((sum, d) => sum + d.revenue, 0)
      : 0;
    const trend = prevThreeDays > 0 
      ? ((lastThreeDays - prevThreeDays) / prevThreeDays) * 100 
      : (lastThreeDays > 0 ? 100 : 0);

    const totalOrders = orderData.reduce((sum, d) => sum + (d.orders || 0), 0);
    const avgDailyOrders = expectedDays > 0 ? totalOrders / expectedDays : 0;

    return {
      totalRevenue,
      avgDailyRevenue, // Always over 7 days for consistent comparison
      avgDailyRevenueFromActiveDays, // Alternative metric for reference
      daysWithRevenue, // Number of days that had revenue
      maxRevenue,
      minRevenue,
      trend,
      totalOrders,
      avgDailyOrders,
    };
  }, [data, orderData]);

  // Format revenue data with better formatting and color indicators
  const formattedData = useMemo(() => {
    const avg = metrics.avgDailyRevenue;
    
    // Ensure we're working with the actual daily revenue values (not totals)
    return data.map((item, index) => {
      // Each item.revenue should be a SINGLE DAY's revenue, not a total
      const dailyRevenue = Number(item.revenue) || 0;
      
      // Get fresh values directly from metrics to avoid any closure issues
      const actualAvg = metrics.avgDailyRevenue;
      const actualDaily = dailyRevenue;
      
      // Calculate precise percentage difference using actual daily values vs daily average
      let percentDiff = 0;
      let status: "above" | "average" | "below" = "average";
      
      // Always use the 7-day average for comparison (divides total by 7, includes zeros)
      if (actualAvg > 0 && actualDaily > 0) {
        // Calculate revenue ratio first (most reliable check)
        const revenueRatio = actualDaily / actualAvg;
        
        // Calculate percentage difference
        const diff = actualDaily - actualAvg;
        percentDiff = (diff / actualAvg) * 100;
        
        // CRITICAL: Use revenue ratio as primary check - more reliable than percentage
        // Only mark as "average" if ratio is within 0.1% (0.999 to 1.001)
        if (revenueRatio >= 0.999 && revenueRatio <= 1.001) {
          status = "average";
        } else if (revenueRatio > 1.001) {
          status = "above";
        } else {
          status = "below";
        }
        
        // Debug: Log if we get unexpected "average" status
        if (status === "average" && revenueRatio > 1.5) {
          // This should never happen - force to above if ratio is > 1.5
          console.warn(`[RevenueChart] Unexpected: revenueRatio=${revenueRatio.toFixed(3)}, daily=${actualDaily}, avg=${actualAvg}, forcing to "above"`);
          status = "above";
        }
        
        // ALWAYS force correct status based on revenue ratio - don't trust initial status
        if (revenueRatio > 1.001) {
          status = "above";
        } else if (revenueRatio < 0.999) {
          status = "below";
        } else {
          status = "average";
        }
      } else if (actualDaily > 0 && actualAvg === 0) {
        // First day with revenue - definitely above
        status = "above";
        percentDiff = 100;
      } else if (actualDaily === 0 && actualAvg > 0) {
        // Day with no revenue when average exists - below average
        status = "below";
        percentDiff = -100;
      } else {
        // No revenue and no average - at average (zero)
        status = "average";
        percentDiff = 0;
      }
      
      return {
        ...item,
        revenue: dailyRevenue, // Ensure we use the actual daily value
        revenueFormatted: `KSh ${dailyRevenue.toLocaleString()}`,
        status,
        percentDiff: percentDiff, // Keep signed value for precise display
        absPercentDiff: Math.abs(percentDiff),
        isSelected: selectedDataPoint === index,
      };
    });
  }, [data, metrics.avgDailyRevenue, metrics.avgDailyRevenueFromActiveDays, selectedDataPoint]);

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
      
      // Get the revenue value - prefer data.revenue (from formattedData) over payload.value
      // formattedData has the correct revenue values with proper status calculations
      // CRITICAL: Use !== undefined check to preserve 0 values (not falsy)
      let value = 0;
      if (data.revenue !== undefined && data.revenue !== null) {
        value = Number(data.revenue);
      } else if (payload[0].value !== undefined && payload[0].value !== null) {
        value = Number(payload[0].value);
      }
      // Ensure NaN becomes 0
      if (isNaN(value)) value = 0;
      
      // Get fresh values directly from metrics (same as mobile breakdown)
      const actualAvg = metrics.avgDailyRevenue;
      const actualDaily = value;
      
      // Determine color based on comparison to average
      let amountColor = "text-foreground";
      let statusText = "";
      let statusColor = "";
      
      // Handle different cases based on revenue and average
      // CRITICAL: Check for zero revenue FIRST using strict equality, before any other checks
      // This must be checked BEFORE checking if actualDaily > 0
      if (actualDaily === 0) {
        if (actualAvg > 0) {
          // Day with no revenue when average exists - below average (100% below)
          amountColor = "text-red-600 dark:text-red-400";
          statusText = `↓ 100.00% below average`;
          statusColor = "text-red-600 dark:text-red-400";
        } else {
          // Both revenue and average are 0 - at average
          amountColor = "text-yellow-600 dark:text-yellow-400";
          statusText = `≈ At average`;
          statusColor = "text-yellow-600 dark:text-yellow-400";
        }
      } else if (actualDaily > 0 && actualAvg === 0) {
        // First day with revenue
        amountColor = "text-teal-600 dark:text-teal-400";
        statusText = `↑ First sale`;
        statusColor = "text-teal-600 dark:text-teal-400";
      } else if (actualAvg > 0 && actualDaily > 0) {
        // Calculate revenue ratio first (same logic as mobile breakdown)
        const revenueRatio = actualDaily / actualAvg;
        const actualDiff = actualDaily - actualAvg;
        const actualPercent = (actualDiff / actualAvg) * 100;
        
        // CRITICAL: Use revenue ratio as PRIMARY and ONLY check
        // Check above average FIRST (most common case)
        if (revenueRatio > 1.001) {
          // Above average - teal/blue
          amountColor = "text-teal-600 dark:text-teal-400";
          statusText = `↑ ${actualPercent.toFixed(2)}% above average`;
          statusColor = "text-teal-600 dark:text-teal-400";
        } 
        // Check below average second
        else if (revenueRatio < 0.999) {
          // Below average - red
          amountColor = "text-red-600 dark:text-red-400";
          statusText = `↓ ${Math.abs(actualPercent).toFixed(2)}% below average`;
          statusColor = "text-red-600 dark:text-red-400";
        } 
        // Only if truly within 0.1% of average
        else {
          // At average - yellow/orange (within 0.1%)
          amountColor = "text-yellow-600 dark:text-yellow-400";
          const absPercent = Math.abs(actualPercent);
          if (absPercent < 0.01) {
            statusText = `≈ At average`;
          } else {
            statusText = `≈ ${absPercent.toFixed(2)}% from average`;
          }
          statusColor = "text-yellow-600 dark:text-yellow-400";
        }
        
        // Final safety check - if ratio is way off but we somehow got "average", force correct status
        if (revenueRatio > 1.5 && statusText.includes("At average")) {
          amountColor = "text-teal-600 dark:text-teal-400";
          statusText = `↑ ${actualPercent.toFixed(2)}% above average`;
          statusColor = "text-teal-600 dark:text-teal-400";
        }
      } else {
        // No revenue and no average - both are 0
        amountColor = "text-yellow-600 dark:text-yellow-400";
        statusText = `≈ At average`;
        statusColor = "text-yellow-600 dark:text-yellow-400";
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
            {/* Show percentage whenever there's revenue data (average > 0 OR this day has revenue) */}
            {((actualAvg > 0) || (actualDaily > 0)) && statusText && (
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
                <p className="text-xs text-muted-foreground mb-1">Avg Daily (7 days)</p>
                <p className="text-lg font-bold">
                  KSh {Math.round(metrics.avgDailyRevenue).toLocaleString()}
                </p>
                {metrics.daysWithRevenue < 7 && metrics.daysWithRevenue > 0 && (
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {metrics.daysWithRevenue} active day{metrics.daysWithRevenue !== 1 ? 's' : ''}
                  </p>
                )}
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
              <div className="w-full h-[400px] min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%" minHeight={300} minWidth={0}>
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
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                      angle={isMobile ? -45 : -45}
                      textAnchor="end"
                      height={isMobile ? 80 : 60}
                      interval={isMobile ? 0 : "preserveStartEnd"}
                    />
                    <YAxis
                      className="text-xs"
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                      tickFormatter={(value) => {
                        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                        if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                        return `${value}`;
                      }}
                      width={isMobile ? 45 : 60}
                    />
                    <Tooltip 
                      content={<RevenueTooltip />}
                      cursor={{ stroke: COLORS.revenue.primary, strokeWidth: 1 }}
                      trigger={isMobile ? "click" : "hover"}
                    />
                    {/* Average line reference */}
                    {metrics.avgDailyRevenue > 0 && (
                      <Line
                        type="monotone"
                        dataKey={() => metrics.avgDailyRevenue}
                        stroke="hsl(var(--muted-foreground))"
                        strokeWidth={1}
                        strokeDasharray="5 5"
                        dot={false}
                        activeDot={false}
                        legendType="none"
                      />
                    )}
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke={COLORS.revenue.primary}
                      strokeWidth={isMobile ? 2 : 3}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                      onClick={(data: any, index: number) => {
                        if (isMobile) {
                          setSelectedDataPoint(selectedDataPoint === index ? null : index);
                        }
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke={COLORS.revenue.primary}
                      strokeWidth={isMobile ? 2 : 2}
                      dot={(props: any, index: number) => {
                        const { payload, cx, cy } = props;
                        const dataIndex = formattedData.findIndex((d) => d.date === payload.date);
                        const actualIndex = dataIndex !== -1 ? dataIndex : index;
                        const isSelected = selectedDataPoint === actualIndex;
                        const status = payload.status;
                        let dotColor = COLORS.revenue.primary;
                        if (status === "above") dotColor = "#14b8a6"; // teal
                        else if (status === "below") dotColor = "#ef4444"; // red
                        else dotColor = "#eab308"; // yellow
                        
                        return (
                          <circle
                            key={`dot-${actualIndex}-${payload.date}`}
                            cx={cx}
                            cy={cy}
                            r={isSelected ? 6 : 4}
                            fill={dotColor}
                            stroke={isSelected ? "#fff" : dotColor}
                            strokeWidth={isSelected ? 2 : 0}
                            style={{ cursor: "pointer" }}
                          />
                        );
                      }}
                      activeDot={{ r: 8, fill: COLORS.revenue.primary }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Mobile: Daily Breakdown - Last 7 Days Only */}
          <div className="lg:hidden mt-4">
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Last 7 Days</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-1.5">
                  {formattedData.slice(-7).map((item, index) => {
                    const actualIndex = formattedData.length - 7 + index;
                    const isSelected = selectedDataPoint === actualIndex;
                    
                    // Status styling
                    let statusColor = "text-muted-foreground";
                    let statusBg = "bg-muted/30";
                    let statusIcon = "≈";
                    let statusText = "";
                    
                    // Recalculate to ensure accuracy - use fresh values
                    const actualAvg = metrics.avgDailyRevenue;
                    const actualDaily = Number(item.revenue) || 0;
                    let actualStatus = item.status;
                    
                    // Safety check: Recalculate status if revenue is significantly different from average
                    if (actualAvg > 0 && actualDaily > 0) {
                      const revenueRatio = actualDaily / actualAvg;
                      
                      // If ratio is way off but status is "average", force correct status
                      if (revenueRatio > 1.001 && actualStatus === "average") {
                        actualStatus = "above";
                      } else if (revenueRatio < 0.999 && actualStatus === "average") {
                        actualStatus = "below";
                      }
                      
                      // Recalculate percentage for display
                      const actualDiff = actualDaily - actualAvg;
                      const actualPercent = (actualDiff / actualAvg) * 100;
                      const precisePercentDiff = actualPercent;
                      const absPercentDiff = Math.abs(actualPercent);
                      
                      // Show percentage whenever there's revenue data
                      if (actualStatus === "above") {
                        statusColor = "text-teal-600 dark:text-teal-400";
                        statusBg = "bg-teal-500/10";
                        statusIcon = "↑";
                        statusText = `${precisePercentDiff.toFixed(2)}%`;
                      } else if (actualStatus === "below") {
                        statusColor = "text-red-600 dark:text-red-400";
                        statusBg = "bg-red-500/10";
                        statusIcon = "↓";
                        statusText = `${absPercentDiff.toFixed(2)}%`;
                      } else {
                        statusColor = "text-yellow-600 dark:text-yellow-400";
                        statusBg = "bg-yellow-500/10";
                        // Show precise percentage even when close to average
                        if (absPercentDiff < 0.01) {
                          statusText = `At avg`;
                        } else {
                          statusText = `${absPercentDiff.toFixed(2)}%`;
                        }
                      }
                    } else if (item.revenue > 0 || metrics.avgDailyRevenue > 0) {
                      // Fallback to original calculation
                      const precisePercentDiff = item.percentDiff;
                      const absPercentDiff = item.absPercentDiff;
                      
                      if (item.status === "above") {
                        statusColor = "text-teal-600 dark:text-teal-400";
                        statusBg = "bg-teal-500/10";
                        statusIcon = "↑";
                        statusText = `${precisePercentDiff.toFixed(2)}%`;
                      } else if (item.status === "below") {
                        statusColor = "text-red-600 dark:text-red-400";
                        statusBg = "bg-red-500/10";
                        statusIcon = "↓";
                        statusText = `${Math.abs(precisePercentDiff).toFixed(2)}%`;
                      } else {
                        statusColor = "text-yellow-600 dark:text-yellow-400";
                        statusBg = "bg-yellow-500/10";
                        if (absPercentDiff < 0.01) {
                          statusText = `At avg`;
                        } else {
                          statusText = `${absPercentDiff.toFixed(2)}%`;
                        }
                      }
                    } else {
                      // No revenue data - show empty state
                      statusText = "";
                    }
                    
                    return (
                      <button
                        key={`daily-${actualIndex}-${item.date}`}
                        onClick={() => setSelectedDataPoint(isSelected ? null : actualIndex)}
                        className={`
                          w-full p-2.5 rounded-md text-left transition-all
                          ${isSelected ? "bg-primary/10 border border-primary/50" : "border border-border/50 hover:border-border"}
                          ${statusBg}
                        `}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span className="text-xs font-medium text-muted-foreground w-12 shrink-0">{item.date}</span>
                            <span className={`text-xs font-semibold ${statusColor} shrink-0`}>
                              {statusIcon} {statusText}
                            </span>
                            <span className={`text-sm font-semibold ${statusColor} ml-auto`}>
                              {item.revenueFormatted}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                
                {/* Minimal Average Reference */}
                {metrics.avgDailyRevenue > 0 && (
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Avg (7 days):</span>
                      <span className="font-semibold text-foreground">
                        KSh {Math.round(metrics.avgDailyRevenue).toLocaleString()}
                      </span>
                    </div>
                    {metrics.daysWithRevenue < 7 && metrics.daysWithRevenue > 0 && (
                      <div className="flex items-center justify-between text-xs mt-1">
                        <span className="text-muted-foreground">Active days:</span>
                        <span className="text-muted-foreground">
                          {metrics.daysWithRevenue} of 7
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
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
                <div className="w-full h-[400px] min-h-[300px]">
                  <ResponsiveContainer width="100%" height="100%" minHeight={300} minWidth={0}>
                    <BarChart
                      data={formattedOrderData}
                      margin={{ 
                        top: 10, 
                        right: isMobile ? 10 : 20, 
                        left: 0, 
                        bottom: isMobile ? 50 : 10 
                      }}
                    >
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        className="stroke-muted opacity-50" 
                      />
                      <XAxis
                        dataKey="date"
                        className="text-xs"
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                        angle={isMobile ? -45 : -45}
                        textAnchor="end"
                        height={isMobile ? 80 : 60}
                        interval={isMobile ? 0 : "preserveStartEnd"}
                      />
                      <YAxis
                        className="text-xs"
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                        allowDecimals={false}
                        width={isMobile ? 35 : 40}
                      />
                      <Tooltip 
                        content={<OrderTooltip />}
                        cursor={{ fill: COLORS.orders.primary, opacity: 0.1 }}
                        trigger={isMobile ? "click" : "hover"}
                      />
                      <Bar
                        dataKey="orders"
                        fill={COLORS.orders.primary}
                        radius={[8, 8, 0, 0]}
                        onClick={(data: any) => {
                          if (isMobile) {
                            // Show tooltip or highlight on mobile tap
                          }
                        }}
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
                <div className="w-full h-[400px] min-h-[300px]">
                  <ResponsiveContainer width="100%" height="100%" minHeight={300} minWidth={0}>
                    <PieChart>
                      <Pie
                        data={statusChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => 
                          isMobile 
                            ? `${(percent * 100).toFixed(0)}%`
                            : `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={isMobile ? 80 : 100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        content={<StatusTooltip />}
                        trigger={isMobile ? "click" : "hover"}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={isMobile ? 60 : 36}
                        wrapperStyle={{ fontSize: isMobile ? "12px" : "14px" }}
                        formatter={(value, entry: any) => (
                          <span style={{ color: entry.color }}>
                            {isMobile ? `${value} (${entry.payload.value})` : `${value}: ${entry.payload.value}`}
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
