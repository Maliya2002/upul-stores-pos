"use client";

import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

function getServerSnapshot() {
  return false;
}

export function useMounted(): boolean {
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    getServerSnapshot
  );
  return mounted;
}

export default useMounted;