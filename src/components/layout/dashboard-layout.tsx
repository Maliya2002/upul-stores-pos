"use client";

import React from "react";
import { Sidebar } from "./sidebar";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { useSidebar } from "@/hooks/use-sidebar";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const {
    isOpen,
    isMobile,
    isMobileOpen,
    isHydrated,
    toggle,
    closeMobile,
  } = useSidebar();

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        isOpen={isOpen}
        isMobile={isMobile}
        isMobileOpen={isMobileOpen}
        isHydrated={isHydrated}
        onToggle={toggle}
        onCloseMobile={closeMobile}
      />

      {/* Main Content */}
      {/* ✅ Hydration fix: server always renders lg:pl-70 */}
      <div
        className={cn(
          "flex min-h-screen flex-col transition-all duration-300",
          isHydrated
            ? !isMobile && (isOpen ? "lg:pl-70" : "lg:pl-20")
            : "lg:pl-70"
        )}
      >
        <Navbar
          onMenuClick={toggle}
          sidebarOpen={isOpen}
          isMobile={isMobile}
        />

        <motion.main
          key="main-content"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1 p-4 md:p-6"
        >
          {children}
        </motion.main>

        <Footer />
      </div>
    </div>
  );
}