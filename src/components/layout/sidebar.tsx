"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/logo";
import { navigationConfig, type NavItem } from "@/config/navigation";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

/* ─── Types ──────────────────────────────────────────── */

interface SidebarProps {
  isOpen: boolean;
  isMobile: boolean;
  isMobileOpen: boolean;
  isHydrated: boolean;
  onToggle: () => void;
  onCloseMobile: () => void;
}

interface SidebarInnerProps {
  collapsed: boolean;
  isOpen: boolean;
  isMobile: boolean;
  isHydrated: boolean;
  onToggle: () => void;
  onCloseMobile: () => void;
}

/* ─── Sidebar Inner Content ───────────────────────────── */

function SidebarInnerContent({
  collapsed,
  isOpen,
  isMobile,
  isHydrated,
  onToggle,
  onCloseMobile,
}: SidebarInnerProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b shrink-0">
        <Logo collapsed={collapsed} />
        {/* ✅ isHydrated වීමෙන් පසු පමණක් show කරන්න */}
        {isHydrated && !isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={onToggle}
          >
            {isOpen ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <TooltipProvider>
          <nav className="px-3 space-y-5">
            {navigationConfig.map((group, groupIndex) => (
              <div key={groupIndex}>
                {!collapsed && (
                  <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                    {group.label}
                  </p>
                )}
                {collapsed && groupIndex > 0 && (
                  <Separator className="mb-3" />
                )}
                <div className="space-y-0.5">
                  {group.items.map((item) => (
                    <SidebarItem
                      key={item.href}
                      item={item}
                      collapsed={collapsed}
                      onNavigate={isMobile ? onCloseMobile : undefined}
                    />
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </TooltipProvider>
      </ScrollArea>

      {/* User */}
      <div className="border-t p-3 shrink-0">
        <div
          className={cn(
            "flex items-center gap-3 rounded-xl p-2.5 hover:bg-muted/60 transition-colors cursor-pointer",
            collapsed && "justify-center p-2"
          )}
        >
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="bg-linear-to-br from-blue-500 to-purple-600 text-white text-xs font-bold">
              UA
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">Upul Admin</p>
                <p className="text-xs text-muted-foreground truncate">
                  Owner
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
              >
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Sidebar ────────────────────────────────────── */

export function Sidebar({
  isOpen,
  isMobile,
  isMobileOpen,
  isHydrated,
  onToggle,
  onCloseMobile,
}: SidebarProps) {
  // ✅ Hydration fix: server + client initial state same විය යුතුයි
  // Server: isOpen=true, isMobile=false → collapsed=false
  // Client after hydration: correct values use කරයි
  const collapsed = isHydrated ? (!isOpen && !isMobile) : false;

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isHydrated && isMobile && isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={onCloseMobile}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isHydrated && isMobile && isMobileOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 250 }}
            className="fixed left-0 top-0 z-50 h-full w-70 border-r bg-background shadow-2xl lg:hidden"
          >
            <SidebarInnerContent
              collapsed={false}
              isOpen={isOpen}
              isMobile={true}
              isHydrated={isHydrated}
              onToggle={onToggle}
              onCloseMobile={onCloseMobile}
            />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      {/* ✅ Hydration fix: initial width always 280 on server */}
      <motion.aside
        initial={false}
        animate={{
          width: isHydrated ? (isOpen ? 280 : 80) : 280,
        }}
        transition={{ type: "spring", damping: 20, stiffness: 200 }}
        className="hidden lg:flex fixed left-0 top-0 z-30 h-full flex-col border-r bg-background overflow-hidden"
      >
        <SidebarInnerContent
          collapsed={collapsed}
          isOpen={isOpen}
          isMobile={false}
          isHydrated={isHydrated}
          onToggle={onToggle}
          onCloseMobile={onCloseMobile}
        />
      </motion.aside>
    </>
  );
}

/* ─── Sidebar Item ────────────────────────────────────── */

interface SidebarItemProps {
  item: NavItem;
  collapsed: boolean;
  onNavigate?: () => void;
}

function SidebarItem({ item, collapsed, onNavigate }: SidebarItemProps) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  const isActive =
    pathname === item.href ||
    (item.href !== "/dashboard" && pathname.startsWith(item.href));

  const ItemInner = (
    <motion.div
      whileTap={{ scale: 0.97 }}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 cursor-pointer w-full",
        isActive
          ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        collapsed && "justify-center px-2 py-2.5"
      )}
    >
      <item.icon className="h-4.5 w-4.5 shrink-0" />
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{item.title}</span>
          {item.badge && (
            <Badge
              className={cn(
                "h-5 px-1.5 text-[10px] font-semibold ml-auto",
                item.badge === "Live" &&
                  "bg-emerald-500/15 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/15",
                item.badge === "New" &&
                  "bg-blue-500/15 text-blue-600 border-blue-500/20 hover:bg-blue-500/15",
                !["Live", "New"].includes(item.badge) &&
                  "bg-red-500/15 text-red-500 border-red-500/20 hover:bg-red-500/15"
              )}
              variant="outline"
            >
              {item.badge}
            </Badge>
          )}
          {hasChildren && (
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 shrink-0 transition-transform duration-200",
                expanded && "rotate-180"
              )}
            />
          )}
        </>
      )}
    </motion.div>
  );

  /* Collapsed + Tooltip */
  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger>
          <Link href={item.href} onClick={onNavigate}>
            {ItemInner}
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" className="flex items-center gap-2">
          {item.title}
          {item.badge && (
            <Badge variant="secondary" className="text-[10px] h-4">
              {item.badge}
            </Badge>
          )}
        </TooltipContent>
      </Tooltip>
    );
  }

  /* Accordion */
  if (hasChildren) {
    return (
      <div>
        <div onClick={() => setExpanded(!expanded)}>{ItemInner}</div>
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="ml-3 mt-0.5 pl-3 border-l-2 border-border space-y-0.5 py-1">
                {item.children!.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                      pathname === child.href
                        ? "bg-accent text-accent-foreground font-medium"
                        : "text-muted-foreground hover:bg-accent/60 hover:text-accent-foreground"
                    )}
                  >
                    <child.icon className="h-3.5 w-3.5 shrink-0" />
                    {child.title}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  /* Simple Link */
  return (
    <Link href={item.href} onClick={onNavigate}>
      {ItemInner}
    </Link>
  );
}