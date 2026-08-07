"use client";

import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  RotateCcw,
} from "lucide-react";
import { GradientCard } from "@/components/shared/gradient-card";
import { NumberTicker } from "@/components/animations/number-ticker";

interface SalesStatsProps {
  todayRevenue: number;
  todayOrders: number;
  monthRevenue: number;
  totalRefundAmount: number;
}

export function SalesStats({
  todayRevenue,
  todayOrders,
  monthRevenue,
  totalRefundAmount,
}: SalesStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <GradientCard
        title="Today's Revenue"
        value={<NumberTicker value={todayRevenue} prefix="Rs. " />}
        icon={DollarSign}
        gradient="bg-emerald-500/10"
        iconColor="text-emerald-500"
        delay={0}
      />

      <GradientCard
        title="Today's Orders"
        value={<NumberTicker value={todayOrders} />}
        icon={ShoppingCart}
        gradient="bg-blue-500/10"
        iconColor="text-blue-500"
        delay={0.1}
      />

      <GradientCard
        title="Monthly Revenue"
        value={<NumberTicker value={monthRevenue} prefix="Rs. " />}
        icon={TrendingUp}
        gradient="bg-purple-500/10"
        iconColor="text-purple-500"
        delay={0.2}
      />

      <GradientCard
        title="Total Refunds"
        value={
          <NumberTicker
            value={totalRefundAmount}
            prefix="Rs. "
            className="text-red-500"
          />
        }
        icon={RotateCcw}
        gradient="bg-red-500/10"
        iconColor="text-red-500"
        delay={0.3}
      />
    </div>
  );
}