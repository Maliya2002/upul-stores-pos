"use client";

import { useEffect, useRef, useState } from "react";
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
  const [hasAnimated, setHasAnimated] = useState(false);

  const spring = useSpring(0, {
    mass: 1,
    stiffness: 50,
    damping: 20,
    duration: duration * 1000,
  });

  const display = useTransform(spring, (val) => {
    const num = decimals > 0 ? val.toFixed(decimals) : Math.round(val);
    return `${prefix}${Number(num).toLocaleString()}${suffix}`;
  });

  useEffect(() => {
    if (isInView && !hasAnimated) {
      spring.set(value);
      setHasAnimated(true);
    }
  }, [isInView, hasAnimated, spring, value]);

  return (
    <motion.span ref={ref} className={cn("tabular-nums", className)}>
      {display}
    </motion.span>
  );
}