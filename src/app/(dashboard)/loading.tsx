"use client";

import { motion } from "framer-motion";

export default function DashboardLoading() {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="relative"
        >
          <div className="h-16 w-16 rounded-2xl bg-linear-to-br from-blue-500 to-purple-600 shadow-xl shadow-blue-500/30" />
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-2xl bg-linear-to-br from-blue-500 to-purple-600 blur-xl"
          />
        </motion.div>

        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -6, 0],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15,
              }}
              className="h-2 w-2 rounded-full bg-primary"
            />
          ))}
        </div>

        <p className="text-sm font-medium text-muted-foreground">
          Loading...
        </p>
      </div>
    </div>
  );
}