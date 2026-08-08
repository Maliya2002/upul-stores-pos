"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Store,
  Receipt,
  Bell,
  Database,
  Monitor,
} from "lucide-react";
import { cn } from "@/lib/utils";

const settingsLinks = [
  { href: "/settings", label: "Store Profile", icon: Store },
  { href: "/settings/store", label: "Store Details", icon: Store },
  { href: "/settings/receipt", label: "Receipt Design", icon: Receipt },
  { href: "/settings/notifications", label: "Notifications", icon: Bell },
  { href: "/settings/backup", label: "Backup & Restore", icon: Database },
  { href: "/settings/system", label: "System Info", icon: Monitor },
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2">
      {settingsLinks.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link key={link.href} href={link.href}>
            <motion.div
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className={cn(
                "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-card border hover:bg-muted/50"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </motion.div>
          </Link>
        );
      })}
    </nav>
  );
}