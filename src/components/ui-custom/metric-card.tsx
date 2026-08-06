"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: React.ReactNode;
  icon: LucideIcon;
  iconClassName?: string;
  iconWrapperClassName?: string;
  change?: number;
  changeLabel?: string;
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  iconClassName,
  iconWrapperClassName,
  change,
  changeLabel = "vs last period",
}: MetricCardProps) {
  const isPositive = (change ?? 0) >= 0;

  return (
    <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
      <Card className="card-hover">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                {title}
              </p>
              <div className="text-2xl font-bold">{value}</div>
            </div>

            <div
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10",
                iconWrapperClassName
              )}
            >
              <Icon className={cn("h-5 w-5 text-primary", iconClassName)} />
            </div>
          </div>

          {typeof change === "number" && (
            <div className="mt-3 flex items-center gap-1">
              <span
                className={cn(
                  "inline-flex items-center text-xs font-semibold",
                  isPositive ? "text-emerald-500" : "text-red-500"
                )}
              >
                {isPositive ? (
                  <ArrowUpRight className="h-3.5 w-3.5" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5" />
                )}
                {Math.abs(change)}%
              </span>
              <span className="text-xs text-muted-foreground">
                {changeLabel}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}