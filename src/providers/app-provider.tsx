"use client";

import React from "react";
import { ThemeProvider } from "./theme-provider";
import { SessionProvider } from "./session-provider";
import { SmoothScrollProvider } from "@/components/animations/smooth-scroll";
import { Toaster } from "sonner";

interface AppProviderProps {
  children: React.ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <SmoothScrollProvider>
          {children}
          <Toaster
            position="top-right"
            richColors
            closeButton
            duration={4000}
            toastOptions={{
              className: "glass-card",
            }}
          />
        </SmoothScrollProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}