"use client";

import { motion } from "framer-motion";
import {
  Package,
  Layers,
  AlertTriangle,
  XCircle,
  ArrowDownToLine,
  ArrowUpFromLine,
  RotateCcw,
  Activity,
} from "lucide-react";
import { GradientCard } from "@/components/shared/gradient-card";
import { NumberTicker } from "@/components/animations/number-ticker";

interface StockOverviewCardsProps {
  totalProducts: number;
  totalStock: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalMovements: number;
}

export function StockOverviewCards({
  totalProducts,
  totalStock,
  lowStockItems,
  outOfStockItems,
  totalMovements,
}: StockOverviewCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <GradientCard
        title="Total Products"
        value={<NumberTicker value={totalProducts} />}
        subtitle={`${totalStock.toLocaleString()} total units`}
        icon={Package}
        gradient="bg-blue-500/10"
        iconColor="text-blue-500"
        delay={0}
      />

      <GradientCard
        title="Low Stock"
        value={
          <NumberTicker
            value={lowStockItems}
            className={lowStockItems > 0 ? "text-amber-500" : ""}
          />
        }
        subtitle="Below minimum level"
        icon={AlertTriangle}
        gradient="bg-amber-500/10"
        iconColor="text-amber-500"
        delay={0.1}
      />

      <GradientCard
        title="Out of Stock"
        value={
          <NumberTicker
            value={outOfStockItems}
            className={outOfStockItems > 0 ? "text-red-500" : ""}
          />
        }
        subtitle="Need immediate reorder"
        icon={XCircle}
        gradient="bg-red-500/10"
        iconColor="text-red-500"
        delay={0.2}
      />

      <GradientCard
        title="Stock Movements"
        value={<NumberTicker value={totalMovements} />}
        subtitle="Total transactions"
        icon={Activity}
        gradient="bg-purple-500/10"
        iconColor="text-purple-500"
        delay={0.3}
      />
    </div>
  );
}