"use client";

import { motion } from "framer-motion";
import { Heart, Code, ShoppingBag, ExternalLink } from "lucide-react";
import { siteConfig } from "@/config/site";
import Link from "next/link";

export function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="border-t bg-card/50 backdrop-blur-sm"
    >
      <div className="px-6 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Left — Brand */}
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-linear-to-br from-blue-500 to-purple-600">
              <ShoppingBag className="h-3 w-3 text-white" />
            </div>
            <span className="text-xs font-bold text-muted-foreground">
              © {new Date().getFullYear()} {siteConfig.name}
            </span>
            <span className="text-xs text-muted-foreground/50">•</span>
            <span className="text-xs text-muted-foreground/50">
              {siteConfig.description}
            </span>
          </div>

          {/* Center — Creator */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>Crafted with</span>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Heart className="h-3 w-3 text-red-500 fill-red-500" />
            </motion.div>
            <span>by</span>
            <span className="font-bold bg-linear-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              Malith Madushan
            </span>
          </div>

          {/* Right — Links & Version */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <Link
              href="/settings/system"
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <Code className="h-3 w-3" />
              v{siteConfig.version}
            </Link>

            <span className="text-muted-foreground/30">•</span>

            <Link
              href="/settings"
              className="hover:text-foreground transition-colors"
            >
              Settings
            </Link>

            <span className="text-muted-foreground/30">•</span>

            <Link
              href="/settings/backup"
              className="hover:text-foreground transition-colors"
            >
              Backup
            </Link>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}