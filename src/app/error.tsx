"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", damping: 12 }}
          className="flex justify-center mb-6"
        >
          <div className="rounded-full bg-destructive/10 p-6">
            <AlertTriangle className="h-14 w-14 text-destructive" />
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold mb-2">Something Went Wrong!</h2>
          <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
            An unexpected error occurred. Please try again or go back to
            dashboard.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button variant="outline" onClick={reset}>
              <RefreshCcw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Link href="/dashboard">
              <Button>
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}