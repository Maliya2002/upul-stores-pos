"use client";

import { useCallback, useEffect, useState } from "react";

// Persist before sending; an uncertain network result must retain the same request.
export function usePendingRequest<T extends { requestKey: string }>(
  key: string | null,
) {
  const [pending, setPending] = useState<T | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    setReady(false);
    setPending(null);
    setError("");
    if (!key) return;
    try {
      const raw = sessionStorage.getItem(key);
      if (raw) {
        const saved = JSON.parse(raw);
        if (
          saved.version !== 1 ||
          !saved.data ||
          typeof saved.data.requestKey !== "string"
        )
          throw new Error("Invalid saved request");
        setPending(saved.data);
      }
      setReady(true);
    } catch {
      setError(
        "The saved transaction could not be read. Ask a manager to reconcile it before starting another transaction in this tab.",
      );
    }
  }, [key]);

  const save = useCallback(
    (request: T) => {
      if (!key || !ready) return false;
      try {
        sessionStorage.setItem(
          key,
          JSON.stringify({ version: 1, data: request }),
        );
        setPending(request);
        setError("");
        return true;
      } catch {
        setError(
          "Browser storage is unavailable. No new request was sent. Enable storage and retry.",
        );
        return false;
      }
    },
    [key, ready],
  );

  const clear = useCallback(() => {
    if (!key) return false;
    try {
      sessionStorage.removeItem(key);
      setPending(null);
      setError("");
      return true;
    } catch {
      setError(
        "The transaction was confirmed, but its recovery record could not be cleared. Retry the saved request; it will not create a second transaction.",
      );
      return false;
    }
  }, [key]);
  return { pending, ready, error, save, clear };
}
