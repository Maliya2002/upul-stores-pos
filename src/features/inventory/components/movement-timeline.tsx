"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MovementRow } from "./movement-columns";

interface MovementTimelineProps {
  movements: MovementRow[];
}

const typeIcons: Record<string, string> = {
  PURCHASE: "📥",
  SALE: "📤",
  ADJUSTMENT: "🔧",
  TRANSFER: "🔄",
  DAMAGED: "💥",
  EXPIRED: "⏰",
  RETURN: "↩️",
};

export function MovementTimeline({ movements }: MovementTimelineProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold">
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {movements.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No stock movements yet.
          </p>
        ) : (
          <div className="space-y-4">
            {movements.slice(0, 8).map((movement, i) => (
              <motion.div
                key={movement.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex gap-3"
              >
                <div className="flex flex-col items-center">
                  <span className="text-lg">
                    {typeIcons[movement.type] ?? "📦"}
                  </span>
                  {i < movements.slice(0, 8).length - 1 && (
                    <div className="mt-1 h-full w-px bg-border" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{movement.product}</p>
                    <Badge variant="outline" className="text-[10px]">
                      {movement.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {movement.beforeQty} → {movement.afterQty} (
                    {movement.quantity} units)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {movement.createdAt}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}