"use client";

import { Wallet, TrendingDown } from "lucide-react";
import { GradientCard } from "@/components/shared/gradient-card";
import { formatCurrency } from "@/lib/utils";

interface ExpenseStatsCardsProps {
  total: number;
  categoryCount: number;
}

export function ExpenseStatsCards({
  total,
  categoryCount,
}: ExpenseStatsCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <GradientCard
        title="Total Expenses"
        value={formatCurrency(total)}
        icon={Wallet}
        gradient="bg-red-500/10"
        iconColor="text-red-500"
      />
      <GradientCard
        title="Categories"
        value={String(categoryCount)}
        icon={TrendingDown}
        gradient="bg-purple-500/10"
        iconColor="text-purple-500"
        delay={0.1}
      />
    </div>
  );
}