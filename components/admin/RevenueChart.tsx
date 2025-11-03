"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

interface RevenueChartProps {
  data: { date: string; revenue: number }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1000);
  const tickInterval = Math.ceil(maxRevenue / 5);

  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="date"
          className="text-xs"
          stroke="hsl(var(--muted-foreground))"
        />
        <YAxis
          className="text-xs"
          stroke="hsl(var(--muted-foreground))"
          tickFormatter={(value) => `KSh ${(value / 1000).toFixed(0)}K`}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border bg-card p-3 shadow-lg">
                  <p className="font-semibold text-sm mb-1">{payload[0].payload.date}</p>
                  <p className="text-primary font-bold">
                    KSh {Number(payload[0].value).toLocaleString()}
                  </p>
                </div>
              );
            }
            return null;
          }}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#3b82f6"
          strokeWidth={3}
          fillOpacity={1}
          fill="url(#colorRevenue)"
        />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#3b82f6"
          strokeWidth={3}
          dot={{ fill: "#3b82f6", r: 5 }}
          activeDot={{ r: 7 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

