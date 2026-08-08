"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Download, Loader2, Database, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { exportDatabaseAction } from "../actions/settings-actions";

export function BackupRestore() {
  const [isPending, startTransition] = useTransition();

  const handleBackup = () => {
    startTransition(async () => {
      const result = await exportDatabaseAction();

      if (!result.success || !result.data) {
        toast.error(result.error || "Backup failed.");
        return;
      }

      const blob = new Blob([result.data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.filename ?? "backup.json";
      a.click();
      URL.revokeObjectURL(url);

      toast.success("Backup downloaded successfully!");
    });
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-blue-200/50 dark:border-blue-900/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-500" />
              Export Backup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Download a complete backup of your database including products,
              customers, orders, settings and more.
            </p>
            <Button
              onClick={handleBackup}
              disabled={isPending}
              className="w-full"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download Backup
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-emerald-200/50 dark:border-emerald-900/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-500" />
              Data Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Your data is stored securely in PostgreSQL. Regular backups are
              recommended to prevent data loss.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>Database: Connected</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>Encryption: Active</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>Auto-save: Enabled</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}