"use client";

import { motion } from "framer-motion";
import { type LucideIcon, PackageOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon = PackageOpen,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-20 px-4"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="mb-6 rounded-3xl bg-linear-to-br from-blue-500/10 to-purple-500/10 p-8 glow-sm"
      >
        <Icon className="h-12 w-12 text-primary/60" />
      </motion.div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button onClick={onAction} className="mt-6 rounded-xl shadow-lg">
            {actionLabel}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}