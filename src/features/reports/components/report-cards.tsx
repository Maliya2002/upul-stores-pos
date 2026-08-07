"use client";

import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Wallet,
  Package,
  Users,
  AlertTriangle,
  Calendar,
} from "lucide-react";
import { GradientCard } from "@/components/shared/gradient-card";
import { NumberTicker } from "@/components/animations/number-ticker";

interface ReportCardsProps {
  todayRevenue: number;
  todayOrders: number;
  monthRevenue: number;
  monthProfit: number;
  monthExpenses: number;
  totalProducts: number;
  totalCustomers: number;
  lowStock: number;
}

export function ReportCards({
  todayRevenue,
  todayOrders,
  monthRevenue,
  monthProfit,
  monthExpenses,
  totalProducts,
  totalCustomers,
  lowStock,
}: ReportCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <GradientCard
        title="Today's Revenue"
        value={<NumberTicker value={todayRevenue} prefix="Rs. " />}
        subtitle={`${todayOrders} orders today`}
        icon={DollarSign}
        gradient="bg-emerald-500/10"
        iconColor="text-emerald-500"
        delay={0}
      />
      <GradientCard
        title="Monthly Revenue"
        value={<NumberTicker value={monthRevenue} prefix="Rs. " />}
        icon={TrendingUp}
        gradient="bg-blue-500/10"
        iconColor="text-blue-500"
        delay={0.1}
      />
      <GradientCard
        title="Monthly Profit"
        value={
          <NumberTicker
            value={monthProfit}
            prefix="Rs. "
            className={monthProfit >= 0 ? "text-emerald-500" : "text-red-500"}
          />
        }
        subtitle={`Expenses: Rs.${monthExpenses.toLocaleString()}`}
        icon={Wallet}
        gradient={monthProfit >= 0 ? "bg-emerald-500/10" : "bg-red-500/10"}
        iconColor={monthProfit >= 0 ? "text-emerald-500" : "text-red-500"}
        delay={0.2}
      />
      <GradientCard
        title="Low Stock Items"
        value={
          <NumberTicker
            value={lowStock}
            className={lowStock > 0 ? "text-amber-500" : ""}
          />
        }
        subtitle={`${totalProducts} products · ${totalCustomers} customers`}
        icon={AlertTriangle}
        gradient="bg-amber-500/10"
        iconColor="text-amber-500"
        delay={0.3}
      />
    </div>
  );
}