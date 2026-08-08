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
import { useAuth } from "@/hooks/use-auth";

/* ─── Types ──────────────────────────────────── */

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

/* ─── Sidebar Inner ──────────────────────────── */

function SidebarInnerContent({
  collapsed,
  isOpen,
  isMobile,
  isHydrated,
  onToggle,
  onCloseMobile,
}: SidebarInnerProps) {
  const { user, logout } = useAuth();

  const userName = user?.name ?? "User";
  const userRole = user?.role ?? "CASHIER";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b shrink-0">
        <Logo collapsed={collapsed} />
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
                  <motion.p
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: groupIndex * 0.05 }}
                    className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/50"
                  >
                    {group.label}
                  </motion.p>
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

      {/* User Section */}
      <div className="border-t p-3 shrink-0">
        <motion.div
          whileHover={{ scale: collapsed ? 1 : 1.01 }}
          className={cn(
            "flex items-center gap-3 rounded-2xl p-2.5 transition-all cursor-pointer",
            "bg-linear-to-br from-blue-500/5 to-purple-500/5",
            "hover:from-blue-500/10 hover:to-purple-500/10",
            "border border-transparent hover:border-primary/10",
            collapsed && "justify-center p-2"
          )}
        >
          <Avatar className="h-9 w-9 shrink-0 ring-2 ring-primary/20">
            <AvatarFallback className="bg-linear-to-br from-blue-500 to-purple-600 text-white text-xs font-black">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{userName}</p>
                <p className="text-[10px] text-muted-foreground truncate font-medium">
                  {userRole}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                onClick={logout}
              >
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}

/* ─── Main Sidebar ───────────────────────────── */

export function Sidebar({
  isOpen,
  isMobile,
  isMobileOpen,
  isHydrated,
  onToggle,
  onCloseMobile,
}: SidebarProps) {
  const collapsed = isHydrated ? !isOpen && !isMobile : false;

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

/* ─── Sidebar Item ───────────────────────────── */

interface SidebarItemProps {
  item: NavItem;
  collapsed: boolean;
  onNavigate?: () => void;
}

function SidebarItem({ item, collapsed, onNavigate }: SidebarItemProps) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  // Check if current path matches this item or any of its children
  const isExactMatch = pathname === item.href;
const isParentMatch =
  item.href !== "/dashboard" &&
  item.href.length > 1 &&
  pathname.startsWith(item.href + "/");

const isActive = isExactMatch || isParentMatch;

 const isChildActive = hasChildren
  ? item.children!.some(
      (child) =>
        pathname === child.href ||
        (child.href.length > 1 && pathname.startsWith(child.href + "/"))
    )
  : false;

  const isHighlighted = isActive || isChildActive;

  // Auto expand if child is active
  React.useEffect(() => {
    if (isChildActive && !expanded) {
      setExpanded(true);
    }
  }, [isChildActive, expanded]);

  const ItemContent = (
    <motion.div
      whileTap={{ scale: 0.97 }}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer w-full",
        isHighlighted
          ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        collapsed && "justify-center px-2 py-2.5"
      )}
    >
      {/* Active indicator glow */}
      {isHighlighted && (
        <motion.div
          layoutId="sidebar-active"
          className="absolute inset-0 rounded-xl bg-primary opacity-100"
          style={{ zIndex: -1 }}
          transition={{ type: "spring", duration: 0.4 }}
        />
      )}

      <item.icon className="h-4.5 w-4.5 shrink-0" />

      {!collapsed && (
        <>
          <span className="flex-1 truncate">{item.title}</span>
          {item.badge && (
            <Badge
              className={cn(
                "h-5 px-1.5 text-[10px] font-bold ml-auto",
                isHighlighted
                  ? "bg-white/20 text-white border-white/30"
                  : item.badge === "Live"
                    ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/20"
                    : item.badge === "AI"
                      ? "bg-violet-500/15 text-violet-600 border-violet-500/20"
                      : "bg-red-500/15 text-red-500 border-red-500/20"
              )}
              variant="outline"
            >
              {item.badge}
            </Badge>
          )}
          {hasChildren && (
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 shrink-0 transition-transform duration-300",
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
            {ItemContent}
          </Link>
        </TooltipTrigger>
        <TooltipContent
          side="right"
          className="flex items-center gap-2 font-medium"
        >
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

  /* Has children — Accordion */
  if (hasChildren) {
    return (
      <div>
        <div onClick={() => setExpanded(!expanded)}>{ItemContent}</div>
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="ml-4 mt-1 pl-3 border-l-2 border-primary/20 space-y-0.5 py-1">
                {item.children!.map((child) => {
                  const childActive =
                    pathname === child.href ||
                    pathname.startsWith(child.href + "/");

                  return (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={onNavigate}
                    >
                      <motion.div
                        whileHover={{ x: 2 }}
                        className={cn(
                          "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-150",
                          childActive
                            ? "bg-primary/10 text-primary font-semibold"
                            : "text-muted-foreground hover:bg-accent/60 hover:text-accent-foreground"
                        )}
                      >
                        <child.icon className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{child.title}</span>

                        {childActive && (
                          <motion.div
                            layoutId="child-active"
                            className="ml-auto h-1.5 w-1.5 rounded-full bg-primary"
                          />
                        )}
                      </motion.div>
                    </Link>
                  );
                })}
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
      {ItemContent}
    </Link>
  );
}