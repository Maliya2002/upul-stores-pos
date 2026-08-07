"use client";

import { useMounted } from "@/hooks/use-mounted";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  type PieLabelRenderProps,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ExpenseChartProps {
  data: { category: string; amount: number; count: number }[];
}

const COLORS = [
  "#3b82f6",
  "#ef4444",
  "#f59e0b",
  "#10b981",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#f97316",
];

function renderCustomLabel(props: PieLabelRenderProps) {
  const percent = props.percent ?? 0;
  if (percent < 0.05) return null;
  return `${String(props.name ?? "")} ${(percent * 100).toFixed(0)}%`;
}

export function ExpenseChart({ data }: ExpenseChartProps) {
  const mounted = useMounted();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold">
          Expenses by Category
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!mounted ? (
          <div className="h-72 rounded-lg bg-muted/40 animate-pulse" />
        ) : data.length === 0 ? (
          <div className="h-72 flex items-center justify-center text-muted-foreground text-sm">
            No expense data available
          </div>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="amount"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={50}
                  paddingAngle={3}
                  label={renderCustomLabel}
                  labelLine={false}
                  fontSize={11}
                >
                  {data.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
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
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}