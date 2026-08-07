"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GradientBgProps {
  className?: string;
  variant?: "blue" | "purple" | "green" | "sunset";
}

const gradients = {
  blue: [
    "bg-blue-500/20",
    "bg-cyan-500/15",
    "bg-indigo-500/10",
  ],
  purple: [
    "bg-purple-500/20",
    "bg-pink-500/15",
    "bg-violet-500/10",
  ],
  green: [
    "bg-emerald-500/20",
    "bg-teal-500/15",
    "bg-green-500/10",
  ],
  sunset: [
    "bg-orange-500/20",
    "bg-amber-500/15",
    "bg-red-500/10",
  ],
};

export function GradientBg({
  className,
  variant = "blue",
}: GradientBgProps) {
  const colors = gradients[variant];

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
    >
      <motion.div
        animate={{
          x: [0, 30, -20, 0],
          y: [0, -30, 20, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={cn(
          "absolute -top-1/2 -right-1/4 h-125 w-125 rounded-full blur-3xl",
          colors[0]
        )}
      />
      <motion.div
        animate={{
          x: [0, -40, 30, 0],
          y: [0, 40, -30, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={cn(
          "absolute -bottom-1/4 -left-1/4 h-100 w-100 rounded-full blur-3xl",
          colors[1]
        )}
      />
      <motion.div
        animate={{
          x: [0, 20, -30, 0],
          y: [0, -20, 40, 0],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={cn(
          "absolute top-1/2 left-1/2 h-75 w-75 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl",
          colors[2]
        )}
      />
    </div>
  );
}