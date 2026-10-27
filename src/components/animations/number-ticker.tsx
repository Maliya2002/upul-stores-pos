"use client";

import { useEffect, useRef } from "react";
import { motion, useInView, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface NumberTickerProps {
  value: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
}

export function NumberTicker({
  value,
  className,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 2,
}: NumberTickerProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const spring = useSpring(0, {
    mass: 1,
    stiffness: 50,
    damping: 20,
    duration: duration * 1000,
  });

  const display = useTransform(spring, (val) => {
    const num = decimals > 0 ? val.toFixed(decimals) : Math.round(val);
    return `${prefix}${Number(num).toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`;
  });

  useEffect(() => {
    if (isInView) {
      spring.set(value);
    }
  }, [isInView, spring, value]);

  return (
    <motion.span ref={ref} className={cn("tabular-nums", className)}>
      {display}
    </motion.span>
  );
}
