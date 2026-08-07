"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

interface TopProductsChartProps {
  data: { name: string; unitsSold: number; revenue: number }[];
}

export function TopProductsChart({ data }: TopProductsChartProps) {
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base font-bold">
          Top Selling Products
        </CardTitle>
        <Badge variant="secondary" className="text-xs">
          All Time
        </Badge>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground text-sm">
            No sales data yet
          </div>
        ) : (
          <div className="space-y-4">
            {data.map((product, i) => (
              <motion.div
                key={product.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-black text-primary">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-semibold">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.unitsSold} units sold
                      </p>
                    </div>
                  </div>
                  <span className="font-bold">
                    {formatCurrency(product.revenue)}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(product.revenue / maxRevenue) * 100}%`,
                    }}
                    transition={{ duration: 0.8, delay: 0.3 + i * 0.05 }}
                    className="h-full rounded-full bg-linear-to-r from-blue-500 to-purple-500"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}