"use client";

import React from "react";
import { ThemeProvider } from "./theme-provider";
import { SessionProvider } from "./session-provider";
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
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          duration={4000}
        />
      </ThemeProvider>
    </SessionProvider>
  );
}