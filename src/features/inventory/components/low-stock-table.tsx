"use client";

import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface LowStockItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  minimumStock: number;
  category: string;
}

interface LowStockTableProps {
  items: LowStockItem[];
}

export function LowStockTable({ items }: LowStockTableProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Low & Out of Stock
          </CardTitle>
          <Badge variant="destructive" className="text-xs">
            {items.length} items
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            All products are well stocked! 🎉
          </p>
        ) : (
          <div className="space-y-3">
            {items.map((item, i) => {
              const percentage = Math.min(
                (item.quantity / item.minimumStock) * 100,
                100
              );
              const isOutOfStock = item.quantity === 0;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="rounded-xl border p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div>
                      <p className="text-sm font-semibold">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.category} · SKU: {item.sku}
                      </p>
                    </div>
                    <Badge
                      variant={isOutOfStock ? "destructive" : "secondary"}
                      className="text-xs shrink-0"
                    >
                      {isOutOfStock
                        ? "Out of Stock"
                        : `${item.quantity} / ${item.minimumStock}`}
                    </Badge>
                  </div>
                  <Progress
                    value={percentage}
                    className="h-2"
                  />
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}