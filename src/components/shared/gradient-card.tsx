"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

interface GradientCardProps {
  title: string;
  value: React.ReactNode;
  subtitle?: string;
  icon: LucideIcon;
  gradient: string;
  iconColor: string;
  delay?: number;
}

export function GradientCard({
  title,
  value,
  subtitle,
  icon: Icon,
  gradient,
  iconColor,
  delay = 0,
}: GradientCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="group relative overflow-hidden rounded-2xl border bg-card p-6 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5"
    >
      {/* Background gradient glow */}
      <div
        className={cn(
          "absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-10 blur-2xl transition-all duration-500 group-hover:opacity-20 group-hover:scale-150",
          gradient
        )}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="text-3xl font-black tracking-tight">{value}</div>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>

        <motion.div
          whileHover={{ rotate: 12, scale: 1.1 }}
          className={cn(
            "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl",
            gradient
          )}
        >
          <Icon className={cn("h-7 w-7", iconColor)} />
        </motion.div>
      </div>
    </motion.div>
  );
}