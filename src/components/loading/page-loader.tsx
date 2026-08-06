"use client";

import { motion } from "framer-motion";

export function PageLoader() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex h-screen items-center justify-center"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-black text-primary">U</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground animate-pulse font-medium">
          Loading Upul Stores...
        </p>
      </div>
    </motion.div>
  );
}