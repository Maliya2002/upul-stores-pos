"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface MouseGlowProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  glowSize?: number;
}

export function MouseGlow({
  children,
  className,
  glowColor = "rgba(59, 130, 246, 0.08)",
  glowSize = 400,
}: MouseGlowProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      container.style.setProperty("--glow-x", `${x}px`);
      container.style.setProperty("--glow-y", `${y}px`);
    };

    container.addEventListener("mousemove", handleMouseMove);
    return () => container.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
      style={
        {
          "--glow-color": glowColor,
          "--glow-size": `${glowSize}px`,
        } as React.CSSProperties
      }
    >
      <div
        className="pointer-events-none absolute opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(var(--glow-size) circle at var(--glow-x) var(--glow-y), var(--glow-color), transparent 40%)`,
          inset: 0,
        }}
      />
      {children}
    </div>
  );
}