"use client";

import { useMounted } from "@/hooks/use-mounted";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SalesChartProps {
  data: { month: string; revenue: number; orders: number; expenses: number }[];
}

export function SalesChart({ data }: SalesChartProps) {
  const mounted = useMounted();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base font-bold">
          Revenue vs Expenses
        </CardTitle>
        <Badge variant="secondary" className="text-xs">
          Last 6 Months
        </Badge>
      </CardHeader>
      <CardContent>
        {!mounted ? (
          <div className="h-72 rounded-lg bg-muted/40 animate-pulse" />
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border"
                />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip
  contentStyle={{
    borderRadius: "12px",
    border: "1px solid hsl(var(--border))",
    background: "hsl(var(--card))",
  }}
  formatter={(value) => [
    `Rs. ${Number(value ?? 0).toLocaleString()}`,
    "",
  ]}
/>
                <Legend />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  name="Expenses"
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}