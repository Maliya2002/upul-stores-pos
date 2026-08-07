"use client";

import { motion } from "framer-motion";

export function PageLoader() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex h-screen items-center justify-center bg-background"
    >
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="h-20 w-20 rounded-2xl bg-linear-to-br from-blue-500 to-purple-600 shadow-2xl shadow-blue-500/30"
          />
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-2xl bg-linear-to-br from-blue-500 to-purple-600 blur-xl"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-black text-white">U</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -6, 0],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.1,
              }}
              className="h-2 w-2 rounded-full bg-primary"
            />
          ))}
        </div>

        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-sm font-semibold text-muted-foreground"
        >
          Loading Upul Stores...
        </motion.p>
      </div>
    </motion.div>
  );
}