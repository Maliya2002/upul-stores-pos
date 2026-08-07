"use client";

import { useEffect, useRef, useCallback } from "react";

interface UseBarcodeScanner {
  onScan: (barcode: string) => void;
  enabled?: boolean;
}

export function useBarcodeScanner({
  onScan,
  enabled = true,
}: UseBarcodeScanner) {
  const buffer = useRef("");
  const timeout = useRef<NodeJS.Timeout | null>(null);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      if (event.key === "Enter") {
        if (buffer.current.length >= 3) {
          onScan(buffer.current.trim());
        }
        buffer.current = "";
        return;
      }

      if (event.key.length === 1) {
        buffer.current += event.key;

        if (timeout.current) clearTimeout(timeout.current);
        timeout.current = setTimeout(() => {
          buffer.current = "";
        }, 100);
      }
    },
    [onScan, enabled]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}