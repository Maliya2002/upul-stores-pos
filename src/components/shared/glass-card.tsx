"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
}

export function GlassCard({
  children,
  className,
  delay = 0,
  hover = true,
}: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      whileHover={hover ? { y: -3 } : undefined}
      className={cn(
        "glass-card rounded-2xl p-6 transition-all duration-300",
        hover && "hover:shadow-xl hover:shadow-primary/5",
        className
      )}
    >
      {children}
    </motion.div>
  );
}