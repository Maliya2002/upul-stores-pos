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
} from "recharts";
import { ChartCard } from "./chart-card";

interface SalesPoint {
  name: string;
  sales: number;
  orders: number;
}

interface SalesOverviewChartProps {
  data: SalesPoint[];
}

export function SalesOverviewChart({ data }: SalesOverviewChartProps) {
  const mounted = useMounted();

  return (
    <ChartCard
      title="Sales Overview"
      description="Weekly sales performance"
    >
      {!mounted ? (
        <div className="h-72 rounded-lg bg-muted/40 animate-pulse" />
      ) : (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="hsl(221.2 83.2% 53.3%)"
                fill="hsl(221.2 83.2% 53.3% / 0.15)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
}