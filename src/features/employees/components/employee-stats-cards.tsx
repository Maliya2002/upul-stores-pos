"use client";

import { User, ShoppingCart, Calendar } from "lucide-react";
import { GradientCard } from "@/components/shared/gradient-card";

interface EmployeeStatsCardsProps {
  totalSales: number;
  attendanceCount: number;
  status: string;
}

export function EmployeeStatsCards({
  totalSales,
  attendanceCount,
  status,
}: EmployeeStatsCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <GradientCard
        title="Total Sales"
        value={String(totalSales)}
        icon={ShoppingCart}
        gradient="bg-blue-500/10"
        iconColor="text-blue-500"
      />
      <GradientCard
        title="Attendance Records"
        value={String(attendanceCount)}
        icon={Calendar}
        gradient="bg-emerald-500/10"
        iconColor="text-emerald-500"
        delay={0.1}
      />
      <GradientCard
        title="Status"
        value={status}
        icon={User}
        gradient="bg-purple-500/10"
        iconColor="text-purple-500"
        delay={0.2}
      />
    </div>
  );
}