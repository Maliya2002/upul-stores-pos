"use client";

import { useEffect, useCallback } from "react";

interface ShortcutConfig {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  callback: () => void;
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;

  const tag = target.tagName.toLowerCase();

  return (
    target.isContentEditable ||
    tag === "input" ||
    tag === "textarea" ||
    tag === "select"
  );
}

export function useKeyboardShortcut(shortcuts: ShortcutConfig[]) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!event || typeof event.key !== "string") return;

      // Input / textarea / editable areas වල shortcuts trigger නොවෙන්න
      if (isTypingTarget(event.target)) return;

      const eventKey = event.key.toLowerCase();

      for (const shortcut of shortcuts) {
        if (!shortcut?.key || typeof shortcut.key !== "string") continue;

        const shortcutKey = shortcut.key.toLowerCase();

        const ctrlMatch = shortcut.ctrlKey
          ? event.ctrlKey || event.metaKey
          : !event.ctrlKey && !event.metaKey;

        const shiftMatch = shortcut.shiftKey
          ? event.shiftKey
          : !event.shiftKey;

        const altMatch = shortcut.altKey ? event.altKey : !event.altKey;

        const keyMatch = eventKey === shortcutKey;

        if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
          event.preventDefault();
          shortcut.callback();
          break;
        }
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}