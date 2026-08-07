"use client";

import { motion } from "framer-motion";

export function LoadingBar() {
  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-1">
      <motion.div
        initial={{ width: "0%" }}
        animate={{ width: "100%" }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="h-full bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 rounded-r-full shadow-lg shadow-blue-500/50"
      />
    </div>
  );
}