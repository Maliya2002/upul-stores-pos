"use client";

import { useMounted } from "@/hooks/use-mounted";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProfitChartProps {
  data: {
    month: string;
    revenue: number;
    expenses: number;
    profit: number | null;
    cost: number | null;
  }[];
}

export function ProfitChart({ data }: ProfitChartProps) {
  const mounted = useMounted();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold">
          Estimated Monthly Profit / Loss
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-3 text-xs text-muted-foreground">
          Profit excludes allocated sales tax and recorded costs and expenses.
          Missing cost or return details produce gaps, not zero profit.
        </p>
        {!mounted ? (
          <div className="h-72 rounded-lg bg-muted/40 animate-pulse" />
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
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
                <Bar
                  dataKey="revenue"
                  name="Net receipts (incl. tax)"
                  fill="#3b82f6"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="expenses"
                  name="Expenses"
                  fill="#ef4444"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="cost"
                  name="Net item cost"
                  fill="#f59e0b"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="profit"
                  name="Profit"
                  fill="#10b981"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
