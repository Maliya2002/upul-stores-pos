"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TextRevealProps {
  text: string;
  className?: string;
  delay?: number;
  staggerDelay?: number;
}

export function TextReveal({
  text,
  className,
  delay = 0,
  staggerDelay = 0.03,
}: TextRevealProps) {
  const words = text.split(" ");

  return (
    <motion.div className={cn("flex flex-wrap gap-x-1.5", className)}>
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          initial={{ opacity: 0, y: 15, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{
            duration: 0.4,
            delay: delay + i * staggerDelay,
            ease: "easeOut",
          }}
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
}