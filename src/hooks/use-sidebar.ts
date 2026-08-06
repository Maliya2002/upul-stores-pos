"use client";

import { useState, useCallback, useEffect } from "react";

const SIDEBAR_STORAGE_KEY = "upul-pos-sidebar-open";

function saveSidebarState(value: boolean): void {
  try {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export function useSidebar() {
  // ✅ Server සහ Client දෙකෙහිම same initial values
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  useEffect(() => {
    // ✅ Client-only code - hydration වීමෙන් පසු run වේ
    setIsHydrated(true);

    const mobile = window.innerWidth < 1024;
    setIsMobile(mobile);

    if (mobile) {
      setIsOpen(false);
    } else {
      try {
        const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
        if (stored !== null) {
          setIsOpen(JSON.parse(stored) as boolean);
        }
      } catch {
        // ignore
      }
    }

    const handleResize = () => {
      const isMobileNow = window.innerWidth < 1024;
      setIsMobile(isMobileNow);
      if (isMobileNow) {
        setIsOpen(false);
        setIsMobileOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggle = useCallback(() => {
    setIsMobile((currentMobile) => {
      if (currentMobile) {
        setIsMobileOpen((prev) => !prev);
      } else {
        setIsOpen((prev) => {
          const next = !prev;
          saveSidebarState(next);
          return next;
        });
      }
      return currentMobile;
    });
  }, []);

  const closeMobile = useCallback(() => {
    setIsMobileOpen(false);
  }, []);

  return {
    isOpen,
    isMobile,
    isMobileOpen,
    isHydrated,
    toggle,
    closeMobile,
    setIsOpen,
  };
}