"use client";

import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

interface SlowItem {
  name: string;
  sku: string;
  quantity: number;
  lastSoldDays: number;
  value: number;
}

interface SlowMovingItemsProps {
  items: SlowItem[];
}

export function SlowMovingItems({ items }: SlowMovingItemsProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Clock className="h-4 w-4 text-amber-500" />
          Slow Moving Items
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No slow-moving items detected 👍
          </p>
        ) : (
          <div className="space-y-3">
            {items.slice(0, 6).map((item, i) => (
              <motion.div
                key={item.sku}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between rounded-xl border p-3"
              >
                <div>
                  <p className="text-sm font-semibold">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.quantity} units · {formatCurrency(item.value)} tied up
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {item.lastSoldDays}d idle
                </Badge>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}