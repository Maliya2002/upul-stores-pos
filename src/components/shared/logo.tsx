"use client";

import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  collapsed?: boolean;
  className?: string;
}

export function Logo({ collapsed = false, className }: LogoProps) {
  return (
    <Link
      href="/dashboard"
      className={cn("flex items-center gap-3", className)}
    >
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-blue-600 to-purple-600 shadow-lg shadow-blue-500/25"
      >
        <ShoppingBag className="h-5 w-5 text-white" />
      </motion.div>

      {!collapsed && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col"
        >
          <span className="text-lg font-bold leading-tight bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Upul Stores
          </span>
          <span className="text-[10px] font-medium text-muted-foreground tracking-wider uppercase">
            Smart POS
          </span>
        </motion.div>
      )}
    </Link>
  );
}