"use client";

import { motion } from "framer-motion";
import { Brain, Sparkles } from "lucide-react";

export function AIHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl bg-linear-to-br from-violet-600 via-purple-700 to-fuchsia-700 p-8 text-white"
    >
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-fuchsia-400/20 blur-3xl" />

      <div className="relative flex items-start gap-4">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm"
        >
          <Brain className="h-8 w-8" />
        </motion.div>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-4 w-4 text-yellow-300" />
            <span className="text-sm font-medium text-purple-100">
              AI-Powered Analytics
            </span>
          </div>
          <h1 className="text-3xl font-black">Smart Insights</h1>
          <p className="text-purple-100 text-sm mt-1 max-w-xl">
            AI-driven recommendations to optimize your inventory, boost sales,
            and maximize profits.
          </p>
        </div>
      </div>
    </motion.div>
  );
}