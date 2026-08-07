"use client";

import { motion } from "framer-motion";

export function RouteLoader() {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        {/* Animated Logo */}
        <motion.div
          className="relative"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
          <div className="h-16 w-16 rounded-2xl bg-linear-to-br from-blue-500 to-purple-600 shadow-xl shadow-blue-500/30" />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-2xl bg-linear-to-br from-blue-500 to-purple-600 blur-xl"
          />
        </motion.div>

        {/* Loading dots */}
        <div className="flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -8, 0],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.15,
              }}
              className="h-2.5 w-2.5 rounded-full bg-primary"
            />
          ))}
        </div>

        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-sm font-medium text-muted-foreground"
        >
          Loading...
        </motion.p>
      </div>
    </div>
  );
}